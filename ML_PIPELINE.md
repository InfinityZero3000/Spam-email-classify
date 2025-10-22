# 🤖 MACHINE LEARNING PIPELINE - HỆ THỐNG PHÂN LOẠI SPAM EMAIL

## 📋 TỔNG QUAN HỆ THỐNG

Dự án này xây dựng một hệ thống hoàn chỉnh để phân loại email spam/ham sử dụng thuật toán **Naive Bayes** với **TF-IDF** và tích hợp **Gmail API** để quản lý email thời gian thực.

---

## 🔄 MACHINE LEARNING PIPELINE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ML PIPELINE WORKFLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  1. THU THẬP DỮ LIỆU │
└──────────────────────┘
         │
         │  • Gmail API: Đồng bộ email từ tài khoản Gmail
         │  • Manual Input: Người dùng thêm email qua giao diện
         │  • Dataset CSV: spam_data.csv (10,000+ mẫu)
         │
         ▼
┌──────────────────────┐
│  2. LƯU TRỮ DỮ LIỆU  │
└──────────────────────┘
         │
         │  File: spam_data.csv
         │  Format: [label, text]
         │  Labels: "spam" hoặc "ham"
         │  
         ▼
┌──────────────────────┐
│ 3. TIỀN XỬ LÝ VĂN BẢN│
└──────────────────────┘
         │
         │  a) Loại bỏ thẻ HTML
         │  b) Chuẩn hóa URL → "URL"
         │  c) Chuẩn hóa Email → "EMAIL"
         │  d) Chuẩn hóa SĐT → "PHONE"
         │  e) Normalize Unicode (NFC)
         │  f) Chuyển chữ thường
         │  g) Tách từ (NLTK tokenization)
         │  h) Loại bỏ stopwords (từ file stopwords.txt)
         │  i) Loại bỏ từ ngắn (<3 ký tự)
         │
         ▼
┌──────────────────────┐
│ 4. CHIA TẬP DỮ LIỆU  │
└──────────────────────┘
         │
         │  • Train Set:      60% (huấn luyện model)
         │  • Validation Set: 20% (tối ưu tham số)
         │  • Test Set:       20% (đánh giá cuối cùng)
         │  
         │  Sử dụng: train_test_split với stratify
         │
         ▼
┌────────────────────────┐
│ 5. VECTOR HÓA ĐẶC TRƯNG│
└────────────────────────┘
         │
         │  Thuật toán: TF-IDF (Term Frequency-Inverse Document Frequency)
         │  
         │  Tham số (tối ưu qua GridSearchCV):
         │  • max_features: [3000, 5000, 10000]
         │  • ngram_range: [(1,1), (1,2)]
         │  • min_df: [2, 3]
         │  
         │  Output: Ma trận sparse TF-IDF
         │
         ▼
┌───────────────────────┐
│ 6. HUẤN LUYỆN MODEL   │
└───────────────────────┘
         │
         │  Thuật toán: Multinomial Naive Bayes
         │  
         │  Tối ưu tham số với GridSearchCV:
         │  • alpha (Laplace smoothing): [0.01, 0.1, 0.5, 1.0]
         │  • Cross-validation: 5-fold CV
         │  • Scoring metric: F1-weighted
         │  
         │  Công thức Naive Bayes:
         │  P(spam|email) ∝ P(email|spam) × P(spam)
         │  
         ▼
┌──────────────────────┐
│ 7. ĐÁNH GIÁ MODEL    │
└──────────────────────┘
         │
         │  Metrics được tính trên 3 tập:
         │  
         │  📊 TRAIN SET METRICS:
         │     → Kiểm tra khả năng học của model
         │  
         │  📊 VALIDATION SET METRICS:
         │     → Phát hiện overfitting
         │     → So sánh Train vs Val accuracy
         │  
         │  📊 TEST SET METRICS (Final Evaluation):
         │     • Accuracy:  % dự đoán đúng
         │     • Precision: % spam dự đoán đúng trong tổng số dự đoán spam
         │     • Recall:    % spam được phát hiện trong tổng số spam thực tế
         │     • F1-Score:  Trung bình điều hòa của Precision & Recall
         │     • Confusion Matrix: Ma trận nhầm lẫn
         │  
         │  🔍 OVERFITTING CHECK:
         │     IF (Train_Accuracy - Val_Accuracy) > 10%
         │        → ⚠️  CẢNH BÁO: Model đang overfitting!
         │
         ▼
┌──────────────────────┐
│ 8. LƯU MODEL         │
└──────────────────────┘
         │
         │  Files được lưu:
         │  • spam_pipeline.pkl       → Pipeline hoàn chỉnh (TF-IDF + Model)
         │  • training_metrics.json   → Metrics chi tiết của quá trình huấn luyện
         │  • model_performance.png   → Biểu đồ hiệu suất
         │  • confusion_matrix.png    → Ma trận nhầm lẫn
         │
         ▼
┌────────────────────────┐
│ 9. TRIỂN KHAI & SỬ DỤNG│
└────────────────────────┘
         │
         │  • Load pipeline từ spam_pipeline.pkl
         │  • Nhận email từ Gmail API
         │  • Tiền xử lý email
         │  • Dự đoán spam/ham với confidence score
         │  • Trích xuất top keywords ảnh hưởng
         │  • Hiển thị kết quả trên giao diện
         │
         ▼
┌──────────────────────┐
│ 10. HỌC LIÊN TỤC     │
└──────────────────────┘
         │
         │  • Người dùng đánh dấu email spam/ham
         │  • Thêm vào dataset (spam_data.csv)
         │  • Retrain model khi có dữ liệu mới
         │  • Cập nhật pipeline
         │
         └─────────────────► (Quay lại bước 3)
```

---

## 🧮 CHI TIẾT CÁC THUẬT TOÁN

### 1. **TF-IDF Vectorization**

**TF-IDF (Term Frequency - Inverse Document Frequency)** là phương pháp vector hóa văn bản, chuyển đổi text thành số.

#### Công thức:

```
TF-IDF(t, d) = TF(t, d) × IDF(t)

Trong đó:
• TF(t, d)  = Số lần từ t xuất hiện trong document d / Tổng số từ trong d
• IDF(t)    = log(Tổng số documents / Số documents chứa từ t)
```

#### Ý nghĩa:
- **TF**: Từ xuất hiện nhiều → quan trọng trong document đó
- **IDF**: Từ xuất hiện ít trong corpus → có tính phân biệt cao
- **TF-IDF cao**: Từ quan trọng và đặc trưng cho document

#### Ví dụ:

```
Email spam: "KHUYẾN MÃI đặc biệt, KHUYẾN MÃI hấp dẫn"
Email ham:  "Chào bạn, hẹn gặp lại"

→ "KHUYẾN MÃI" có TF cao trong email spam
→ "KHUYẾN MÃI" xuất hiện ít trong toàn bộ emails → IDF cao
→ TF-IDF("KHUYẾN MÃI") rất cao → Đặc trưng của spam
```

### 2. **Multinomial Naive Bayes**

**Naive Bayes** là thuật toán phân loại xác suất dựa trên **Định lý Bayes**.

#### Công thức cơ bản:

```
P(spam | email) = P(email | spam) × P(spam) / P(email)

Trong đó:
• P(spam | email): Xác suất email là spam khi biết nội dung
• P(email | spam): Xác suất email có nội dung này khi là spam
• P(spam):         Xác suất tiên nghiệm (prior probability)
• P(email):        Xác suất email (constant, có thể bỏ qua)
```

#### Giả định "Naive" (Ngây thơ):

Các từ trong email **độc lập** với nhau:

```
P(email | spam) = P(w₁ | spam) × P(w₂ | spam) × ... × P(wₙ | spam)
```

#### Multinomial Naive Bayes cho text:

```
log P(spam | email) = log P(spam) + Σ count(wᵢ) × log P(wᵢ | spam)

Trong đó:
• count(wᵢ): Số lần từ wᵢ xuất hiện trong email
• P(wᵢ | spam) = (số lần wᵢ xuất hiện trong spam + α) / 
                 (tổng số từ trong spam + α × V)
• α: Laplace smoothing parameter (tránh xác suất = 0)
• V: Kích thước vocabulary
```

#### Laplace Smoothing (α):

- **Vấn đề**: Nếu từ mới chưa từng xuất hiện trong training → P = 0 → Lỗi!
- **Giải pháp**: Thêm α vào tử số và α×V vào mẫu số
- **Tham số tối ưu** (qua GridSearchCV): α = [0.01, 0.1, 0.5, 1.0]

#### Ví dụ phân loại:

```
Email mới: "KHUYẾN MÃI đặc biệt"

Bước 1: Tính prior
P(spam) = 0.6 (60% email trong training là spam)
P(ham)  = 0.4

Bước 2: Tính likelihood
P("KHUYẾN" | spam) = 0.15
P("MÃI" | spam)    = 0.12
P("đặc" | spam)    = 0.08
P("biệt" | spam)   = 0.07

P("KHUYẾN" | ham)  = 0.01
P("MÃI" | ham)     = 0.01
P("đặc" | ham)     = 0.05
P("biệt" | ham)    = 0.04

Bước 3: Tính posterior (log scale)
log P(spam | email) = log(0.6) + log(0.15) + log(0.12) + log(0.08) + log(0.07)
                    = -0.51 + (-1.90) + (-2.12) + (-2.53) + (-2.66)
                    = -9.72

log P(ham | email)  = log(0.4) + log(0.01) + log(0.01) + log(0.05) + log(0.04)
                    = -0.92 + (-4.61) + (-4.61) + (-3.00) + (-3.22)
                    = -16.36

Bước 4: So sánh
-9.72 > -16.36 → Email là SPAM
Confidence = exp(-9.72) / [exp(-9.72) + exp(-16.36)] ≈ 99.9%
```

---

## 📊 QUY TRÌNH ĐÁNH GIÁ MODEL

### Metrics Đánh Giá

#### 1. **Accuracy (Độ chính xác)**

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)

TP: True Positive  (Dự đoán spam, thực tế spam)
TN: True Negative  (Dự đoán ham, thực tế ham)
FP: False Positive (Dự đoán spam, thực tế ham) ← Type I Error
FN: False Negative (Dự đoán ham, thực tế spam)  ← Type II Error
```

**Ý nghĩa**: % email được phân loại đúng

#### 2. **Precision (Độ chính xác của dự đoán spam)**

```
Precision = TP / (TP + FP)
```

**Ý nghĩa**: Trong số email dự đoán là spam, bao nhiêu % thực sự là spam?
- **Precision cao** → Ít email bình thường bị nhầm là spam (FP thấp)

#### 3. **Recall (Độ nhạy, Sensitivity)**

```
Recall = TP / (TP + FN)
```

**Ý nghĩa**: Trong số email spam thực tế, bao nhiêu % được phát hiện?
- **Recall cao** → Phát hiện được nhiều spam (FN thấp)

#### 4. **F1-Score**

```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

**Ý nghĩa**: Trung bình điều hòa của Precision và Recall
- **F1 cao** → Cân bằng giữa Precision và Recall

### Confusion Matrix

```
                  Predicted
                Spam    Ham
Actual  Spam  │  TP  │  FN  │
        Ham   │  FP  │  TN  │
```

### Kiểm tra Overfitting

```python
accuracy_diff = Train_Accuracy - Validation_Accuracy

if accuracy_diff > 0.1:
    print("⚠️ CẢNH BÁO: Model đang overfitting!")
    print("→ Model học thuộc training data, không tổng quát hóa tốt")
    print("→ Giải pháp: Tăng alpha, giảm max_features, thu thập thêm dữ liệu")
```

---

## 🔧 THAM SỐ TỐI ÚU (GridSearchCV)

### Không gian tham số

```python
param_grid = {
    'vectorizer__max_features': [3000, 5000, 10000],
    'vectorizer__ngram_range': [(1, 1), (1, 2)],
    'vectorizer__min_df': [2, 3],
    'classifier__alpha': [0.01, 0.1, 0.5, 1.0]
}
```

### Giải thích tham số

| Tham số | Ý nghĩa | Giá trị | Ảnh hưởng |
|---------|---------|---------|-----------|
| **max_features** | Số lượng từ tối đa | 3k, 5k, 10k | ↑ → Nhiều đặc trưng, có thể overfitting |
| **ngram_range** | Kết hợp từ | (1,1): unigram<br>(1,2): unigram + bigram | (1,2) → Bắt cụm từ "khuyến mãi" |
| **min_df** | Từ xuất hiện tối thiểu | 2, 3 documents | ↑ → Loại bỏ từ hiếm, giảm noise |
| **alpha** | Laplace smoothing | 0.01 đến 1.0 | ↑ → Ít overfitting, nhưng có thể kém chính xác |

### Quá trình tìm kiếm

```
Tổng số kết hợp: 3 × 2 × 2 × 4 = 48 kết hợp
Cross-validation: 5-fold CV
Tổng số lần huấn luyện: 48 × 5 = 240 lần

→ GridSearchCV tự động chọn kết hợp tốt nhất dựa trên F1-score
```

---

## 📂 CẤU TRÚC DỮ LIỆU & FILE

### 1. Dataset (spam_data.csv)

```csv
label,text
ham,"Cho mình hỏi, bạn có presentation không?"
spam,"💰 CƠ HỘI VIỆC LÀM: Thu nhập 2000-1500k/tháng"
spam,"📈 KIẾM 5000K/NGÀY từ Dogecoin!"
ham,"Wishing you a beautiful day."
```

**Đặc điểm**:
- Hơn 10,000 mẫu email tiếng Việt và tiếng Anh
- Cân bằng tương đối giữa spam/ham
- Được cập nhật liên tục từ người dùng

### 2. Stopwords (stopwords.txt)

```text
và
của
có
trong
được
...
```

**Mục đích**: Loại bỏ các từ phổ biến không mang ý nghĩa phân loại

### 3. Model Files

```
spam_pipeline.pkl          → Pipeline hoàn chỉnh (TF-IDF + Naive Bayes)
training_metrics.json      → Chi tiết metrics của training
model_performance.png      → Biểu đồ Accuracy, Precision, Recall, F1
confusion_matrix.png       → Ma trận nhầm lẫn
```

### 4. Training Metrics (training_metrics.json)

```json
{
  "timestamp": "2025-10-22 14:30:00",
  "train": {
    "accuracy": 0.9845,
    "precision": 0.9821,
    "recall": 0.9867,
    "f1_score": 0.9844,
    "samples": 6000
  },
  "validation": {
    "accuracy": 0.9623,
    "precision": 0.9587,
    "recall": 0.9658,
    "f1_score": 0.9622,
    "samples": 2000
  },
  "test": {
    "accuracy": 0.9651,
    "precision": 0.9612,
    "recall": 0.9689,
    "f1_score": 0.9650,
    "samples": 2000
  },
  "best_params": {
    "vectorizer__max_features": 5000,
    "vectorizer__ngram_range": [1, 2],
    "vectorizer__min_df": 2,
    "classifier__alpha": 0.1
  },
  "overfitting_check": {
    "train_test_gap": 0.0194,
    "train_val_gap": 0.0222,
    "is_overfitting": false
  }
}
```

---

## 🎯 TÍCH HỢP VÀO ỨNG DỤNG

### Luồng sử dụng Model trong Production

```
┌─────────────────────────────────────────────────────────────┐
│                    USER FLOW - SỬ DỤNG MODEL                │
└─────────────────────────────────────────────────────────────┘

User đăng nhập Gmail
         │
         ▼
┌────────────────────┐
│ Lấy email từ Gmail │ ← gmail_oauth.py → Gmail API
└────────────────────┘
         │
         │ [Email List]
         ▼
┌────────────────────┐
│ Tiền xử lý email   │ ← preprocess_text() trong naive_bayes.py
│  • Loại HTML       │
│  • Normalize       │
│  • Tokenize        │
│  • Remove stopwords│
└────────────────────┘
         │
         │ [Processed Text]
         ▼
┌────────────────────┐
│ Load Pipeline      │ ← joblib.load('spam_pipeline.pkl')
│  • TF-IDF          │
│  • Naive Bayes     │
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Phân loại email    │ ← classify_email()
│  1. Vectorize      │ ← vectorizer.transform()
│  2. Predict        │ ← model.predict()
│  3. Get proba      │ ← model.predict_proba()
│  4. Extract        │ ← Phân tích từ khóa, email stats
│     keywords       │
└────────────────────┘
         │
         │ [Classification Result]
         │ • classification: "spam" hoặc "ham"
         │ • confidence: 95.67%
         │ • top_keywords: [...]
         │ • email_stats: {...}
         ▼
┌────────────────────┐
│ Hiển thị kết quả   │ ← React Frontend
│  • Badge spam/ham  │
│  • Confidence %    │
│  • Keywords        │
│  • Suggestion      │
└────────────────────┘
         │
         ▼
User action:
  • Đánh dấu spam    → mark_spam() → Add to dataset → Retrain
  • Bỏ đánh dấu spam → mark_not_spam() → Add to dataset → Retrain
  • Phân tích thủ công → analyze_text() → Hiển thị chi tiết
```

### API Endpoints sử dụng Model

#### 1. `/emails` - Lấy và phân loại email inbox

```python
@app.route('/emails')
def get_emails_route():
    # 1. Lấy email từ Gmail API
    service = get_gmail_service()
    result = get_emails(service, max_results=20)
    
    # 2. Trong get_emails(), mỗi email được phân loại:
    for email in emails:
        MODEL, VECTORIZER = initialize_model()
        result = classify_email(MODEL, VECTORIZER, 
                               email['content'], 
                               email['subject'])
        email.update(result)  # Thêm classification, confidence, keywords
    
    return jsonify(result)
```

#### 2. `/spam_emails` - Lấy email spam

Tương tự `/emails` nhưng filter theo label SPAM

#### 3. `/analyze_text` - Phân tích email thủ công

```python
@app.route('/analyze_text', methods=['POST'])
def analyze_text():
    data = request.json
    subject = data.get('subject', '')
    content = data.get('content', '')
    
    # Load model
    model, vectorizer = initialize_model()
    
    # Phân loại
    result = classify_email(model, vectorizer, content, subject)
    
    return jsonify(result)
```

#### 4. `/add_to_dataset` - Thêm dữ liệu & Retrain

```python
@app.route('/add_to_dataset', methods=['POST'])
def add_to_dataset():
    # 1. Thêm email vào spam_data.csv
    new_data = pd.DataFrame({
        'label': [label], 
        'text': [full_text]
    })
    df = pd.concat([df, new_data])
    df.to_csv(DATA_FILE)
    
    # 2. Huấn luyện lại model
    MODEL, VECTORIZER = train_model(DATA_FILE)
    
    return jsonify({'success': True})
```

#### 5. `/retrain` - Huấn luyện lại model

```python
@app.route('/retrain', methods=['POST'])
def retrain_model():
    global MODEL, VECTORIZER
    
    # Xóa pipeline cũ
    os.remove(PIPELINE_PATH)
    
    # Reset biến global
    MODEL, VECTORIZER = None, None
    
    # Huấn luyện mới
    MODEL, VECTORIZER = train_model(DATA_FILE)
    
    return jsonify({'success': True})
```

---

## 📈 PHÂN TÍCH KẾT QUẢ

### Output của classify_email()

```python
{
    'classification': 'spam',
    'confidence': 95.67,
    'top_keywords': [
        {
            'word': 'khuyến',
            'weight': -2.145,
            'impact': 3.456,
            'explanation': 'Từ này thường xuất hiện trong spam'
        },
        {
            'word': 'mãi',
            'weight': -2.287,
            'impact': 3.234,
            'explanation': 'Từ này thường xuất hiện trong spam'
        },
        // ... top 20 keywords
    ],
    'email_stats': {
        'total_length': 245,
        'word_count': 42,
        'uppercase_ratio': 0.15,
        'has_urls': True,
        'has_numbers': True,
        'special_char_count': 8
    }
}
```

### Giải thích từ khóa (Keywords Explanation)

```python
# Tính impact score cho mỗi từ
impact = log_prob_spam - log_prob_ham

# Impact > 0: Từ đặc trưng cho spam
# Impact < 0: Từ đặc trưng cho ham
# |Impact| lớn: Từ có sức ảnh hưởng mạnh đến kết quả phân loại
```

---

## 🔄 HỌC LIÊN TỤC (Continuous Learning)

### Quy trình cập nhật model

```
User đánh dấu email
         │
         ▼
add_to_dataset_internal()
         │
         ├─→ Kiểm tra trùng lặp trong spam_data.csv
         │
         ├─→ Nếu mới: Thêm vào CSV
         │   Nếu trùng nhưng khác label: Cập nhật label
         │
         ▼
train_model(spam_data.csv)
         │
         ├─→ Đọc dữ liệu mới
         ├─→ GridSearchCV tìm tham số tối ưu
         ├─→ Huấn luyện lại pipeline
         ├─→ Đánh giá metrics mới
         ├─→ Lưu spam_pipeline.pkl
         │
         ▼
Model được cập nhật
         │
         └─→ Dùng cho các dự đoán tiếp theo
```

### Khi nào nên Retrain?

1. **Tự động**: Khi thêm dữ liệu qua `add_to_dataset`
2. **Thủ công**: User click "Retrain Model" trên giao diện
3. **Định kỳ**: Nếu có nhiều dữ liệu mới tích lũy

---

## 🎨 TRỰC QUAN HÓA

### 1. Biểu đồ hiệu suất (model_performance.png)

```
     ┌──────────────────────────────────────┐
     │  Model Performance Metrics           │
120% ├──────────────────────────────────────┤
     │                                      │
100% │  ████  ████  ████  ████              │
 80% │  ████  ████  ████  ████              │
 60% │  ████  ████  ████  ████              │
 40% │  ████  ████  ████  ████              │
 20% │  ████  ████  ████  ████              │
  0% └──────────────────────────────────────┘
      Acc   Prec  Rec   F1
     96.5% 96.1% 96.9% 96.5%
```

### 2. Ma trận nhầm lẫn (confusion_matrix.png)

```
                Predicted
             Spam    Ham
Actual  ┌─────────────────┐
  Spam  │  970  │   30   │  1000
        ├─────────────────┤
  Ham   │   40  │  960   │  1000
        └─────────────────┘
         1010    990

→ Precision (spam) = 970/1010 = 96.0%
→ Recall (spam)    = 970/1000 = 97.0%
```

---

## 💡 BEST PRACTICES & TIPS

### 1. Tiền xử lý văn bản

✅ **Làm:**
- Normalize Unicode (NFC) cho tiếng Việt
- Loại bỏ stopwords phù hợp với ngữ cảnh
- Chuẩn hóa URL, Email, Phone → Giảm chiều dữ liệu

❌ **Tránh:**
- Loại bỏ quá nhiều thông tin (ví dụ: dấu câu có thể quan trọng)
- Stemming/Lemmatization không phù hợp với tiếng Việt

### 2. Chọn thuật toán

✅ **Naive Bayes phù hợp khi:**
- Dữ liệu text nhiều chiều
- Cần tốc độ nhanh
- Dữ liệu training không quá lớn (< 100k mẫu)

❌ **Cân nhắc thuật toán khác nếu:**
- Cần độ chính xác cực cao → SVM, Random Forest
- Có nhiều dữ liệu (> 100k) → Deep Learning (LSTM, BERT)

### 3. Đánh giá model

✅ **Quan trọng:**
- Chia Train/Val/Test đúng cách
- Kiểm tra overfitting (Train vs Val accuracy)
- Sử dụng F1-score cho dữ liệu mất cân bằng

❌ **Sai lầm thường gặp:**
- Chỉ nhìn Accuracy (có thể misleading nếu data imbalanced)
- Không kiểm tra Precision/Recall riêng biệt
- Test trên data đã thấy trong training

### 4. Continuous Learning

✅ **Nên:**
- Backup dataset trước khi retrain
- Lưu lại metrics mỗi lần retrain để theo dõi xu hướng
- Validate user feedback trước khi thêm vào dataset

❌ **Tránh:**
- Thêm dữ liệu nhiễu (low quality) vào dataset
- Retrain quá thường xuyên mà không đánh giá kết quả

---

## 📚 TÀI LIỆU THAM KHẢO

### Thuật toán
- [Naive Bayes Classifier - Wikipedia](https://en.wikipedia.org/wiki/Naive_Bayes_classifier)
- [TF-IDF - Wikipedia](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- [Scikit-learn Documentation](https://scikit-learn.org/stable/)

### Metrics
- [Precision and Recall](https://en.wikipedia.org/wiki/Precision_and_recall)
- [F1 Score](https://en.wikipedia.org/wiki/F-score)
- [Confusion Matrix](https://en.wikipedia.org/wiki/Confusion_matrix)

---

## 🔮 HƯỚNG PHÁT TRIỂN

### Cải tiến Model

1. **Ensemble Methods**
   ```
   Kết hợp Naive Bayes + SVM + Random Forest
   → Voting Classifier để tăng độ chính xác
   ```

2. **Deep Learning**
   ```
   PhoBERT (BERT for Vietnamese) cho email tiếng Việt
   → Bắt được ngữ cảnh tốt hơn
   ```

3. **Feature Engineering**
   ```
   • Email header analysis (sender reputation)
   • Link analysis (check spam domains)
   • Attachment detection
   • Email metadata (time, size)
   ```

### Cải tiến Hệ thống

1. **Auto-Retrain**
   ```python
   # Tự động retrain khi có N mẫu mới
   if new_samples_count >= 100:
       retrain_model()
   ```

2. **A/B Testing**
   ```
   So sánh model cũ vs model mới
   → Chọn model tốt hơn
   ```

3. **Model Versioning**
   ```
   spam_pipeline_v1.pkl
   spam_pipeline_v2.pkl
   → Rollback nếu model mới kém hơn
   ```

---

## 📞 HỖ TRỢ

Nếu có thắc mắc về ML Pipeline, vui lòng tham khảo:
- **Code**: `naive_bayes.py`, `app.py`
- **Documentation**: `ARCHITECTURE.md`, `README.md`
- **Training Logs**: `training_metrics.json`

---

**📅 Cập nhật lần cuối**: 22/10/2025  
**🏷️ Phiên bản**: 1.0  
**👨‍💻 Tác giả**: InfinityZero3000
