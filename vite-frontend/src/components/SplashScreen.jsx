import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import emailAnimation from "../assets/animations/email-animation.json";

const SplashScreen = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Thêm độ trễ nhỏ cho hiệu ứng animation
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 overflow-hidden">
      <div className="relative w-full max-w-3xl mx-auto px-6 py-10 text-center">
        <div
          className={`transition-all duration-700 ease-in-out transform ${
            showContent
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex justify-center">
            <Lottie
              animationData={emailAnimation}
              loop={true}
              className="w-[240px] h-[240px]"
            />
          </div>

          <h1 className="mt-4 text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Spam Email Classifier
          </h1>

          <p className="mt-4 text-gray-600 text-lg mx-auto max-w-lg">
            Bộ lọc email thông minh được hỗ trợ bởi học máy giúp hộp thư của bạn
            luôn sạch và an toàn
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-700">Phát Hiện Chính Xác</span>
            </div>
            <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-700">Phân Tích Nâng Cao</span>
            </div>
            <div className="flex items-center px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-700">Học Thông Minh</span>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute top-20 right-10 w-40 h-40 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-20 w-36 h-36 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
