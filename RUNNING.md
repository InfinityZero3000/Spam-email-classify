# 🚀 Quick Start Guide

## Chạy ứng dụng (Dễ nhất - Production Mode)

### 1. Build và chạy (Port 5001 - Tích hợp đầy đủ)

```bash
# Cách 1: Sử dụng script tự động
chmod +x run_prod.sh
./run_prod.sh

# Cách 2: Chạy thủ công
cd vite-frontend
npm install
npm run build
cd ..
python3 app.py
```

**Mở trình duyệt:** http://localhost:5001

✅ **Ưu điểm:**
- Chỉ cần 1 server (Flask)
- Frontend đã được build sẵn
- Nhanh, ổn định

---

## Development Mode (Port 5173 + 5001)

Nếu bạn muốn chỉnh sửa code và thấy thay đổi real-time:

```bash
# Sử dụng script
chmod +x run_dev.sh
./run_dev.sh
```

**Mở trình duyệt:** http://localhost:5173

✅ **Ưu điểm:**
- Hot reload (tự động reload khi thay đổi code)
- Dev tools
- Vite proxy tự động

---

## ⚠️ Lưu ý quan trọng

### 1. Python version
Script sử dụng `python3` mặc định. Nếu bạn có nhiều version Python:

```bash
# Kiểm tra version
python3 --version

# Hoặc dùng Python 3.11 cụ thể
/usr/local/opt/python@3.11/bin/python3.11 app.py
```

### 2. Dependencies

**Backend (Python):**
```bash
pip3 install flask flask-cors google-auth google-auth-oauthlib \
  google-auth-httplib2 google-api-python-client pandas \
  scikit-learn joblib matplotlib seaborn nltk
```

**Frontend (Node.js):**
```bash
cd vite-frontend
npm install
```

### 3. OAuth Setup

Cần file `client_secret.json` từ Google Cloud Console. Xem `QUICKSTART.md` để setup.

---

## 🔧 Troubleshooting

### Lỗi: Port already in use

```bash
# Kill process trên port 5001
lsof -ti:5001 | xargs kill -9

# Kill process trên port 5173  
lsof -ti:5173 | xargs kill -9
```

### Lỗi: Module not found

```bash
# Cài lại dependencies
pip3 install -r requirements.txt
```

### Frontend cũ không cập nhật

```bash
# Build lại frontend
cd vite-frontend
rm -rf dist
npm run build
cd ..
```

---

## 📊 Cách hoạt động

### Production Mode (Recommended)
```
Browser → http://localhost:5001
          ↓
     Flask Server (port 5001)
          ├── Serve Static Files (dist/)
          └── API Endpoints (/api/*, /emails)
```

### Development Mode
```
Browser → http://localhost:5173
          ↓
     Vite Dev Server (port 5173)
          ├── Hot Reload
          └── Proxy API → http://localhost:5001
                           ↓
                      Flask Server (port 5001)
                           └── API Endpoints
```

---

## 🎯 Tóm tắt Commands

| Mode | Command | URL | Khi nào dùng |
|------|---------|-----|--------------|
| **Production** | `./run_prod.sh` | http://localhost:5001 | Chạy ứng dụng bình thường |
| **Development** | `./run_dev.sh` | http://localhost:5173 | Đang code và muốn hot reload |
| **Manual** | `python3 app.py` | http://localhost:5001 | Build sẵn rồi, chỉ cần backend |

---

Made with ❤️ by InfinityZero3000
