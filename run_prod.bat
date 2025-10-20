@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 Starting Spam Email Classifier - Production Mode (Windows)
echo ==================================================
echo.

REM Kiểm tra Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python không được tìm thấy. Vui lòng cài đặt Python.
    pause
    exit /b 1
)

REM Kiểm tra Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js không được tìm thấy. Vui lòng cài đặt Node.js.
    pause
    exit /b 1
)

REM Kiểm tra các file cần thiết
if not exist "client_secret.json" (
    echo ⚠️  WARNING: client_secret.json not found!
    echo     Please setup Google OAuth first (see QUICKSTART.md)
    echo.
)

REM Kiểm tra model files
if not exist "spam_pipeline.pkl" (
    if not exist "spam_model.pkl" (
        echo ⚠️  WARNING: Model files not found!
        echo     Model will be trained on first use (may take a few minutes)
        echo.
    )
)

REM Kiểm tra và cài đặt dependencies cho frontend
if not exist "vite-frontend\node_modules\" (
    echo 📦 Installing frontend dependencies...
    cd vite-frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Dependencies installed!
    echo.
)

REM Build frontend
echo 🔨 Building Vite frontend...
cd vite-frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend built successfully!
echo.

REM Kiểm tra build output
if not exist "vite-frontend\dist\" (
    echo ❌ Build output directory not found!
    pause
    exit /b 1
)

REM Kill processes cũ trên port 5001
echo 🧹 Checking for existing processes on port 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5001" ^| findstr "LISTENING"') do (
    echo Killing process on port 5001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
echo.

echo ======================================================
echo   ✨ Starting Flask application in PRODUCTION mode
echo   🌐 Server: http://localhost:5001
echo   📝 Press Ctrl+C to stop
echo ======================================================
echo.

REM Khởi động Flask
set PYTHONIOENCODING=utf-8
python app.py
