from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from flask import session
import re
import html
import base64
import traceback
from email.mime.text import MIMEText
from config import OAUTH_SCOPES, CLIENT_SECRET_FILE, OAUTH_REDIRECT_URI
from utils import logger

def get_oauth_flow():
    """Tạo OAuth flow cho Gmail API.
    
    Returns:
        Flow|None - Đối tượng OAuth flow hoặc None nếu lỗi
    """
    try:
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRET_FILE,
            scopes=OAUTH_SCOPES,
            redirect_uri=OAUTH_REDIRECT_URI
        )
        return flow
    except Exception as e:
        logger.error(f"Lỗi khi tạo OAuth flow: {str(e)}")
        return None

def get_authorization_url():
    """Tạo URL để người dùng xác thực.
    
    Returns:
        str|None - URL xác thực hoặc None nếu lỗi
    """
    try:
        flow = get_oauth_flow()
        if not flow:
            return None

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        session['state'] = state
        return authorization_url
    except Exception as e:
        logger.error(f"Lỗi khi tạo URL xác thực: {str(e)}")
        return None

def get_credentials_from_code(code):
    """Lấy credentials từ authorization code.
    
    Args:
        code: str - Authorization code từ Google OAuth
        
    Returns:
        Credentials|None - Credentials hoặc None nếu lỗi
    """
    try:
        flow = get_oauth_flow()
        if not flow:
            return None

        flow.fetch_token(code=code, include_client_id=True)
        return flow.credentials
    except Exception as e:
        logger.error(f"Lỗi khi lấy credentials từ code: {str(e)}")
        return None

def get_credentials_from_session():
    """Lấy credentials từ session.
    
    Returns:
        Credentials|None - Credentials hoặc None nếu lỗi
    """
    try:
        if 'credentials' not in session:
            return None

        credentials_dict = session['credentials']
        return Credentials(
            token=credentials_dict['token'],
            refresh_token=credentials_dict['refresh_token'],
            token_uri=credentials_dict['token_uri'],
            client_id=credentials_dict['client_id'],
            client_secret=credentials_dict['client_secret'],
            scopes=credentials_dict['scopes']
        )
    except Exception as e:
        logger.error(f"Lỗi khi lấy credentials từ session: {str(e)}")
        return None

def save_credentials(credentials):
    """Lưu credentials vào session.
    
    Args:
        credentials: Credentials - Đối tượng credentials cần lưu
        
    Returns:
        bool - True nếu thành công, False nếu lỗi
    """
    try:
        session['credentials'] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        return True
    except Exception as e:
        logger.error(f"Lỗi khi lưu credentials: {str(e)}")
        return False

def get_gmail_service():
    """Tạo và trả về dịch vụ Gmail API.
    
    Returns:
        object|None - Gmail service hoặc None nếu lỗi
    """
    try:
        credentials = get_credentials_from_session()
        if not credentials:
            return None

        if not credentials.valid:
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                save_credentials(credentials)
            else:
                return None

        return build('gmail', 'v1', credentials=credentials)
    except Exception as e:
        logger.error(f"Lỗi khi tạo Gmail service: {str(e)}")
        return None

def get_emails(service, max_results=20, query=None, page_token=None, label_ids=['INBOX']):
    """Lấy danh sách email từ Gmail API."""
    try:
        # Import ở đây để tránh import vòng
        from app import initialize_model
        model, vectorizer = initialize_model()

        # Xây dựng truy vấn
        search_query = query if query else ''

        # Thực hiện tìm kiếm
        results = service.users().messages().list(
            userId='me',
            labelIds=label_ids,
            q=search_query,
            maxResults=max_results,
            pageToken=page_token
        ).execute()

        messages = results.get('messages', [])
        emails = []

        for message in messages:
            try:
                # Lấy thông tin chi tiết của email
                msg = service.users().messages().get(userId='me', id=message['id']).execute()

                # Lấy thông tin cơ bản
                headers = msg['payload']['headers']
                subject = next((h['value'] for h in headers if h['name'].lower() == 'subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'].lower() == 'from'), 'Unknown')
                date = next((h['value'] for h in headers if h['name'].lower() == 'date'), '')

                # Lấy nội dung email
                content, plain_content = get_email_content(msg)

                # Kiểm tra trạng thái đã đọc
                read = 'UNREAD' not in msg.get('labelIds', [])

                # Tạo đối tượng email
                email_data = {
                    'id': message['id'],
                    'subject': subject,
                    'sender': sender,
                    'date': date,
                    'content': content,
                    'plain_content': plain_content,
                    'read': read
                }

                # Phân loại email
                try:
                    # Sử dụng plain_content cho phân loại nếu có, nếu không thì sử dụng content
                    content_for_classification = plain_content if plain_content else strip_html_tags(content)
                    result = classify_email(model, vectorizer, content_for_classification, email_data['subject'])
                    email_data.update(result)

                    # Đã xóa logic tự động di chuyển email spam có độ tin cậy cao
                except Exception as e:
                    print(f"Lỗi khi phân loại email {email_data['id']}: {str(e)}")
                    traceback.print_exc()
                    email_data.update({
                        'classification': 'unknown',
                        'confidence': 0
                    })

                emails.append(email_data)
            except Exception as e:
                print(f"Lỗi xử lý email {message['id']}: {str(e)}")
                traceback.print_exc()
                continue

        # Trả về danh sách email cùng với nextPageToken cho phân trang
        return {
            'emails': emails,
            'nextPageToken': results.get('nextPageToken')
        }
    except Exception as e:
        print(f"Lỗi chung khi lấy danh sách email: {str(e)}")
        traceback.print_exc()
        return {
            'emails': [],
            'nextPageToken': None,
            'error': str(e)
        }

def get_email_content(msg):
    """Lấy nội dung email từ đối tượng email."""
    html_content = ""
    plain_content = ""

    if 'parts' in msg['payload']:
        for part in msg['payload']['parts']:
            if part['mimeType'] == 'text/plain':
                if 'data' in part['body']:
                    plain_content = decode_base64(part['body']['data'])
            elif part['mimeType'] == 'text/html':
                if 'data' in part['body']:
                    html_content = decode_base64(part['body']['data'])
            elif 'parts' in part:
                # Xử lý các phần lồng nhau
                for subpart in part['parts']:
                    if subpart['mimeType'] == 'text/plain':
                        if 'data' in subpart['body']:
                            plain_content = decode_base64(subpart['body']['data'])
                    elif subpart['mimeType'] == 'text/html':
                        if 'data' in subpart['body']:
                            html_content = decode_base64(subpart['body']['data'])
    elif 'body' in msg['payload'] and 'data' in msg['payload']['body']:
        # Email đơn giản không có phần
        if msg['payload']['mimeType'] == 'text/plain':
            plain_content = decode_base64(msg['payload']['body']['data'])
        elif msg['payload']['mimeType'] == 'text/html':
            html_content = decode_base64(msg['payload']['body']['data'])

    # Ưu tiên nội dung HTML
    if html_content:
        return html_content, plain_content
    return plain_content, plain_content

def decode_base64(data):
    """Giải mã chuỗi base64 từ Gmail API."""
    import base64
    return base64.urlsafe_b64decode(data.encode('ASCII')).decode('utf-8', errors='replace')

def strip_html_tags(html_content):
    """Loại bỏ các thẻ HTML từ nội dung."""
    import re
    import html

    if not html_content:
        return ""

    # Chuyển các thẻ <br>, <p>, <div> thành dấu xuống dòng
    html_content = re.sub(r'<br[^>]*>', '\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</p>\s*<p[^>]*>', '\n\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<div[^>]*>', '\n', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'</div>', '\n', html_content, flags=re.IGNORECASE)

    # Loại bỏ các thẻ HTML còn lại
    html_content = re.sub(r'<[^>]+>', '', html_content)

    # Giải mã các ký tự đặc biệt HTML
    html_content = html.unescape(html_content)

    # Loại bỏ khoảng trắng thừa
    html_content = re.sub(r'\n\s*\n', '\n\n', html_content)
    html_content = re.sub(r'[ \t]+', ' ', html_content)

    return html_content.strip()

def move_to_spam(service, email_id):
    """Di chuyển email sang thư mục spam."""
    try:
        # Thêm nhãn SPAM
        service.users().messages().modify(
            userId='me',
            id=email_id,
            body={'addLabelIds': ['SPAM'], 'removeLabelIds': ['INBOX']}
        ).execute()
        return True
    except Exception as e:
        print(f"Lỗi khi chuyển email vào spam: {str(e)}")
        traceback.print_exc()
        return False

def move_to_inbox(service, email_id):
    """Di chuyển email từ spam về inbox."""
    try:
        # Xóa nhãn SPAM và thêm nhãn INBOX
        service.users().messages().modify(
            userId='me',
            id=email_id,
            body={'addLabelIds': ['INBOX'], 'removeLabelIds': ['SPAM']}
        ).execute()
        return True
    except Exception as e:
        print(f"Lỗi khi chuyển email vào inbox: {str(e)}")
        traceback.print_exc()
        return False

def mark_as_read(service, email_id):
    """Đánh dấu email là đã đọc."""
    try:
        # Xóa nhãn UNREAD
        service.users().messages().modify(
            userId='me',
            id=email_id,
            body={'removeLabelIds': ['UNREAD']}
        ).execute()
        return True
    except Exception as e:
        print(f"Lỗi khi đánh dấu email là đã đọc: {str(e)}")
        traceback.print_exc()
        return False

def delete_email(service, email_id):
    """Xóa email."""
    try:
        # Thêm nhãn TRASH
        service.users().messages().trash(userId='me', id=email_id).execute()
        return True
    except Exception as e:
        print(f"Lỗi khi xóa email: {str(e)}")
        traceback.print_exc()
        return False

def send_email(service, to, subject, body):
    """Gửi email mới."""
    try:
        import base64
        from email.mime.text import MIMEText

        # Tạo đối tượng email
        message = MIMEText(body)
        message['to'] = to
        message['subject'] = subject

        # Mã hóa email
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

        # Gửi email
        service.users().messages().send(
            userId='me',
            body={'raw': raw}
        ).execute()

        return True
    except Exception as e:
        print(f"Lỗi khi gửi email: {str(e)}")
        traceback.print_exc()
        return False

def get_mailbox_stats(service):
    """Lấy thống kê về hộp thư."""
    try:
        # Lấy số lượng email trong inbox bằng cách đếm chính xác
        inbox_result = service.users().labels().get(
            userId='me',
            id='INBOX'
        ).execute()
        inbox_count = inbox_result.get('messagesTotal', 0)

        # Lấy số lượng email trong spam bằng cách đếm chính xác
        spam_result = service.users().labels().get(
            userId='me',
            id='SPAM'
        ).execute()
        spam_count = spam_result.get('messagesTotal', 0)

        return {
            'inbox_count': inbox_count,
            'spam_count': spam_count
        }
    except Exception as e:
        print(f"Lỗi khi lấy thống kê hộp thư: {str(e)}")
        traceback.print_exc()
        return {
            'inbox_count': 0,
            'spam_count': 0,
            'error': str(e)
        }

def classify_email(model, vectorizer, content, subject=''):
    """Phân loại email sử dụng mô hình Naive Bayes.
    
    Args:
        model: object - Mô hình đã huấn luyện
        vectorizer: object - Vectorizer đã huấn luyện
        content: str - Nội dung email cần phân loại
        subject: str - Tiêu đề email (tùy chọn)
        
    Returns:
        dict - Kết quả phân loại
    """
    # Import function trực tiếp khi cần để tránh circular import
    # Sử dụng late import pattern
    from naive_bayes import classify_email as nb_classify
    return nb_classify(model, vectorizer, content, subject)
