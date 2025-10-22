# Kiến Trúc Ứng Dụng

## Development Mode

```
┌─────────────────────────────────────────────────────────────┐
│                      Trình duyệt                            │
│                  http://localhost:5173                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Request: /emails, /api/*, etc.
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Vite Dev Server (Port 5173)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Proxy Configuration (vite.config.js)                 │  │
│  │  - /emails → http://localhost:5001                    │  │
│  │  - /api/* → http://localhost:5001                     │  │
│  │  - /spam_emails → http://localhost:5001               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Proxy request
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Flask Backend (Port 5001)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                        │  │
│  │  - GET  /emails                                       │  │
│  │  - GET  /spam_emails                                  │  │
│  │  - POST /analyze_text                                 │  │
│  │  - POST /send_email                                   │  │
│  │  - GET  /authenticate                                 │  │
│  │  - ...                                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────┐            │
│  │  Gmail API + Machine Learning Model         │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Production Mode

```
┌─────────────────────────────────────────────────────────────┐
│                      Trình duyệt                            │
│                  http://localhost:5001                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Flask Backend (Port 5001)                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Serve Static Files (vite-frontend/dist/)             │  │
│  │  - index.html                                         │  │
│  │  - assets/*.js (React app bundle)                    │  │
│  │  - assets/*.css                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Endpoints (same as dev mode)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────┐            │
│  │  Gmail API + Machine Learning Model         │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Chi tiết luồng dữ liệu

### Development Mode Flow

1. **User truy cập** http://localhost:5173
2. **Vite Dev Server** serve React app với hot reload
3. **User tương tác** với UI (ví dụ: click "Xem email")
4. **Frontend gọi** `fetch('/emails')`
5. **Vite Proxy** chuyển request đến `http://localhost:5001/emails`
6. **Flask Backend** xử lý request, gọi Gmail API
7. **Response** trả về qua proxy về frontend
8. **React** cập nhật UI

### Production Mode Flow

1. **Build Frontend**: `npm run build` → tạo static files trong `dist/`
2. **User truy cập** http://localhost:5001
3. **Flask** serve `index.html` từ `dist/`
4. **Browser load** React app từ bundled JS files
5. **User tương tác** với UI
6. **Frontend gọi** API đến cùng origin (localhost:5001)
7. **Flask** xử lý API request
8. **Response** trả về frontend
9. **React** cập nhật UI

## Lợi ích của kiến trúc này

### Development Mode
- **Hot Reload**: Code thay đổi → UI tự động cập nhật
- **Fast Refresh**: React components reload nhanh
- **Debugging**: Dễ dàng debug với source maps
- **Separation**: Frontend và Backend độc lập

### Production Mode
- **Single Server**: Chỉ cần chạy một server
- **No CORS Issues**: Same origin, không có vấn đề CORS
- **Optimized**: JS/CSS đã minified và bundled
- **Easy Deployment**: Deploy một ứng dụng duy nhất

## Port Usage

| Mode       | Frontend Port | Backend Port | Access URL           |
|------------|---------------|--------------|----------------------|
| Development| 5173          | 5001         | http://localhost:5173|
| Production | -             | 5001         | http://localhost:5001|

## OAuth Redirect Configuration

**Quan trọng**: Google Cloud Console phải cấu hình redirect URI là:
- `http://localhost:5001/oauth2callback`
- `http://127.0.0.1:5001/oauth2callback`

Không phải port 5173, vì OAuth callback luôn đi qua backend!
