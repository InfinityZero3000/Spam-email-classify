# File cấu hình chung cho ứng dụng
import os

# Đường dẫn lưu mô hình và vectorizer
MODEL_PATH = 'spam_model.pkl'
VECTORIZER_PATH = 'vectorizer.pkl'
PIPELINE_PATH = 'spam_pipeline.pkl'  # Đường dẫn lưu pipeline hoàn chỉnh

# Đường dẫn đến file dữ liệu huấn luyện
DATA_FILE = 'spam_data.csv'

# Đường dẫn đến file stopwords
STOPWORDS_FILE = 'stopwords.txt'

# Đường dẫn đến file client secret cho Google OAuth
CLIENT_SECRET_FILE = 'client_secret.json'

# Phạm vi quyền truy cập cho Google OAuth
OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'openid'
]

# URL cho OAuth callback
OAUTH_REDIRECT_URI = "http://localhost:5001/oauth2callback"

# Cấu hình Flask
FLASK_CONFIG = {
    'SECRET_KEY': os.urandom(24),
    'SESSION_TYPE': 'filesystem',
    'SESSION_PERMANENT': True,
    'PERMANENT_SESSION_LIFETIME': 86400,  # 24 giờ
    'JSON_AS_ASCII': False  # Đảm bảo JSON không chuyển đổi ký tự Unicode
}
