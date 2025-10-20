from flask import Flask, render_template, jsonify, request, send_from_directory, session, redirect, url_for
from flask_cors import CORS
import os.path
import os
import pandas as pd
import traceback
from datetime import datetime
from collections import Counter
import sys
import io
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Import cấu hình và tiện ích
from config import MODEL_PATH, VECTORIZER_PATH, DATA_FILE, FLASK_CONFIG
from utils import logger, login_required, handle_error, get_service_safely

# Import các module xử lý
from naive_bayes import train_model, classify_email, preprocess_text, load_stopwords
from gmail_oauth import (
    get_authorization_url, get_credentials_from_code, get_gmail_service,
    get_emails, move_to_spam, move_to_inbox, send_email, mark_as_read,
    delete_email, get_mailbox_stats
)

# Thiết lập hỗ trợ UTF-8 cho stdout và stderr nếu cần thiết
if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper) or getattr(sys.stdout, 'encoding', '').lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer') and not isinstance(sys.stderr, io.TextIOWrapper) or getattr(sys.stderr, 'encoding', '').lower() != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Thiết lập Flask và CORS
app = Flask(__name__, static_folder='vite-frontend/dist/assets', template_folder='vite-frontend/dist')
CORS(app, supports_credentials=True)

# Áp dụng cấu hình từ file config.py
for key, value in FLASK_CONFIG.items():
    app.config[key] = value

# Biến toàn cục cho model và vectorizer
MODEL, VECTORIZER = None, None

def initialize_model(csv_file=DATA_FILE):
    """Khởi tạo model và vectorizer một lần duy nhất.

    Args:
        csv_file: str - Đường dẫn tới file dữ liệu huấn luyện

    Returns:
        tuple - (model, vectorizer) đã khởi tạo
    """
    global MODEL, VECTORIZER
    if MODEL is None or VECTORIZER is None:
        try:
            MODEL, VECTORIZER = train_model(csv_file)
        except Exception as e:
            logger.error(f"Lỗi khởi tạo mô hình: {str(e)}")
            raise
    return MODEL, VECTORIZER

# Route đăng nhập với Google OAuth
@app.route('/login')
def login():
    """Chuyển hướng người dùng đến trang xác thực Google."""
    try:
        # Tạo URL xác thực
        authorization_url = get_authorization_url()
        if not authorization_url:
            return jsonify({'error': 'Không thể tạo URL xác thực'}), 500

        # Chuyển hướng đến trang xác thực Google
        return redirect(authorization_url)
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi tạo URL xác thực")
        return jsonify(error_info), 500

# Route xử lý callback từ Google OAuth
@app.route('/oauth2callback')
def oauth2callback():
    """Xử lý callback từ Google OAuth."""
    try:
        logger.info(f"OAuth callback received params: {request.args}")

        # Kiểm tra xem có lỗi không
        if 'error' in request.args:
            error_msg = request.args.get('error')
            logger.error(f"OAuth error: {error_msg}")
            return jsonify({'error': f'Lỗi xác thực OAuth: {error_msg}'}), 400

        # Kiểm tra state để ngăn CSRF (bỏ qua nếu không có state trong session)
        if 'state' in session and request.args.get('state') != session.get('state'):
            logger.warning("State mismatch - có thể là CSRF attempt")
            return redirect('/login')

        # Lấy credentials từ authorization code
        code = request.args.get('code')
        if not code:
            return jsonify({'error': 'Không nhận được mã xác thực'}), 400

        credentials = get_credentials_from_code(code)
        if not credentials:
            return jsonify({'error': 'Không thể lấy thông tin xác thực'}), 500

        # Lưu credentials vào session
        from gmail_oauth import save_credentials
        save_credentials(credentials)

        # Lấy thông tin người dùng
        service = get_gmail_service()
        if not service:
            return jsonify({'error': 'Không thể kết nối đến Gmail API'}), 500

        user_info = service.users().getProfile(userId='me').execute()

        # Lưu thông tin người dùng vào session
        session['user'] = {
            'email': user_info['emailAddress'],
            'username': user_info['emailAddress'].split('@')[0]
        }
        logger.info(f"Đăng nhập thành công: {session['user']['email']}")

        # Chuyển hướng về trang chủ
        return redirect('/')
    except Exception as e:
        error_info = handle_error(e, "Lỗi trong OAuth callback")
        return jsonify(error_info), 500

# API đăng nhập (giữ lại cho tương thích ngược)
@app.route('/api/login', methods=['POST'])
def api_login():
    """API đăng nhập người dùng (legacy)."""
    # Chuyển hướng đến đăng nhập OAuth
    return jsonify({
        'success': False,
        'redirect': True,
        'message': 'Sử dụng đăng nhập Google',
        'url': url_for('login', _external=True)
    })

# API đăng ký (giữ lại cho tương thích ngược)
@app.route('/api/register', methods=['POST'])
def register():
    """API đăng ký người dùng mới (legacy)."""
    # Chuyển hướng đến đăng nhập OAuth
    return jsonify({
        'success': False,
        'redirect': True,
        'message': 'Sử dụng đăng nhập Google',
        'url': url_for('login', _external=True)
    })

# API đăng xuất
@app.route('/api/logout', methods=['POST'])
def logout():
    """API đăng xuất người dùng."""
    try:
        # Xóa thông tin người dùng và credentials khỏi session
        session.pop('user', None)
        session.pop('credentials', None)
        session.pop('state', None)
        return jsonify({'success': True, 'message': 'Đăng xuất thành công'})
    except Exception as e:
        print(f"Lỗi đăng xuất: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# API kiểm tra trạng thái đăng nhập
@app.route('/api/check-auth')
def check_auth():
    """API kiểm tra trạng thái đăng nhập."""
    try:
        if 'credentials' in session and 'user' in session:
            # Kiểm tra xem credentials còn hợp lệ không
            service = get_gmail_service()
            if service:
                return jsonify({
                    'authenticated': True,
                    'username': session['user']['username'],
                    'email': session['user']['email']
                })

        # Nếu không có credentials hoặc không hợp lệ
        return jsonify({'authenticated': False})
    except Exception as e:
        error_info = handle_error(e, "Lỗi kiểm tra đăng nhập")
        return jsonify({'authenticated': False, 'error': error_info['error']})

@app.route('/emails')
@login_required
def get_emails_route():
    """API lấy và phân loại email."""
    try:
        max_results = request.args.get('max', 20, type=int)
        search_query = request.args.get('q', '')
        page_token = request.args.get('pageToken', None)

        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        # Lấy email từ INBOX
        result = get_emails(service, max_results, search_query, page_token, label_ids=['INBOX'])

        # Kiểm tra lỗi từ kết quả
        if 'error' in result:
            return jsonify({'error': result['error']}), 500

        # Trả về kết quả
        return jsonify({
            'emails': result['emails'],
            'nextPageToken': result['nextPageToken']
        })
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi lấy emails")
        return jsonify(error_info), 500

@app.route('/mark_spam', methods=['POST'])
@login_required
def mark_spam():
    """API để đánh dấu email là spam."""
    try:
        data = request.json
        email_id = data.get('email_id')

        if not email_id:
            return jsonify({'error': 'ID email không được cung cấp'}), 400

        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        # Chuyển email vào thư mục spam
        success = move_to_spam(service, email_id)

        if not success:
            return jsonify({'error': 'Không thể đánh dấu email là spam'}), 500

        # Thêm email vào tập dữ liệu huấn luyện nếu có nội dung
        try:
            subject = data.get('subject', '')
            content = data.get('content', '')

            if content:
                MODEL, VECTORIZER = initialize_model()
                add_to_dataset_internal('spam', content, subject)
                logger.info(f"Đã thêm email vào dataset spam: {subject}")
        except Exception as e:
            logger.warning(f"Lỗi khi thêm vào dataset: {str(e)}")
            # Không trả về lỗi để cho phép hoàn thành đánh dấu spam

        return jsonify({'success': True})
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi đánh dấu email là spam")
        return jsonify(error_info), 500

@app.route('/mark_not_spam', methods=['POST'])
@login_required
def mark_not_spam():
    """API để bỏ đánh dấu email là spam."""
    try:
        data = request.json
        email_id = data.get('email_id')

        if not email_id:
            return jsonify({'error': 'ID email không được cung cấp'}), 400

        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        # Chuyển email ra khỏi thư mục spam
        success = move_to_inbox(service, email_id)

        if not success:
            return jsonify({'error': 'Không thể bỏ đánh dấu email là spam'}), 500

        # Thêm email vào tập dữ liệu huấn luyện nếu có nội dung
        try:
            subject = data.get('subject', '')
            content = data.get('content', '')

            if content:
                MODEL, VECTORIZER = initialize_model()
                add_to_dataset_internal('ham', content, subject)
                logger.info(f"Đã thêm email vào dataset ham: {subject}")
        except Exception as e:
            logger.warning(f"Lỗi khi thêm vào dataset: {str(e)}")
            # Không trả về lỗi để cho phép hoàn thành bỏ đánh dấu spam

        return jsonify({'success': True})
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi bỏ đánh dấu email là spam")
        return jsonify(error_info), 500

# API endpoint for stats - no template rendering needed

@app.route('/api/list-mailboxes')
@login_required
def list_mailboxes_route():
    """API để liệt kê tất cả các thư mục trong Gmail."""
    try:
        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        # Lấy danh sách thư mục
        labels = service.users().labels().list(userId='me').execute().get('labels', [])
        mailboxes = [label['name'] for label in labels]
        return jsonify({'mailboxes': mailboxes})
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi liệt kê thư mục")
        return jsonify(error_info), 500

@app.route('/api/stats')
@login_required
def get_stats():
    """API lấy thống kê về email."""
    try:
        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        model, vectorizer = initialize_model()

        # Lấy thống kê hộp thư
        stats = get_mailbox_stats(service)
        inbox_count = stats['inbox_count']
        spam_count = stats['spam_count']

        # Lấy email từ cả INBOX và SPAM
        inbox_emails_result = get_emails(service, 100, label_ids=['INBOX'])
        spam_emails_result = get_emails(service, 100, label_ids=['SPAM'])
        spam_emails = spam_emails_result['emails']

        # Kết hợp danh sách email
        recent_emails = inbox_emails_result['emails'] + spam_emails
        recent_spam_detected = sum(1 for email in recent_emails if email['classification'] == 'spam')

        confidence_levels = {'high': 0, 'medium': 0, 'low': 0}
        for email in recent_emails:
            if email['classification'] == 'spam':
                if email['confidence'] > 90:
                    confidence_levels['high'] += 1
                elif email['confidence'] > 70:
                    confidence_levels['medium'] += 1
                else:
                    confidence_levels['low'] += 1

        data = pd.read_csv('spam_data.csv')
        training_size = len(data)
        X = data['text'].apply(preprocess_text)
        y = data['label']
        _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_test_vec = vectorizer.transform(X_test)
        y_pred = model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)

        # Tính các chỉ số hiệu suất
        precision = precision_score(y_test, y_pred, pos_label='spam')
        recall = recall_score(y_test, y_pred, pos_label='spam')
        f1 = f1_score(y_test, y_pred, pos_label='spam')
        conf_matrix = confusion_matrix(y_test, y_pred, labels=['ham', 'spam']).tolist()

        # Đã loại bỏ chức năng biểu đồ xu hướng theo thời gian

        # Phân tích các mẫu spam phổ biến dựa trên dữ liệu thực
        spam_df = data[data['label'] == 'spam']

        # Tìm các mẫu phổ biến trong tiêu đề và nội dung email spam
        common_patterns = [
            'khuyến mãi', 'trúng thưởng', 'thanh toán', 'tài khoản', 'cập nhật',
            'miễn phí', 'giảm giá', 'quà tặng', 'khẩn cấp', 'xác nhận', 'hết hạn'
        ]

        # Đếm các mẫu spam phổ biến
        pattern_counts = {}
        for text in spam_df['text']:
            text_lower = str(text).lower()
            for pattern in common_patterns:
                if pattern in text_lower:
                    pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1

        # Chuyển đổi thành danh sách các mẫu và tần suất
        spam_patterns = []
        for pattern, count in sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            # Chuyển đổi pattern thành dạng tiêu đề (viết hoa chữ cái đầu)
            formatted_pattern = ' '.join(word.capitalize() for word in pattern.split())
            spam_patterns.append({
                'pattern': formatted_pattern,
                'frequency': count
            })

        # Nếu không có đủ dữ liệu, thêm các mẫu mặc định
        if len(spam_patterns) < 5:
            default_patterns = [
                {'pattern': 'Khuyến mãi đặc biệt', 'frequency': 35},
                {'pattern': 'Trúng thưởng', 'frequency': 28},
                {'pattern': 'Thanh toán gấp', 'frequency': 22},
                {'pattern': 'Tài khoản bị khóa', 'frequency': 18},
                {'pattern': 'Cập nhật thông tin', 'frequency': 15}
            ]
            # Thêm các mẫu mặc định vào danh sách nếu cần
            for pattern in default_patterns:
                if len(spam_patterns) < 5 and not any(p['pattern'] == pattern['pattern'] for p in spam_patterns):
                    spam_patterns.append(pattern)

        # Phân tích từ khóa phổ biến trong spam sử dụng stopwords.txt
        import re

        # Lấy danh sách stopwords từ file
        stopwords = load_stopwords('stopwords.txt')

        # Đếm các từ xuất hiện trong spam
        words = []
        for text in spam_df['text']:
            words.extend(re.findall(r'\b\w+\b', str(text).lower()))

        # Lọc bỏ stopwords từ file
        filtered_words = [word for word in words if word not in stopwords and len(word) > 2]

        # Lấy top từ khóa phổ biến
        common_keywords = Counter(filtered_words).most_common(10)
        common_keywords = [{'word': word, 'count': count} for word, count in common_keywords]

        last_training = None
        if os.path.exists(MODEL_PATH):
            timestamp = os.path.getmtime(MODEL_PATH)
            last_training = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({
            'inbox_count': inbox_count,
            'spam_count': spam_count,
            'recent_emails': len(recent_emails),
            'recent_spam_detected': recent_spam_detected,
            'confidence_levels': confidence_levels,
            'training_size': training_size,
            'test_accuracy': f"{accuracy*100:.2f}%",
            'last_training': last_training,
            # Thêm dữ liệu mới
            'model_metrics': {
                'accuracy': round(accuracy * 100, 2),
                'precision': round(precision * 100, 2),
                'recall': round(recall * 100, 2),
                'f1_score': round(f1 * 100, 2),
                'confusion_matrix': conf_matrix
            },
            'spam_patterns': spam_patterns,
            'common_keywords': common_keywords
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/retrain', methods=['POST'])
@login_required
def retrain_model():
    """API để huấn luyện lại mô hình."""
    try:
        # Import cần thiết
        from config import PIPELINE_PATH

        # Xóa file pipeline cũ để buộc huấn luyện lại
        if os.path.exists(PIPELINE_PATH):
            os.remove(PIPELINE_PATH)
            logger.info(f"Đã xóa pipeline cũ: {PIPELINE_PATH}")

        # Xóa các file cũ nếu tồn tại (để dọn dẹp)
        old_files = [MODEL_PATH, VECTORIZER_PATH]
        for file_path in old_files:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Đã dọn dẹp file cũ: {file_path}")

        # Đảm bảo thư mục images tồn tại
        images_dir = 'images'
        if not os.path.exists(images_dir):
            os.makedirs(images_dir)

        # Reset biến global để buộc huấn luyện lại
        global MODEL, VECTORIZER
        MODEL, VECTORIZER = None, None

        # Huấn luyện lại mô hình
        MODEL, VECTORIZER = train_model(DATA_FILE)
        logger.info("Đã huấn luyện lại mô hình thành công")

        # Kiểm tra xem các file đã được tạo chưa
        pipeline_created = os.path.exists(PIPELINE_PATH)
        model_perf_path = os.path.join(images_dir, 'model_performance.png')
        confusion_matrix_path = os.path.join(images_dir, 'confusion_matrix.png')
        images_created = os.path.exists(model_perf_path) and os.path.exists(confusion_matrix_path)

        if pipeline_created:
            logger.info(f"Đã lưu pipeline mới tại: {PIPELINE_PATH}")

        if images_created:
            logger.info(f"Đã lưu biểu đồ hiệu suất mô hình tại: {model_perf_path}")
            logger.info(f"Đã lưu ma trận nhầm lẫn tại: {confusion_matrix_path}")
        else:
            logger.warning("Không thể tạo các biểu đồ hiệu suất mô hình và ma trận nhầm lẫn")

        return jsonify({
            'success': True,
            'message': 'Đã huấn luyện lại mô hình thành công',
            'pipeline_saved': pipeline_created,
            'images_saved': images_created,
            'performance_image': '/images/model_performance.png' if images_created else None,
            'confusion_matrix_image': '/images/confusion_matrix.png' if images_created else None
        })
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi huấn luyện lại mô hình")
        return jsonify(error_info), 500

# API endpoints for spam and analyzer - no template rendering needed

@app.route('/spam_emails')
@login_required
def get_spam_emails_route():
    """API lấy danh sách email đã bị đánh dấu là spam."""
    try:
        max_results = request.args.get('max', 20, type=int)
        search_query = request.args.get('q', '')
        page_token = request.args.get('pageToken', None)

        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        result = get_emails(service, max_results, search_query, page_token, label_ids=['SPAM'])
        return jsonify({
            'emails': result['emails'],
            'nextPageToken': result['nextPageToken']
        })
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi lấy email spam")
        return jsonify(error_info), 500

@app.route('/mark_read', methods=['POST'])
@login_required
def mark_read():
    """API để đánh dấu email là đã đọc."""
    try:
        data = request.json
        email_id = data.get('email_id')

        if not email_id:
            return jsonify({'error': 'ID email không được cung cấp'}), 400

        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        success = mark_as_read(service, email_id)

        if not success:
            return jsonify({'error': 'Không thể đánh dấu email là đã đọc'}), 500

        return jsonify({'success': True})
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi đánh dấu email là đã đọc")
        return jsonify(error_info), 500

@app.route('/delete_email', methods=['POST'])
@login_required
def delete_email_route():
    """API để xóa vĩnh viễn email."""
    try:
        data = request.json
        email_id = data.get('email_id')

        if not email_id:
            return jsonify({'error': 'ID email không được cung cấp'}), 400

        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        success = delete_email(service, email_id)
        return jsonify({'success': success})
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi xóa email")
        return jsonify(error_info), 500

@app.route('/analyze_text', methods=['POST'])
@login_required
def analyze_text():
    """API để phân tích nội dung email."""
    try:
        data = request.json
        subject = data.get('subject', '')
        content = data.get('content', '')

        if not content:
            return jsonify({'error': 'Nội dung email không được để trống'}), 400

        model, vectorizer = initialize_model()
        result = classify_email(model, vectorizer, content, subject)

        return jsonify({
            'classification': result['classification'],
            'confidence': result['confidence'],
            'top_keywords': result.get('top_keywords', []),
            'email_stats': result.get('email_stats', {})
        })
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi phân tích nội dung email")
        return jsonify(error_info), 500

@app.route('/send_email', methods=['POST'])
@login_required
def send_email_route():
    """API để gửi email mới."""
    try:
        data = request.json
        to = data.get('to')
        subject = data.get('subject')
        body = data.get('body')

        if not all([to, subject, body]):
            return jsonify({'error': 'Thiếu thông tin cần thiết'}), 400

        # Lấy Gmail service an toàn
        service = get_service_safely()
        if not service:
            return jsonify({'error': 'Lỗi xác thực, vui lòng đăng nhập lại'}), 401

        success = send_email(service, to, subject, body)
        return jsonify({'success': success})
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi gửi email")
        return jsonify(error_info), 500

def add_to_dataset_internal(label, content, subject=''):
    """Thêm dữ liệu vào tập huấn luyện và huấn luyện lại mô hình nếu cần.

    Args:
        label: str - Nhãn của dữ liệu (spam/ham)
        content: str - Nội dung email
        subject: str - Tiêu đề email (mặc định là rỗng)

    Returns:
        dict - Kết quả thực hiện
    """
    # Khai báo biến global ở đầu hàm
    global MODEL, VECTORIZER

    try:
        # Tạo nội dung đầy đủ
        full_text = f"{subject}\n{content}" if subject else content

        # Đọc file dữ liệu
        df = pd.read_csv(DATA_FILE)

        # Kiểm tra xem dữ liệu đã tồn tại chưa
        existing_index = df[df['text'] == full_text].index

        if len(existing_index) > 0:
            # Dữ liệu đã tồn tại, kiểm tra nhãn
            existing_label = df.loc[existing_index[0], 'label']

            if existing_label == label:
                # Nếu nhãn giống nhau, không cho phép thêm
                return {
                    'success': False,
                    'message': f'Dữ liệu đã tồn tại với nhãn {label}',
                    'existing_label': existing_label
                }
            else:
                # Nếu nhãn khác nhau, cập nhật nhãn
                df.loc[existing_index[0], 'label'] = label
                df.to_csv(DATA_FILE, index=False)

                # Huấn luyện lại mô hình
                MODEL, VECTORIZER = train_model(DATA_FILE)

                return {
                    'success': True,
                    'message': f'Đã cập nhật nhãn từ {existing_label} thành {label}',
                    'updated': True,
                    'old_label': existing_label,
                    'new_label': label
                }
        else:
            # Dữ liệu chưa tồn tại, thêm mới
            new_data = pd.DataFrame({'label': [label], 'text': [full_text]})
            df = pd.concat([df, new_data], ignore_index=True)
            df.to_csv(DATA_FILE, index=False)

            # Huấn luyện lại mô hình
            MODEL, VECTORIZER = train_model(DATA_FILE)

            return {
                'success': True,
                'message': f'Đã thêm dữ liệu vào tập huấn luyện với nhãn {label}'
            }
    except Exception as e:
        logger.error(f"Lỗi khi thêm dữ liệu vào tập huấn luyện: {str(e)}")
        return {'success': False, 'error': str(e)}

@app.route('/add_to_dataset', methods=['POST'])
@login_required
def add_to_dataset():
    """API để thêm dữ liệu vào tập huấn luyện."""
    try:
        data = request.json
        subject = data.get('subject', '')
        content = data.get('content', '')
        label = data.get('label')

        if not content or not label:
            return jsonify({'error': 'Thiếu nội dung hoặc nhãn'}), 400

        # Sử dụng hàm add_to_dataset_internal đã tạo trước đó
        result = add_to_dataset_internal(label, content, subject)

        if not result['success']:
            if 'existing_label' in result and result['existing_label'] == label:
                # Nếu dữ liệu đã tồn tại với cùng nhãn
                return jsonify({
                    'success': False,
                    'message': result['message'],
                    'existing_label': result['existing_label']
                }), 400
            elif 'error' in result:
                # Nếu có lỗi khác
                return jsonify({'error': result['error']}), 500

        # Trả về kết quả thành công
        return jsonify(result)
    except Exception as e:
        error_info = handle_error(e, "Lỗi khi thêm dữ liệu vào tập huấn luyện")
        return jsonify(error_info), 500

# Serve Vite App - Must be the last routes to avoid catching API calls
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve the Vite app for all routes except API endpoints."""
    if path != "" and os.path.exists(os.path.join(app.template_folder, path)):
        return send_from_directory(app.template_folder, path)
    return render_template('index.html')

if __name__ == '__main__':
    # Sử dụng port 5001 để tránh xung đột với AirPlay
    app.run(debug=True, host='0.0.0.0', port=5001)