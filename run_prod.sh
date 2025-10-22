#!/bin/bash

# Script để build frontend và chạy ứng dụng ở chế độ production
# Backend (Flask) serve cả frontend và API ở port 5001

echo "🚀 Starting Spam Email Classifier - Production Mode"
echo "===================================================="

# Kiểm tra xem Python có sẵn không
if ! command -v python3 &> /dev/null
then
    echo "❌ Python3 không được tìm thấy. Vui lòng cài đặt Python3."
    exit 1
fi

# Kiểm tra xem Node.js có sẵn không
if ! command -v node &> /dev/null
then
    echo "❌ Node.js không được tìm thấy. Vui lòng cài đặt Node.js."
    exit 1
fi

# Kiểm tra các file cần thiết
if [ ! -f "client_secret.json" ]; then
    echo "⚠️  WARNING: client_secret.json not found!"
    echo "    Please setup Google OAuth first (see QUICKSTART.md)"
fi

# Kiểm tra và cài đặt dependencies cho frontend nếu cần
if [ ! -d "vite-frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd vite-frontend
    npm install
    cd ..
fi

# Kill any existing processes on port 5001
echo "🧹 Checking for existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# Build frontend
echo "🔨 Building frontend..."
cd vite-frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build successful!"
cd ..

# Khởi động backend (Flask sẽ serve static files từ dist/)
echo "🔧 Starting Flask server at http://localhost:5001..."
echo ""
echo "======================================================"
echo "  ✅ Application is running in PRODUCTION mode!"
echo "  🌐 URL: http://localhost:5001"
echo "  📁 Serving: vite-frontend/dist/"
echo "  📝 Backend logs: backend.log"
echo ""
echo "  Press Ctrl+C to stop"
echo "======================================================"
echo ""

# Chạy Flask và lưu log
python3 app.py 2>&1 | tee backend.log

# Cleanup
echo ""
echo "Shutting down..."
echo "Stopped successfully!"
