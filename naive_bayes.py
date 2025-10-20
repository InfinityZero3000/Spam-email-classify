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
import nltk
import json
from datetime import datetime
from nltk.tokenize import word_tokenize as nltk_word_tokenize
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

    # Tách từ tiếng Việt (sử dụng NLTK thay cho underthesea)
    try:
        # Download punkt if not already downloaded
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('punkt_tab', quiet=True)
        words = nltk_word_tokenize(text)
        text = ' '.join(words)
    except:
        # Fallback to simple word splitting if NLTK fails
        text = ' '.join(text.split())

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

def save_training_metrics(train_metrics, val_metrics, test_metrics, best_params, output_path='training_metrics.json'):
    """Lưu các metrics từ quá trình training vào file JSON.
    
    Args:
        train_metrics: dict - Metrics trên tập train
        val_metrics: dict - Metrics trên tập validation
        test_metrics: dict - Metrics trên tập test
        best_params: dict - Tham số tốt nhất từ GridSearchCV
        output_path: str - Đường dẫn file JSON
    """
    try:
        metrics_data = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'train': train_metrics,
            'validation': val_metrics,
            'test': test_metrics,
            'best_params': best_params,
            'overfitting_check': {
                'train_test_gap': train_metrics['accuracy'] - test_metrics['accuracy'],
                'train_val_gap': train_metrics['accuracy'] - val_metrics['accuracy'],
                'is_overfitting': (train_metrics['accuracy'] - val_metrics['accuracy']) > 0.1
            }
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(metrics_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Đã lưu training metrics tại: {output_path}")
    except Exception as e:
        logger.error(f"Lỗi khi lưu training metrics: {e}")

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

    # Chia dữ liệu thành train/val/test (60%/20%/20%)
    X = data['processed_text']
    y = data['label']
    
    # Chia train+val (80%) và test (20%)
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Chia train (75% of 80% = 60%) và val (25% of 80% = 20%)
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.25, random_state=42, stratify=y_train_val
    )
    
    logger.info(f"Kích thước dữ liệu:")
    logger.info(f"  - Train: {len(X_train)} mẫu ({len(X_train)/len(X)*100:.1f}%)")
    logger.info(f"  - Val:   {len(X_val)} mẫu ({len(X_val)/len(X)*100:.1f}%)")
    logger.info(f"  - Test:  {len(X_test)} mẫu ({len(X_test)/len(X)*100:.1f}%)")
    
    # Kiểm tra phân phối class trong từng tập
    logger.info(f"Phân phối class trong Train: {y_train.value_counts().to_dict()}")
    logger.info(f"Phân phối class trong Val: {y_val.value_counts().to_dict()}")
    logger.info(f"Phân phối class trong Test: {y_test.value_counts().to_dict()}")

    # Tạo pipeline với TF-IDF và MultinomialNB
    pipeline = Pipeline([
        ('vectorizer', TfidfVectorizer()),
        ('classifier', MultinomialNB())
    ])

    # Tìm kiếm tham số tối ưu với GridSearchCV trên validation set
    param_grid = {
        'vectorizer__max_features': [3000, 5000, 10000],
        'vectorizer__ngram_range': [(1, 1), (1, 2)],
        'vectorizer__min_df': [2, 3],
        'classifier__alpha': [0.01, 0.1, 0.5, 1.0],
    }

    logger.info("Bắt đầu GridSearchCV để tìm tham số tối ưu...")
    
    # Tạo tập train+val để GridSearchCV có thể cross-validate
    # Nhưng chúng ta sẽ đánh giá riêng trên val sau
    grid_search = GridSearchCV(
        pipeline,
        param_grid,
        cv=5,
        scoring='f1_weighted',
        verbose=1,
        n_jobs=-1,
        return_train_score=True
    )

    # Huấn luyện trên tập train
    logger.info("Huấn luyện mô hình trên tập TRAIN...")
    grid_search.fit(X_train, y_train)

    # Lấy mô hình tốt nhất
    best_model = grid_search.best_estimator_
    logger.info(f"Tham số tốt nhất: {grid_search.best_params_}")
    logger.info(f"Best CV score (train): {grid_search.best_score_:.4f}")

    # Lấy vectorizer và model từ pipeline
    vectorizer = best_model.named_steps['vectorizer']
    model = best_model.named_steps['classifier']

    # ========== ĐÁNH GIÁ TRÊN TẬP TRAIN ==========
    logger.info("\n" + "="*60)
    logger.info("ĐÁNH GIÁ TRÊN TẬP TRAIN")
    logger.info("="*60)
    y_train_pred = best_model.predict(X_train)
    train_accuracy = accuracy_score(y_train, y_train_pred)
    train_precision = precision_score(y_train, y_train_pred, average='weighted', zero_division=0)
    train_recall = recall_score(y_train, y_train_pred, average='weighted', zero_division=0)
    train_f1 = f1_score(y_train, y_train_pred, average='weighted', zero_division=0)
    train_cm = confusion_matrix(y_train, y_train_pred)
    
    logger.info(f"Accuracy:  {train_accuracy:.4f}")
    logger.info(f"Precision: {train_precision:.4f}")
    logger.info(f"Recall:    {train_recall:.4f}")
    logger.info(f"F1-Score:  {train_f1:.4f}")
    logger.info(f"Confusion Matrix:\n{train_cm}")
    
    # ========== ĐÁNH GIÁ TRÊN TẬP VALIDATION ==========
    logger.info("\n" + "="*60)
    logger.info("ĐÁNH GIÁ TRÊN TẬP VALIDATION")
    logger.info("="*60)
    y_val_pred = best_model.predict(X_val)
    val_accuracy = accuracy_score(y_val, y_val_pred)
    val_precision = precision_score(y_val, y_val_pred, average='weighted', zero_division=0)
    val_recall = recall_score(y_val, y_val_pred, average='weighted', zero_division=0)
    val_f1 = f1_score(y_val, y_val_pred, average='weighted', zero_division=0)
    val_cm = confusion_matrix(y_val, y_val_pred)
    
    logger.info(f"Accuracy:  {val_accuracy:.4f}")
    logger.info(f"Precision: {val_precision:.4f}")
    logger.info(f"Recall:    {val_recall:.4f}")
    logger.info(f"F1-Score:  {val_f1:.4f}")
    logger.info(f"Confusion Matrix:\n{val_cm}")
    
    # Kiểm tra overfitting
    accuracy_diff = train_accuracy - val_accuracy
    if accuracy_diff > 0.1:
        logger.warning(f"⚠️  CẢNH BÁO: Có dấu hiệu overfitting!")
        logger.warning(f"   Train accuracy ({train_accuracy:.4f}) cao hơn Val accuracy ({val_accuracy:.4f}) tới {accuracy_diff:.4f}")
    else:
        logger.info(f"✓ Model generalization tốt (gap: {accuracy_diff:.4f})")

    # ========== ĐÁNH GIÁ TRÊN TẬP TEST (Final Evaluation) ==========
    logger.info("\n" + "="*60)
    logger.info("ĐÁNH GIÁ CUỐI CÙNG TRÊN TẬP TEST")
    logger.info("="*60)
    y_pred = best_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    report = classification_report(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    logger.info(f"Accuracy:  {accuracy:.4f}")
    logger.info(f"Precision: {precision:.4f}")
    logger.info(f"Recall:    {recall:.4f}")
    logger.info(f"F1-Score:  {f1:.4f}")
    logger.info(f"\nBáo cáo phân loại chi tiết:\n{report}")
    logger.info(f"Confusion Matrix:\n{cm}")
    
    # ========== TỔNG HỢP KẾT QUẢ ==========
    logger.info("\n" + "="*60)
    logger.info("TỔNG HỢP KẾT QUẢ")
    logger.info("="*60)
    logger.info(f"{'Metric':<15} {'Train':<10} {'Val':<10} {'Test':<10}")
    logger.info("-" * 60)
    logger.info(f"{'Accuracy':<15} {train_accuracy:<10.4f} {val_accuracy:<10.4f} {accuracy:<10.4f}")
    logger.info(f"{'Precision':<15} {train_precision:<10.4f} {val_precision:<10.4f} {precision:<10.4f}")
    logger.info(f"{'Recall':<15} {train_recall:<10.4f} {val_recall:<10.4f} {recall:<10.4f}")
    logger.info(f"{'F1-Score':<15} {train_f1:<10.4f} {val_f1:<10.4f} {f1:<10.4f}")
    logger.info("="*60)

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

    # Lưu training metrics vào JSON
    try:
        train_metrics_dict = {
            'accuracy': float(train_accuracy),
            'precision': float(train_precision),
            'recall': float(train_recall),
            'f1_score': float(train_f1),
            'samples': len(X_train),
            'confusion_matrix': train_cm.tolist()
        }
        
        val_metrics_dict = {
            'accuracy': float(val_accuracy),
            'precision': float(val_precision),
            'recall': float(val_recall),
            'f1_score': float(val_f1),
            'samples': len(X_val),
            'confusion_matrix': val_cm.tolist()
        }
        
        test_metrics_dict = {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'samples': len(X_test),
            'confusion_matrix': cm.tolist()
        }
        
        save_training_metrics(
            train_metrics_dict,
            val_metrics_dict,
            test_metrics_dict,
            grid_search.best_params_,
            'training_metrics.json'
        )
    except Exception as e:
        logger.warning(f"Không thể lưu training metrics: {e}")

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