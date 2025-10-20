#!/bin/bash

# Script để chạy ứng dụng ở chế độ development
# Backend (Flask) chạy ở port 5001
# Frontend (Vite) chạy ở port 5173 với proxy đến backend

echo "🚀 Starting Spam Email Classifier - Development Mode"
echo "=================================================="

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

# Kiểm tra model files
if [ ! -f "spam_pipeline.pkl" ] && [ ! -f "spam_model.pkl" ]; then
    echo "⚠️  WARNING: Model files not found!"
    echo "    Model will be trained on first use (may take a few minutes)"
fi

# Kiểm tra và cài đặt dependencies cho frontend nếu cần
if [ ! -d "vite-frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd vite-frontend
    npm install
    cd ..
fi

# Kill any existing processes on ports
echo "🧹 Checking for existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Khởi động backend ở background với log file
echo "🔧 Starting Backend (Flask) at http://localhost:5001..."
python3 app.py > backend.log 2>&1 &
BACKEND_PID=$!

# Đợi backend khởi động và kiểm tra
echo "⏳ Waiting for backend to start..."
for i in {1..10}; do
    sleep 1
    if curl -s http://localhost:5001/api/check-auth > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    echo "   Checking backend... ($i/10)"
done

# Kiểm tra backend có chạy không
if ! curl -s http://localhost:5001/api/check-auth > /dev/null 2>&1; then
    echo "❌ Backend failed to start! Check backend.log for errors:"
    tail -20 backend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Khởi động frontend dev server
echo "🎨 Starting Frontend (Vite) at http://localhost:5173..."
echo ""
echo "======================================================"
echo "  ✨ Application is starting!"
echo "  📱 Frontend: http://localhost:5173"
echo "  🔧 Backend:  http://localhost:5001"
echo "  📝 Backend logs: backend.log"
echo "======================================================"
echo ""
cd vite-frontend
npm run dev

# Cleanup: Khi tắt frontend (Ctrl+C), cũng tắt backend
echo ""
echo "🛑 Shutting down..."
kill $BACKEND_PID 2>/dev/null
echo "✅ Stopped successfully!"
