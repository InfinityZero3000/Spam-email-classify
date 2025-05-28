import re
import os
import pandas as pd
import joblib
import unicodedata
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import seaborn as sns
import numpy as np
from underthesea import word_tokenize
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, precision_score, recall_score, f1_score
from config import MODEL_PATH, VECTORIZER_PATH, PIPELINE_PATH, STOPWORDS_FILE
from utils import logger

# Đọc danh sách stopwords từ file
def load_stopwords(file_path=STOPWORDS_FILE):
    """Đọc danh sách từ khóa stopwords từ file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            stopwords = set(word.strip() for word in f.readlines())
        return stopwords
    except Exception as e:
        logger.error(f"Lỗi khi đọc file stopwords: {e}")
        return set()

STOPWORDS = load_stopwords()

def preprocess_text(text):
    """Tiền xử lý văn bản cho tiếng Việt.

    Args:
        text: str - Văn bản cần xử lý

    Returns:
        str - Văn bản đã được xử lý
    """
    if not isinstance(text, str):
        return ""

    # Loại bỏ thẻ HTML
    text = re.sub(r'<[^>]+>', '', text)
    # Chuẩn hóa URL, email, số điện thoại
    text = re.sub(r'http[s]?://\S+', 'URL', text)
    text = re.sub(r'\S+@\S+', 'EMAIL', text)
    text = re.sub(r'\b\d{10,11}\b', 'PHONE', text)

    # Chuẩn hóa dấu tiếng Việt sử dụng NFC
    text = unicodedata.normalize('NFC', text)

    # Chuyển về chữ thường
    text = text.lower()

    # Tách từ tiếng Việt
    text = word_tokenize(text, format='text')

    # Loại bỏ từ ngắn và stopwords
    text = ' '.join([word for word in text.split() if len(word) > 2 and word not in STOPWORDS])
    return text

def save_model_performance_chart(accuracy, precision, recall, f1, output_path):
    """Tạo và lưu biểu đồ hiệu suất của mô hình.

    Args:
        accuracy: float - Độ chính xác của mô hình
        precision: float - Độ chính xác (precision) của mô hình
        recall: float - Độ nhạy (recall) của mô hình
        f1: float - Điểm F1 của mô hình
        output_path: str - Đường dẫn để lưu biểu đồ

    Returns:
        None
    """
    try:
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score']
        values = [accuracy * 100, precision * 100, recall * 100, f1 * 100]

        # Tạo figure và axis
        fig, ax = plt.subplots(figsize=(10, 6))

        # Tạo các thanh với màu khác nhau
        colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1']

        bars = ax.bar(metrics, values, color=colors, width=0.6)

        # Thêm giá trị lên mỗi thanh
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                    f'{height:.2f}%', ha='center', va='bottom', fontweight='bold')

        # Cấu hình trục y và tiêu đề
        ax.set_ylim(0, 110)
        ax.set_ylabel('Giá trị (%)', fontweight='bold')
        ax.set_title('Hiệu suất mô hình Naive Bayes', fontsize=16, fontweight='bold', pad=20)

        # Thêm đường lưới ngang
        ax.yaxis.grid(True, linestyle='--', alpha=0.7)

        # Thêm viền cho các cạnh của biểu đồ
        for spine in ax.spines.values():
            spine.set_visible(True)
            spine.set_color('#DDD')

        # Đảm bảo layout tốt và lưu
        plt.tight_layout()

        # Vẽ figure trước khi lưu
        fig.canvas.draw()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close(fig)

        logger.info(f"Đã lưu biểu đồ hiệu suất mô hình tại: {output_path}")
    except Exception as e:
        logger.error(f"Lỗi khi tạo biểu đồ hiệu suất: {e}")
        # Tạo file trống để tránh lỗi
        try:
            with open(output_path, 'w') as f:
                f.write("")
        except:
            pass

def save_confusion_matrix(cm, class_names, output_path):
    """Tạo và lưu biểu đồ ma trận nhầm lẫn.

    Args:
        cm: array - Ma trận nhầm lẫn từ confusion_matrix()
        class_names: list - Danh sách tên các lớp
        output_path: str - Đường dẫn để lưu biểu đồ

    Returns:
        None
    """
    try:
        # Tạo figure và axis
        fig, ax = plt.subplots(figsize=(8, 6))

        # Tạo heatmap với seaborn (sử dụng sns.set_theme thay vì sns.set)
        sns.set_theme(font_scale=1.2)
        ax = sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                        cbar=False, square=True, linewidths=.5,
                        xticklabels=class_names, yticklabels=class_names, ax=ax)

        # Thiết lập tiêu đề và nhãn
        ax.set_ylabel('Thực tế', fontweight='bold')
        ax.set_xlabel('Dự đoán', fontweight='bold')
        ax.set_title('Ma trận nhầm lẫn (Confusion Matrix)', fontsize=16, fontweight='bold', pad=20)

        # Áp dụng màu sắc cụ thể cho các ô đúng và sai
        for i in range(len(class_names)):
            for j in range(len(class_names)):
                text = ax.texts[i * len(class_names) + j]
                if i == j:  # Các ô trên đường chéo chính (dự đoán đúng)
                    text.set_weight('bold')

        # Lưu biểu đồ
        plt.tight_layout()

        # Vẽ figure trước khi lưu
        fig.canvas.draw()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close(fig)

        logger.info(f"Đã lưu biểu đồ ma trận nhầm lẫn tại: {output_path}")
    except Exception as e:
        logger.error(f"Lỗi khi tạo biểu đồ ma trận nhầm lẫn: {e}")
        # Tạo file trống để tránh lỗi
        try:
            with open(output_path, 'w') as f:
                f.write("")
        except:
            pass

def train_model(csv_file):
    """Huấn luyện mô hình Naive Bayes với TF-IDF và GridSearchCV.

    Args:
        csv_file: str - Đường dẫn đến file dữ liệu CSV

    Returns:
        tuple - (model, vectorizer) đã huấn luyện
    """
    # Kiểm tra xem pipeline đã được huấn luyện chưa
    if os.path.exists(PIPELINE_PATH):
        logger.info("Đang tải pipeline đã huấn luyện...")
        pipeline = joblib.load(PIPELINE_PATH)
        model = pipeline.named_steps['classifier']
        vectorizer = pipeline.named_steps['vectorizer']
        return model, vectorizer

    # Kiểm tra xem mô hình cũ đã được huấn luyện chưa (để tương thích ngược)
    elif os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        logger.info("Đang tải mô hình và vectorizer cũ...")
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        return model, vectorizer

    logger.info("Đang huấn luyện mô hình mới...")
    # Tải dữ liệu
    data = pd.read_csv(csv_file)
    data = data.dropna()

    # Kiểm tra tỷ lệ lớp để phát hiện mất cân bằng
    class_counts = data['label'].value_counts()
    logger.info(f"Tỷ lệ lớp trong dữ liệu: {class_counts}")

    # Tính toán class_weight để cân bằng prior probability
    total_samples = len(data)
    n_classes = len(class_counts)
    class_weights = {}
    for label, count in class_counts.items():
        class_weights[label] = total_samples / (n_classes * count)

    # Tiền xử lý dữ liệu
    data['processed_text'] = data['text'].apply(preprocess_text)

    # Chia dữ liệu
    X = data['processed_text']
    y = data['label']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Tạo pipeline với TF-IDF và MultinomialNB
    pipeline = Pipeline([
        ('vectorizer', TfidfVectorizer()),
        ('classifier', MultinomialNB())
    ])

    # Tìm kiếm tham số tối ưu với GridSearchCV
    param_grid = {
        'vectorizer__max_features': [3000, 5000, 10000],
        'vectorizer__ngram_range': [(1, 1), (1, 2)],
        'vectorizer__min_df': [2, 3],
        'classifier__alpha': [0.01, 0.1, 0.5, 1.0],
    }

    grid_search = GridSearchCV(
        pipeline,
        param_grid,
        cv=5,
        scoring='f1_weighted',
        verbose=1,
        n_jobs=-1
    )

    # Huấn luyện mô hình
    grid_search.fit(X_train, y_train)

    # Lấy mô hình tốt nhất
    best_model = grid_search.best_estimator_
    logger.info(f"Tham số tốt nhất: {grid_search.best_params_}")

    # Lấy vectorizer và model từ pipeline
    vectorizer = best_model.named_steps['vectorizer']
    model = best_model.named_steps['classifier']

    # Đánh giá mô hình
    y_pred = best_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    report = classification_report(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    logger.info(f"Độ chính xác: {accuracy}")
    logger.info(f"Báo cáo phân loại:\n{report}")

    # Đảm bảo thư mục images tồn tại
    images_dir = 'images'
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)
        logger.info(f"Đã tạo thư mục {images_dir} để lưu biểu đồ")

    # Lưu biểu đồ hiệu suất mô hình (với xử lý lỗi)
    try:
        save_model_performance_chart(accuracy, precision, recall, f1, os.path.join(images_dir, 'model_performance.png'))
    except Exception as e:
        logger.warning(f"Không thể tạo biểu đồ hiệu suất: {e}")

    # Lưu ma trận nhầm lẫn (với xử lý lỗi)
    try:
        save_confusion_matrix(cm, ['Ham', 'Spam'], os.path.join(images_dir, 'confusion_matrix.png'))
    except Exception as e:
        logger.warning(f"Không thể tạo biểu đồ ma trận nhầm lẫn: {e}")

    # Lưu pipeline hoàn chỉnh (chỉ cần file này)
    joblib.dump(best_model, PIPELINE_PATH)
    logger.info(f"Đã lưu pipeline tại: {PIPELINE_PATH}")

    # Không cần lưu model và vectorizer riêng biệt nữa vì pipeline đã chứa tất cả

    return model, vectorizer

def classify_email(model, vectorizer, email_text, email_subject=None):
    """Phân loại email với độ tin cậy và thông tin chi tiết.

    Args:
        model: object - Mô hình đã huấn luyện
        vectorizer: object - Vectorizer đã huấn luyện
        email_text: str - Nội dung email cần phân loại
        email_subject: str - Tiêu đề email (tùy chọn)

    Returns:
        dict - Kết quả phân loại với các thông tin chi tiết
    """
    preprocessed_text = preprocess_text(email_text)

    # Kết hợp tiêu đề và nội dung nếu có
    if email_subject:
        preprocessed_subject = preprocess_text(email_subject)
        combined_text = preprocessed_subject + " " + preprocessed_text
    else:
        combined_text = preprocessed_text

    # Chuyển đổi văn bản sang vector đặc trưng
    text_vec = vectorizer.transform([combined_text])

    # Dự đoán và lấy xác suất
    prediction = model.predict(text_vec)[0]
    probabilities = model.predict_proba(text_vec)[0]

    # Lấy độ tin cậy
    confidence = max(probabilities) * 100

    # Phân tích các từ khóa quan trọng
    feature_names = vectorizer.get_feature_names_out()
    coef_index = 1 if prediction == 'spam' else 0  # Chỉ số cho lớp spam hoặc ham

    # Lấy các từ khóa và trọng số
    try:
        # Lấy log probabilities từ mô hình
        feature_weights = model.feature_log_prob_[coef_index]
        present_features = text_vec.toarray()[0] > 0

        # Tạo danh sách từ khóa với trọng số và giải thích
        keywords = []
        for i, present in enumerate(present_features):
            if present:
                word = feature_names[i]
                weight = float(feature_weights[i])
                # Tính toán tỷ lệ log-likelihood giữa spam và ham
                other_weight = float(model.feature_log_prob_[0 if coef_index == 1 else 1][i])
                impact = weight - other_weight

                # Thêm giải thích
                explanation = "Từ này thường xuất hiện trong " if impact > 0 else "Từ này ít khi xuất hiện trong "
                explanation += "spam" if prediction == "spam" else "email thường"

                keywords.append({
                    'word': word,
                    'weight': weight,
                    'impact': impact,
                    'explanation': explanation
                })

        # Sắp xếp theo mức độ ảnh hưởng
        keywords.sort(key=lambda x: abs(x['impact']), reverse=True)
        top_keywords = keywords[:20]  # Giới hạn số lượng từ khóa trả về
    except Exception as e:
        logger.error(f"Lỗi khi phân tích từ khóa: {e}")
        top_keywords = []

    # Phân tích độ dài và cấu trúc email
    email_stats = {
        'total_length': len(email_text),
        'word_count': len(email_text.split()),
        'uppercase_ratio': sum(1 for c in email_text if c.isupper()) / max(len(email_text), 1),
        'has_urls': 'url' in combined_text.lower(),
        'has_numbers': any(c.isdigit() for c in combined_text),
        'special_char_count': sum(1 for c in email_text if c in '!@#$%^&*')
    }

    return {
        'classification': prediction,
        'confidence': round(confidence, 2),
        'top_keywords': top_keywords,
        'email_stats': email_stats
    }