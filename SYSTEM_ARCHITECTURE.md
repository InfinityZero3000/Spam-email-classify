# 🏗️ KIẾN TRÚC HỆ THỐNG - SPAM EMAIL CLASSIFIER

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc tổng thể](#kiến-trúc-tổng-thể)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Machine Learning Pipeline](#machine-learning-pipeline)
6. [Luồng dữ liệu](#luồng-dữ-liệu)
7. [Database & Storage](#database--storage)
8. [Authentication & Security](#authentication--security)
9. [Deployment](#deployment)

---

## 🎯 TỔNG QUAN HỆ THỐNG

### Mô tả dự án

**Spam Email Classifier** là một ứng dụng web full-stack tích hợp Machine Learning để phân loại email spam/ham tự động, kết nối với Gmail API để quản lý email thời gian thực.

### Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      TECH STACK                         │
├─────────────────────────────────────────────────────────┤
│ Frontend:                                               │
│   • React 18                                            │
│   • Vite (Build tool)                                   │
│   • Tailwind CSS                                        │
│   • Axios (HTTP client)                                 │
│                                                         │
│ Backend:                                                │
│   • Python 3.x                                          │
│   • Flask (Web framework)                               │
│   • Flask-CORS                                          │
│                                                         │
│ Machine Learning:                                       │
│   • scikit-learn (Naive Bayes, TF-IDF)                  │
│   • pandas (Data manipulation)                          │
│   • NLTK (Text processing)                              │
│   • matplotlib, seaborn (Visualization)                 │
│                                                         │
│ External APIs:                                          │
│   • Gmail API (Google)                                  │
│   • OAuth 2.0 (Google Authentication)                   │
│                                                         │
│ Data Storage:                                           │
│   • CSV (spam_data.csv)                                 │
│   • Pickle (spam_pipeline.pkl)                          │
│   • JSON (training_metrics.json)                        │
│   • Session (Flask session)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🏛️ KIẾN TRÚC TỔNG THỂ

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                               │
│                       http://localhost:5173 (Dev)                    │
│                       http://localhost:5001 (Prod)                   │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │
        ┌────────────────────────┴───────────────────────┐
        │                                                │
        ▼ (Development)                                  ▼ (Production)
┌─────────────────┐                              ┌──────────────────┐
│  Vite Dev Server│                              │  Flask Server    │
│   Port 5173     │                              │   Port 5001      │
│                 │                              │                  │
│  • Hot Reload   │                              │ • Serve Static   │
│  • Proxy API    │                              │   (dist/)        │
│    to :5001     │                              │ • Handle API     │
└─────────────────┘                              └──────────────────┘
        │                                                │
        │ Proxy (/api/*, /emails)                        │
        │                                                │
        └────────────────────┬───────────────────────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │  Flask Backend  │
                   │   Port 5001     │
                   └─────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐    ┌──────────────┐
│  Gmail API   │   │   ML Model   │    │  Data Layer  │
│              │   │              │    │              │
│ • Get Emails │   │ • Classify   │    │ • CSV Files  │
│ • Send Email │   │ • Train      │    │ • Pickle     │
│ • Move Spam  │   │ • Analyze    │    │ • Session    │
└──────────────┘   └──────────────┘    └──────────────┘
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Login    │  │ Inbox    │  │ Spam     │  │ Analyzer │         │
│  │ Page     │  │ Page     │  │ Page     │  │ Page     │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Stats    │  │ Email    │  │ Compose  │  │ Sidebar  │         │
│  │ Page     │  │ List     │  │ Modal    │  │          │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
│                                                                 │
│  ┌───────────────────────────────────────────────────┐          │
│  │              API Service (axios)                  │          │
│  │  • Authentication  • Email CRUD  • ML Analysis    │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (JSON)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Flask)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────── API Routes ──────────────────────┐        │
│  │                                                     │        │
│  │  Authentication:                                    │        │
│  │  • /login                 • /oauth2callback         │        │
│  │  • /api/logout            • /api/check-auth         │        │
│  │                                                     │        │
│  │  Email Management:                                  │        │
│  │  • GET  /emails           • GET  /spam_emails       │        │
│  │  • POST /mark_spam        • POST /mark_not_spam     │        │
│  │  • POST /mark_read        • POST /delete_email      │        │
│  │  • POST /send_email                                 │        │
│  │                                                     │        │
│  │  ML & Analysis:                                     │        │
│  │  • POST /analyze_text     • POST /add_to_dataset    │        │
│  │  • POST /retrain          • GET  /api/stats         │        │
│  │                                                     │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  ┌─────────────────── Business Logic ───────────────────┐       │
│  │                                                      │       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐      │       │
│  │  │ gmail_     │  │ naive_     │  │ config.py  │      │       │
│  │  │ oauth.py   │  │ bayes.py   │  │            │      │       │
│  │  │            │  │            │  │            │      │       │
│  │  │ • OAuth    │  │ • Train    │  │ • Settings │      │       │
│  │  │ • Get      │  │ • Classify │  │ • Paths    │      │       │
│  │  │   Emails   │  │ • Analyze  │  │            │      │       │
│  │  └────────────┘  └────────────┘  └────────────┘      │       │
│  │                                                      │       │
│  │  ┌────────────┐                                      │       │
│  │  │ utils.py   │                                      │       │
│  │  │            │                                      │       │
│  │  │ • Logger   │                                      │       │
│  │  │ • Auth     │                                      │       │
│  │  │ • Error    │                                      │       │
│  │  └────────────┘                                      │       │
│  │                                                      │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Gmail API   │    │  ML Pipeline │    │ Data Storage │
│              │    │              │    │              │
│ • OAuth 2.0  │    │ • TF-IDF     │    │ • CSV        │
│ • REST API   │    │ • Naive      │    │ • Pickle     │
│ • Scopes     │    │   Bayes      │    │ • JSON       │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## ⚙️ BACKEND ARCHITECTURE

### File Structure

```
Spam-email-classify/
│
├── app.py                      # Main Flask application
├── config.py                   # Configuration settings
├── gmail_oauth.py              # Gmail OAuth & API integration
├── naive_bayes.py              # ML model training & classification
├── utils.py                    # Utility functions (logger, decorators)
│
├── spam_data.csv               # Training dataset
├── stopwords.txt               # Vietnamese stopwords
├── spam_pipeline.pkl           # Trained ML pipeline
├── training_metrics.json       # Training performance metrics
│
├── client_secret.json          # Google OAuth credentials
├── requirements.txt            # Python dependencies
│
└── images/                     # Generated charts
    ├── model_performance.png
    └── confusion_matrix.png
```

### Core Modules

#### 1. **app.py** - Flask Application

```python
Responsibilities:
  • Initialize Flask app with CORS
  • Define all API routes
  • Handle HTTP requests/responses
  • Manage session state
  • Coordinate between modules

Key Functions:
  • initialize_model()          → Load/train ML model
  • get_emails_route()          → Fetch & classify emails
  • mark_spam()/mark_not_spam() → Update email labels
  • analyze_text()              → Analyze custom email
  • retrain_model()             → Retrain ML model
  • add_to_dataset()            → Add training data
```

#### 2. **gmail_oauth.py** - Gmail Integration

```python
Responsibilities:
  • Handle OAuth 2.0 flow
  • Manage credentials
  • Interact with Gmail API
  • CRUD operations on emails

Key Functions:
  • get_authorization_url()     → Generate OAuth URL
  • get_credentials_from_code() → Exchange code for token
  • get_gmail_service()         → Create Gmail API service
  • get_emails()                → Fetch emails from Gmail
  • move_to_spam()              → Move email to spam folder
  • send_email()                → Send new email
  • get_mailbox_stats()         → Get inbox/spam counts
```

#### 3. **naive_bayes.py** - Machine Learning

```python
Responsibilities:
  • Preprocess text data
  • Train Naive Bayes model
  • Classify emails
  • Generate performance metrics

Key Functions:
  • preprocess_text()           → Clean & tokenize text
  • train_model()               → Train with GridSearchCV
  • classify_email()            → Predict spam/ham
  • save_model_performance_chart() → Generate visuals
  • save_confusion_matrix()     → Generate confusion matrix
```

#### 4. **config.py** - Configuration

```python
Settings:
  • File paths (model, data, credentials)
  • OAuth scopes & redirect URI
  • Flask configuration (secret key, session)
```

### API Design

#### REST API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **Authentication** |
| GET | `/login` | Redirect to Google OAuth | - | Redirect |
| GET | `/oauth2callback` | OAuth callback handler | `?code=...` | Redirect to home |
| POST | `/api/logout` | Logout user | - | `{success: bool}` |
| GET | `/api/check-auth` | Check auth status | - | `{authenticated: bool}` |
| **Email Management** |
| GET | `/emails` | Get inbox emails | `?max=20&q=...` | `{emails: [], nextPageToken}` |
| GET | `/spam_emails` | Get spam emails | `?max=20&q=...` | `{emails: [], nextPageToken}` |
| POST | `/mark_spam` | Mark as spam | `{email_id, subject, content}` | `{success: bool}` |
| POST | `/mark_not_spam` | Unmark spam | `{email_id, subject, content}` | `{success: bool}` |
| POST | `/mark_read` | Mark as read | `{email_id}` | `{success: bool}` |
| POST | `/delete_email` | Delete email | `{email_id}` | `{success: bool}` |
| POST | `/send_email` | Send new email | `{to, subject, body}` | `{success: bool}` |
| **ML & Analysis** |
| POST | `/analyze_text` | Analyze email text | `{subject, content}` | `{classification, confidence, keywords}` |
| POST | `/add_to_dataset` | Add training data | `{subject, content, label}` | `{success: bool}` |
| POST | `/retrain` | Retrain model | - | `{success: bool}` |
| GET | `/api/stats` | Get statistics | - | `{inbox_count, metrics, ...}` |

#### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Classification Response:**
```json
{
  "classification": "spam",
  "confidence": 95.67,
  "top_keywords": [
    {
      "word": "khuyến",
      "weight": -2.145,
      "impact": 3.456,
      "explanation": "Từ này thường xuất hiện trong spam"
    }
  ],
  "email_stats": {
    "total_length": 245,
    "word_count": 42,
    "uppercase_ratio": 0.15,
    "has_urls": true,
    "has_numbers": true,
    "special_char_count": 8
  }
}
```

---

## 🎨 FRONTEND ARCHITECTURE

### File Structure

```
vite-frontend/
├── src/
│   ├── main.jsx                 # Entry point
│   ├── App.jsx                  # Main app component with routing
│   │
│   ├── pages/                   # Page components
│   │   ├── LoginPage.jsx
│   │   ├── InboxPage.jsx
│   │   ├── SpamPage.jsx
│   │   ├── AnalyzerPage.jsx
│   │   └── StatsPage.jsx
│   │
│   ├── components/              # Reusable components
│   │   ├── Sidebar.jsx
│   │   ├── EmailList.jsx
│   │   ├── EmailAnalyzer.jsx
│   │   ├── ComposeModal.jsx
│   │   ├── Stats.jsx
│   │   ├── SplashScreen.jsx
│   │   │
│   │   ├── email/              # Email-specific components
│   │   │   ├── EmailItem.jsx
│   │   │   ├── EmailModal.jsx
│   │   │   ├── EmailHeader.jsx
│   │   │   └── EmailContent.jsx
│   │   │
│   │   ├── analyzer/           # Analyzer components
│   │   │   ├── AnalyzerForm.jsx
│   │   │   ├── AnalysisResult.jsx
│   │   │   ├── KeywordImpact.jsx
│   │   │   └── ResultExplanation.jsx
│   │   │
│   │   ├── compose/            # Compose email components
│   │   │   ├── ModalHeader.jsx
│   │   │   ├── ModalBody.jsx
│   │   │   └── ModalFooter.jsx
│   │   │
│   │   └── stats/              # Statistics components
│   │       ├── StatsOverview.jsx
│   │       ├── ModelPerformance.jsx
│   │       ├── ConfidenceLevels.jsx
│   │       └── SpamPatterns.jsx
│   │
│   ├── services/               # API services
│   │   └── api.js
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── useDocumentTitle.js
│   │
│   └── assets/                 # Static assets
│       ├── styles.css
│       └── animations/
│           └── email-animation.json
│
├── public/                     # Public static files
│   ├── index.html
│   └── manifest.json
│
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
└── postcss.config.js           # PostCSS config
```

### Component Hierarchy

```
App.jsx
│
├── SplashScreen
│
└── Router
    │
    ├── LoginPage
    │
    └── Authenticated Layout
        │
        ├── Sidebar
        │
        └── Main Content
            │
            ├── InboxPage
            │   ├── EmailList
            │   │   ├── EmailItem (multiple)
            │   │   └── EmailModal
            │   │       ├── EmailHeader
            │   │       └── EmailContent
            │   └── ComposeModal
            │       ├── ModalHeader
            │       ├── ModalBody
            │       └── ModalFooter
            │
            ├── SpamPage
            │   └── (Same structure as InboxPage)
            │
            ├── AnalyzerPage
            │   ├── AnalyzerForm
            │   ├── AnalysisResult
            │   ├── KeywordImpact
            │   └── ResultExplanation
            │
            └── StatsPage
                ├── StatsOverview
                ├── ModelPerformance
                ├── ConfidenceLevels
                ├── SpamPatterns
                └── UsageGuide
```

### State Management

```javascript
// No global state management (Redux/Context)
// Each component manages its own state with useState/useEffect

Example - InboxPage:
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pageToken, setPageToken] = useState(null)

  useEffect(() => {
    fetchEmails()
  }, [searchQuery, pageToken])
```

### Routing

```javascript
// React Router configuration in App.jsx

<Routes>
  <Route path="/login" element={<LoginPage />} />
  
  {/* Protected Routes */}
  <Route path="/" element={<InboxPage />} />
  <Route path="/spam" element={<SpamPage />} />
  <Route path="/analyzer" element={<AnalyzerPage />} />
  <Route path="/stats" element={<StatsPage />} />
</Routes>
```

---

## 🤖 MACHINE LEARNING PIPELINE

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ML PIPELINE FLOW                         │
└─────────────────────────────────────────────────────────────┘

CSV Data → Preprocessing → TF-IDF Vectorization → Naive Bayes
   │            │                  │                    │
   │            │                  │                    │
   ▼            ▼                  ▼                    ▼
spam_data   Clean text      Feature matrix       Classification
  .csv      • Remove HTML   (sparse matrix)       • Predict
            • Normalize                            • Probabilities
            • Tokenize                             • Keywords
            • Stopwords
```

### Training Pipeline (scikit-learn Pipeline)

```python
Pipeline([
    ('vectorizer', TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=2
    )),
    ('classifier', MultinomialNB(
        alpha=0.1
    ))
])
```

### Model Files

```
spam_pipeline.pkl           # Serialized Pipeline (TF-IDF + NB)
   ├── TfidfVectorizer      # Feature extraction
   │   ├── vocabulary_      # Word → Index mapping
   │   ├── idf_             # IDF weights
   │   └── max_features     # Feature limit
   │
   └── MultinomialNB        # Classifier
       ├── class_log_prior_ # log P(class)
       ├── feature_log_prob_# log P(word|class)
       └── alpha            # Smoothing parameter
```

### Training Workflow

```python
# Detailed training process (naive_bayes.py)

def train_model(csv_file):
    # 1. Load data
    data = pd.read_csv(csv_file)
    
    # 2. Preprocess
    data['processed_text'] = data['text'].apply(preprocess_text)
    
    # 3. Split data
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.25, stratify=y_train_val
    )
    
    # 4. GridSearchCV for hyperparameter tuning
    grid_search = GridSearchCV(
        pipeline,
        param_grid={
            'vectorizer__max_features': [3000, 5000, 10000],
            'vectorizer__ngram_range': [(1, 1), (1, 2)],
            'vectorizer__min_df': [2, 3],
            'classifier__alpha': [0.01, 0.1, 0.5, 1.0]
        },
        cv=5,
        scoring='f1_weighted'
    )
    
    # 5. Train on train set
    grid_search.fit(X_train, y_train)
    
    # 6. Evaluate on train/val/test
    evaluate_on_train()
    evaluate_on_validation()
    evaluate_on_test()
    
    # 7. Check overfitting
    if train_accuracy - val_accuracy > 0.1:
        print("⚠️ Overfitting detected!")
    
    # 8. Save model & metrics
    joblib.dump(best_model, PIPELINE_PATH)
    save_training_metrics(...)
    save_visualizations(...)
    
    return model, vectorizer
```

**Xem chi tiết tại:** [ML_PIPELINE.md](ML_PIPELINE.md)

---

## 🔄 LUỒNG DỮ LIỆU

### 1. User Login Flow

```
┌──────┐                ┌──────┐              ┌──────┐
│ User │                │Flask │              │Google│
└──┬───┘                └──┬───┘              └──┬───┘
   │                       │                     │
   │ 1. Visit /login       │                     │
   ├──────────────────────►│                     │
   │                       │                     │
   │                       │ 2. Generate auth URL│
   │                       ├────────────────────►│
   │                       │                     │
   │ 3. Redirect to Google │                     │
   │◄──────────────────────┤                     │
   │                       │                     │
   │ 4. User authorizes    │                     │
   ├───────────────────────────────────────────►│
   │                       │                     │
   │ 5. Callback with code │                     │
   ◄───────────────────────────────────────────┤
   │                       │                     │
   │ 6. /oauth2callback?code=...                │
   ├──────────────────────►│                     │
   │                       │                     │
   │                       │ 7. Exchange token   │
   │                       ├────────────────────►│
   │                       │                     │
   │                       │ 8. Return credentials│
   │                       │◄────────────────────┤
   │                       │                     │
   │                       │ 9. Save to session  │
   │                       │ ──┐                 │
   │                       │   │                 │
   │                       │◄──┘                 │
   │                       │                     │
   │ 10. Redirect to home  │                     │
   │◄──────────────────────┤                     │
```

### 2. Fetch & Classify Emails Flow

```
┌──────┐    ┌────────┐    ┌──────┐    ┌──────┐    ┌────┐
│React │    │ Flask  │    │Gmail │    │  ML  │    │Data│
└──┬───┘    └───┬────┘    └──┬───┘    └──┬───┘    └─┬──┘
   │            │              │           │          │
   │ GET /emails│              │           │          │
   ├───────────►│              │           │          │
   │            │              │           │          │
   │            │ Get emails   │           │          │
   │            ├─────────────►│           │          │
   │            │              │           │          │
   │            │ Return raw   │           │          │
   │            │◄──────────── ┤           │          │
   │            │              │           │          │
   │            │ Load model   │           │          │
   │            ├──────────────────────────►│          │
   │            │              │           │          │
   │            │              │  Load from pipeline  │
   │            │              │           ├─────────►│
   │            │              │           │          │
   │            │              │           │◄─────────┤
   │            │              │           │          │
   │            │ Classify each email      │          │
   │            ├──────────────────────────►│          │
   │            │              │           │          │
   │            │   • Preprocess text      │          │
   │            │   • Vectorize (TF-IDF)   │          │
   │            │   • Predict (Naive Bayes)│          │
   │            │   • Extract keywords     │          │
   │            │              │           │          │
   │            │ Classification results   │          │
   │            │◄──────────────────────────┤          │
   │            │              │           │          │
   │ Return emails with classification     │          │
   │◄───────────┤              │           │          │
   │            │              │           │          │
   │ Update UI  │              │           │          │
   │ ──┐        │              │           │          │
   │   │        │              │           │          │
   │◄──┘        │              │           │          │
```

### 3. Mark Spam & Retrain Flow

```
┌──────┐    ┌────────┐    ┌──────┐    ┌──────┐    ┌────┐
│React │    │ Flask  │    │Gmail │    │  ML  │    │ CSV│
└──┬───┘    └───┬────┘    └──┬───┘    └──┬───┘    └─┬──┘
   │            │              │           │          │
   │ POST /mark_spam          │           │          │
   ├───────────►│              │           │          │
   │  {email_id,│              │           │          │
   │   subject, │              │           │          │
   │   content} │              │           │          │
   │            │              │           │          │
   │            │ Move to SPAM │           │          │
   │            ├─────────────►│           │          │
   │            │              │           │          │
   │            │ Success      │           │          │
   │            │◄──────────── ┤           │          │
   │            │              │           │          │
   │            │ Add to dataset           │          │
   │            ├──────────────────────────►│          │
   │            │              │           │          │
   │            │              │    Append to CSV     │
   │            │              │           ├─────────►│
   │            │              │           │          │
   │            │              │           │◄─────────┤
   │            │              │           │          │
   │            │ Retrain model            │          │
   │            ├──────────────────────────►│          │
   │            │              │           │          │
   │            │              │  • Load updated CSV  │
   │            │              │  • Preprocess        │
   │            │              │  • GridSearchCV      │
   │            │              │  • Train new model   │
   │            │              │  • Save pipeline     │
   │            │              │           │          │
   │            │ Training complete        │          │
   │            │◄──────────────────────────┤          │
   │            │              │           │          │
   │ Success    │              │           │          │
   │◄───────────┤              │           │          │
```

### 4. Analyze Custom Text Flow

```
┌──────┐              ┌────────┐              ┌──────┐
│React │              │ Flask  │              │  ML  │
└──┬───┘              └───┬────┘              └──┬───┘
   │                     │                       │
   │ User enters email   │                       │
   │ in Analyzer page    │                       │
   │ ──┐                 │                       │
   │   │                 │                       │
   │◄──┘                 │                       │
   │                     │                       │
   │ POST /analyze_text  │                       │
   ├────────────────────►│                       │
   │  {subject, content} │                       │
   │                     │                       │
   │                     │ Load model            │
   │                     ├──────────────────────►│
   │                     │                       │
   │                     │ Classify email        │
   │                     ├──────────────────────►│
   │                     │                       │
   │                     │   • Preprocess        │
   │                     │   • TF-IDF vectorize  │
   │                     │   • Predict           │
   │                     │   • Get probabilities │
   │                     │   • Extract keywords  │
   │                     │   • Analyze stats     │
   │                     │                       │
   │                     │ Detailed results      │
   │                     │◄──────────────────────┤
   │                     │  {classification,     │
   │                     │   confidence,         │
   │                     │   top_keywords,       │
   │                     │   email_stats}        │
   │                     │                       │
   │ Return analysis     │                       │
   │◄────────────────────┤                       │
   │                     │                       │
   │ Display:            │                       │
   │  • Spam/Ham badge   │                       │
   │  • Confidence %     │                       │
   │  • Keyword chart    │                       │
   │  • Explanation      │                       │
   │  • Add to dataset   │                       │
   │    button           │                       │
   │ ──┐                 │                       │
   │   │                 │                       │
   │◄──┘                 │                       │
```

---

## 💾 DATABASE & STORAGE

### Data Storage Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  CSV Files (Training Data)                       │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • spam_data.csv           Main dataset         │   │
│  │  • spam_data_backup_*.csv  Automatic backups    │   │
│  │                                                  │   │
│  │  Format: label,text                             │   │
│  │  Size: ~10,000 rows                             │   │
│  │  Updates: On add_to_dataset() calls             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Pickle Files (ML Models)                        │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • spam_pipeline.pkl       Trained pipeline     │   │
│  │                            (TF-IDF + NB)        │   │
│  │                                                  │   │
│  │  Size: ~5-10 MB                                 │   │
│  │  Updates: On retrain() calls                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  JSON Files (Metadata)                           │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • training_metrics.json   Training metrics     │   │
│  │  • client_secret.json      OAuth credentials    │   │
│  │                                                  │   │
│  │  Updates: On retrain() calls                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Session Storage (Runtime)                       │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • Flask session['credentials']  OAuth tokens   │   │
│  │  • Flask session['user']         User info      │   │
│  │  • Flask session['state']        CSRF token     │   │
│  │                                                  │   │
│  │  Persistence: 24 hours                          │   │
│  │  Storage: Filesystem (Flask SESSION_TYPE)       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Image Files (Visualizations)                    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • images/model_performance.png                 │   │
│  │  • images/confusion_matrix.png                  │   │
│  │                                                  │   │
│  │  Updates: On retrain() calls                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### No Traditional Database

⚠️ **Lưu ý**: Hệ thống này **không sử dụng database** truyền thống (MySQL, PostgreSQL, MongoDB).

**Lý do:**
- Dữ liệu email thực sự nằm trên **Gmail servers**
- Chỉ cần lưu **training dataset** (CSV) và **model** (Pickle)
- Session management đơn giản với Flask session
- Không cần persistent user database

**Ưu điểm:**
- ✅ Đơn giản, dễ deploy
- ✅ Không cần setup database server
- ✅ Dữ liệu luôn sync với Gmail
- ✅ Portable - chỉ cần copy files

**Nhược điểm:**
- ❌ Không lưu lịch sử phân loại
- ❌ Không có user management phức tạp
- ❌ Session không persistent across server restarts
- ❌ CSV không hiệu quả cho dataset rất lớn (>1M rows)

### Data Persistence Strategy

```python
# 1. Training Data (CSV)
def add_to_dataset_internal(label, content, subject=''):
    # Read existing data
    df = pd.read_csv(DATA_FILE)
    
    # Check duplicates
    existing_index = df[df['text'] == full_text].index
    
    if len(existing_index) > 0:
        # Update label if different
        df.loc[existing_index[0], 'label'] = label
    else:
        # Append new data
        new_data = pd.DataFrame({'label': [label], 'text': [full_text]})
        df = pd.concat([df, new_data], ignore_index=True)
    
    # Save back to CSV
    df.to_csv(DATA_FILE, index=False)

# 2. Model Persistence (Pickle)
def train_model(csv_file):
    # ... training logic ...
    
    # Save pipeline
    joblib.dump(best_model, PIPELINE_PATH)
    
    # Save metrics
    with open('training_metrics.json', 'w') as f:
        json.dump(metrics_data, f)

# 3. Session Persistence (Flask)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

@app.route('/oauth2callback')
def oauth2callback():
    # Save credentials to session
    session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        # ...
    }
    session['user'] = {
        'email': user_info['emailAddress'],
        'username': user_info['emailAddress'].split('@')[0]
    }
```

---

## 🔐 AUTHENTICATION & SECURITY

### OAuth 2.0 Flow

```
┌────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH 2.0 FLOW                   │
└────────────────────────────────────────────────────────────┘

1. User clicks "Login with Google"
   ↓
2. Flask generates authorization URL with scopes
   ↓
3. User redirected to Google login page
   ↓
4. User authorizes the app
   ↓
5. Google redirects back to /oauth2callback with code
   ↓
6. Flask exchanges code for access_token & refresh_token
   ↓
7. Flask saves credentials to session
   ↓
8. User redirected to home page (authenticated)
```

### OAuth Configuration

```python
# config.py
OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'openid'
]

OAUTH_REDIRECT_URI = "http://localhost:5001/oauth2callback"
```

### Security Measures

#### 1. **CSRF Protection**

```python
# State parameter to prevent CSRF
authorization_url, state = flow.authorization_url(...)
session['state'] = state

# Verify state in callback
if request.args.get('state') != session.get('state'):
    return "Invalid state parameter", 400
```

#### 2. **Session Security**

```python
app.config['SECRET_KEY'] = os.urandom(24)  # Random secret key
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
```

#### 3. **CORS Configuration**

```python
CORS(app, supports_credentials=True)
# Only allow specific origins in production:
# CORS(app, origins=['https://yourdomain.com'], supports_credentials=True)
```

#### 4. **Login Required Decorator**

```python
# utils.py
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'credentials' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Usage
@app.route('/emails')
@login_required
def get_emails_route():
    # ...
```

#### 5. **Token Refresh**

```python
def get_gmail_service():
    credentials = get_credentials_from_session()
    
    if not credentials.valid:
        if credentials.expired and credentials.refresh_token:
            # Auto-refresh expired token
            credentials.refresh(Request())
            save_credentials(credentials)
        else:
            return None
    
    return build('gmail', 'v1', credentials=credentials)
```

### Sensitive Data Protection

```
client_secret.json     → .gitignore (NEVER commit!)
session files          → .gitignore
*.pkl (models)         → .gitignore (too large, regenerate)
spam_data.csv          → Commit (but sanitize if contains real emails)
```

---

## 🚀 DEPLOYMENT

### Development Mode

```bash
# Terminal 1: Start Backend
cd Spam-email-classify
python app.py
# → http://localhost:5001

# Terminal 2: Start Frontend
cd vite-frontend
npm run dev
# → http://localhost:5173
```

**Access**: http://localhost:5173 (Vite proxy → Backend)

### Production Build

```bash
# 1. Build Frontend
cd vite-frontend
npm run build
# → Generates dist/ folder

# 2. Start Flask (serves static files from dist/)
cd ..
python app.py
# → http://localhost:5001
```

**Access**: http://localhost:5001 (Flask serves everything)

### Deployment Checklist

#### Prerequisites
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Google Cloud Console project created
- [ ] OAuth credentials configured
- [ ] `client_secret.json` obtained

#### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/InfinityZero3000/Spam-email-classify.git
cd Spam-email-classify

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Install Frontend dependencies
cd vite-frontend
npm install

# 4. Configure OAuth
# - Place client_secret.json in project root
# - Update OAUTH_REDIRECT_URI in config.py

# 5. Build Frontend (for production)
npm run build

# 6. Start Backend
cd ..
python app.py
```

#### Environment Variables (Optional)

```bash
# .env file
FLASK_ENV=production
FLASK_SECRET_KEY=your-secret-key-here
OAUTH_REDIRECT_URI=https://yourdomain.com/oauth2callback
```

### Deployment Platforms

#### 1. **Heroku**

```bash
# Procfile
web: gunicorn app:app
```

#### 2. **Google Cloud Run**

```dockerfile
# Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["gunicorn", "app:app"]
```

#### 3. **AWS EC2**

```bash
# Install dependencies
sudo apt update
sudo apt install python3-pip
pip3 install -r requirements.txt

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

### Production Considerations

#### 1. **Gunicorn (WSGI Server)**

```bash
# Install
pip install gunicorn

# Run
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

#### 2. **Nginx (Reverse Proxy)**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 3. **SSL/HTTPS (Let's Encrypt)**

```bash
sudo certbot --nginx -d yourdomain.com
```

#### 4. **Logging**

```python
# utils.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
```

---

## 📊 MONITORING & MAINTENANCE

### Logs

```python
# Check logs
tail -f app.log

# Log levels
logger.info("Normal operation")
logger.warning("Something unusual")
logger.error("Error occurred")
```

### Model Retraining Schedule

```
Manual Trigger:   User clicks "Retrain Model" in Stats page
Automatic:        When add_to_dataset() is called
Recommended:      Weekly if active users add many emails
```

### Backup Strategy

```bash
# Backup training data
cp spam_data.csv spam_data_backup_$(date +%Y%m%d).csv

# Backup model
cp spam_pipeline.pkl spam_pipeline_backup_$(date +%Y%m%d).pkl
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### 1. **OAuth Error: redirect_uri_mismatch**

**Cause**: Redirect URI in Google Cloud Console ≠ `OAUTH_REDIRECT_URI` in `config.py`

**Solution**:
```python
# config.py
OAUTH_REDIRECT_URI = "http://localhost:5001/oauth2callback"

# Google Cloud Console → OAuth 2.0 Client IDs
# Authorized redirect URIs: http://localhost:5001/oauth2callback
```

#### 2. **Model not loading**

**Cause**: `spam_pipeline.pkl` not found or corrupted

**Solution**:
```python
# Delete old pickle
rm spam_pipeline.pkl

# Retrain
POST /retrain
```

#### 3. **CORS Error in Frontend**

**Cause**: Vite proxy not configured correctly

**Solution**:
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/emails': 'http://localhost:5001',
      '/api': 'http://localhost:5001',
      // ...
    }
  }
}
```

---

## 📚 THAM KHẢO

### Kiến trúc liên quan
- [ARCHITECTURE.md](ARCHITECTURE.md) - Kiến trúc Development vs Production
- [ML_PIPELINE.md](ML_PIPELINE.md) - Chi tiết Machine Learning Pipeline
- [README.md](README.md) - Hướng dẫn sử dụng

### Technologies
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Gmail API](https://developers.google.com/gmail/api)
- [scikit-learn](https://scikit-learn.org/)

---

**📅 Cập nhật lần cuối**: 22/10/2025  
**🏷️ Phiên bản**: 1.0  
**👨‍💻 Tác giả**: InfinityZero3000
