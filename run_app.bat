@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo Starting Spam Email Classifier - Development Mode (Windows)
echo ==================================================
echo.

REM Kiểm tra Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python không được tìm thấy. Vui lòng cài đặt Python.
    pause
    exit /b 1
)

REM Kiểm tra Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js không được tìm thấy. Vui lòng cài đặt Node.js.
    pause
    exit /b 1
)

REM Kiểm tra các file cần thiết
if not exist "client_secret.json" (
    echo WARNING: client_secret.json not found!
    echo     Please setup Google OAuth first (see QUICKSTART.md)
    echo.
)

REM Kiểm tra model files
if not exist "spam_pipeline.pkl" (
    if not exist "spam_model.pkl" (
        echo WARNING: Model files not found!
        echo     Model will be trained on first use (may take a few minutes)
        echo.
    )
)

REM Kiểm tra và cài đặt dependencies cho frontend
if not exist "vite-frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd vite-frontend
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install frontend dependencies!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo Dependencies installed!
    echo.
)

REM Kill processes cũ trên port 5001 và 5173
echo 🧹 Checking for existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5001" ^| findstr "LISTENING"') do (
    echo Killing process on port 5001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Killing process on port 5173 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
echo.

REM Khởi động Backend ở background
echo 🔧 Starting Backend (Flask) at http://localhost:5001...
set PYTHONIOENCODING=utf-8
start /B python app.py > backend.log 2>&1

REM Đợi backend khởi động
echo ⏳ Waiting for backend to start...
set /a count=0
:wait_backend
timeout /t 1 /nobreak >nul
set /a count+=1
curl -s http://localhost:5001/api/check-auth >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend is ready!
    echo.
    goto backend_ready
)
echo    Checking backend... (!count!/10)
if !count! lss 10 goto wait_backend

echo Backend failed to start! Check backend.log for errors:
type backend.log | more
pause
exit /b 1

:backend_ready
REM Khởi động Frontend dev server
echo Starting Frontend (Vite) at http://localhost:5173...
echo.
echo ======================================================
echo   Application is starting!
echo   Frontend: http://localhost:5173
echo   🔧 Backend:  http://localhost:5001
echo   Backend logs: backend.log
echo ======================================================
echo.
cd vite-frontend
call npm run dev

REM Cleanup khi tắt
echo.
echo Shutting down...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
cd ..
echo Stopped successfully!
pause 