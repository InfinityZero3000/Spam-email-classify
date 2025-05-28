# Các hàm tiện ích chung cho ứng dụng
from functools import wraps
from flask import session, jsonify
import traceback
import logging

# Thiết lập logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('spam_classifier')

def handle_error(e, message):
    """
    Hàm xử lý lỗi thống nhất
    
    Args:
        e: Exception - Đối tượng lỗi
        message: str - Thông báo lỗi
    
    Returns:
        dict - Thông tin lỗi để ghi log
    """
    error_msg = f"{message}: {str(e)}"
    logger.error(error_msg)
    try:
        logger.debug(traceback.format_exc())
    except NameError:
        # Fallback if traceback is not available
        import traceback as tb
        logger.debug(tb.format_exc())
    return {'error': error_msg}

def login_required(f):
    """
    Decorator kiểm tra đăng nhập
    
    Args:
        f: function - Hàm cần kiểm tra đăng nhập
    
    Returns:
        function - Hàm wrapper
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'credentials' not in session or 'user' not in session:
            return jsonify({'error': 'Chưa đăng nhập'}), 401
        return f(*args, **kwargs)
    return decorated_function

def get_service_safely():
    """
    Lấy Gmail service an toàn với kiểm tra lỗi
    
    Returns:
        object|None - Gmail service hoặc None nếu lỗi
    """
    from gmail_oauth import get_gmail_service
    service = get_gmail_service()
    if not service:
        logger.error("Lỗi xác thực, không thể lấy Gmail service")
        return None
    return service
