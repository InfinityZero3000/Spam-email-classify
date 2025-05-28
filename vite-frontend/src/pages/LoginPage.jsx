import React from "react";
import useDocumentTitle from "../hooks/useDocumentTitle.js";

const LoginPage = () => {
  useDocumentTitle("Đăng nhập");
  const handleGoogleLogin = () => {
    // Chuyển hướng đến route /login trên backend
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-primary to-blue-600">
      <div className="flex w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl">
        {/* Left side - Branding */}
        <div className="w-1/2 bg-primary relative p-8 text-white">
          <div className="absolute inset-0 bg-primary-dark opacity-20"></div>
          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="flex justify-center mb-6">
              <img
                src="/login-thumb.png"
                alt="Login Thumb"
                className="w-32 h-32 object-contain"
              />
            </div>

            <h1 className="text-3xl font-bold text-center mb-2">
              Spam Filter App
            </h1>
            <p className="text-lg text-center mb-8 opacity-90">
              Ứng dụng phân loại email spam.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-white bg-opacity-10 p-4 rounded-lg">
                <div className="text-2xl">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="text-sm">Phát hiện spam chính xác với AI</div>
              </div>

              <div className="flex items-center space-x-4 bg-white bg-opacity-10 p-4 rounded-lg">
                <div className="text-2xl">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="text-sm">Phân tích chi tiết nội dung email</div>
              </div>

              <div className="flex items-center space-x-4 bg-white bg-opacity-10 p-4 rounded-lg">
                <div className="text-2xl">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <div className="text-sm">Giao diện thân thiện, dễ sử dụng</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-1/2 bg-white p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-text-main mb-2">
              Đăng nhập
            </h2>
            <p className="text-text-secondary mb-8">
              Đăng nhập bằng tài khoản Google để sử dụng ứng dụng
            </p>

            <button
              className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-text-main py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
              onClick={handleGoogleLogin}
            >
              <i className="fab fa-google text-red-500"></i>
              <span>Đăng nhập với Google</span>
            </button>

            <div className="mt-8 text-center text-sm text-text-secondary">
              <p className="mb-1">
                <i className="fas fa-lock mr-2"></i> Bảo mật dữ liệu email của
                bạn
              </p>
              <p className="mb-1">
                <i className="fas fa-code mr-2"></i> Đồ án Khai phá dữ liệu
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="font-medium mb-1">
                  <i className="fas fa-users mr-2"></i> Nhóm 15
                </p>
                <p className="text-xs">
                  Trần Công Minh | Lê Đức Trung | Nguyễn Hữu Thắng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
