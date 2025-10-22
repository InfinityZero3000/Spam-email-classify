# Quick Start Guide 🚀

## Chạy ứng dụng trong 3 bước

### 1. Cài đặt dependencies (chỉ lần đầu)

```bash
# Backend dependencies
pip install -r requirements_mac.txt

# Frontend dependencies
cd vite-frontend
npm install
cd ..
```

### 2. Cấu hình Google OAuth (chỉ lần đầu)

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo OAuth Client ID
3. Thêm redirect URI: `http://localhost:5001/oauth2callback`
4. Tải file JSON và đổi tên thành `client_secret.json`
5. Đặt vào thư mục gốc dự án

Chi tiết: Xem `google_cloud_setup_guide.md`

### 3. Test hệ thống (khuyến nghị)

```bash
./test_system.sh
```

Script này sẽ kiểm tra:
- Python, Node.js đã cài đặt
- Dependencies đã cài đặt
- Files cần thiết đã có
- Ports có sẵn hay đang dùng

### 4. Chạy ứng dụng

#### Option A: Development Mode (có hot reload)

```bash
./run_dev.sh
```

Truy cập: **http://localhost:5173** ✨

#### Option B: Production Mode

```bash
./run_mac.sh
```

Truy cập: **http://localhost:5001** 🎯

---

## Troubleshooting nhanh

### "npm: command not found"
```bash
# Cài Node.js từ https://nodejs.org/
# Hoặc dùng Homebrew
brew install node
```

### "Permission denied: ./run_dev.sh"
```bash
chmod +x run_dev.sh run_mac.sh
```

### Port 5001 đã được dùng
```bash
# Tìm và kill process
lsof -i :5001
kill -9 <PID>
```

### Frontend không kết nối backend
- Đảm bảo backend đang chạy ở port 5001
- Kiểm tra: `curl http://localhost:5001/api/check-auth`

### OAuth lỗi "redirect_uri_mismatch"
- Kiểm tra redirect URI trong Google Cloud Console
- Phải là: `http://localhost:5001/oauth2callback`

---

## Các file quan trọng

| File | Mô tả |
|------|-------|
| `run_dev.sh` | Script chạy development mode |
| `run_mac.sh` | Script chạy production mode |
| `client_secret.json` | Google OAuth credentials |
| `config.py` | Cấu hình backend |
| `vite-frontend/vite.config.js` | Cấu hình frontend + proxy |

---

## Đọc thêm

- `README.md` - Hướng dẫn đầy đủ
- `DEVELOPMENT.md` - Chi tiết về development
- `ARCHITECTURE.md` - Kiến trúc ứng dụng
- `google_cloud_setup_guide.md` - Setup Google Cloud

---

## Commands hữu ích

```bash
# Xem logs backend
tail -f nohup.out  # Nếu chạy background

# Build lại frontend
cd vite-frontend && npm run build && cd ..

# Test backend API
curl http://localhost:5001/api/check-auth

# Xóa cache Python
find . -type d -name "__pycache__" -exec rm -r {} +

# Xóa node_modules và cài lại
cd vite-frontend
rm -rf node_modules package-lock.json
npm install
cd ..
```

---

## Câu hỏi thường gặp

**Q: Tôi nên dùng development hay production mode?**

A: 
- **Development**: Khi đang code, cần hot reload
- **Production**: Khi demo, test performance, hoặc deploy

**Q: Tại sao không dùng port 5000?**

A: Port 5000 thường conflict với AirPlay trên macOS, nên dùng 5001

**Q: Làm sao biết backend đã chạy?**

A: Mở terminal và chạy `curl http://localhost:5001/api/check-auth`

**Q: Tôi có cần chạy cả 2 terminal?**

A: 
- **Development**: Có (hoặc dùng `./run_dev.sh`)
- **Production**: Không, chỉ cần backend

---

Happy coding! 🎉
