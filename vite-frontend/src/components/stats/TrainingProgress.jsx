import { useState, useEffect } from 'react';

const TrainingProgress = ({ isTraining }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Đang chuẩn bị...');

  useEffect(() => {
    if (!isTraining) {
      setProgress(0);
      setStage('Đang chuẩn bị...');
      return;
    }

    // Simulate training progress with different stages
    const stages = [
      { name: 'Đang tải dữ liệu...', duration: 1000, progress: 15 },
      { name: 'Tiền xử lý văn bản...', duration: 2000, progress: 30 },
      { name: 'Vectorization...', duration: 2000, progress: 50 },
      { name: 'Huấn luyện mô hình...', duration: 3000, progress: 75 },
      { name: 'Đánh giá hiệu suất...', duration: 1500, progress: 90 },
      { name: 'Lưu mô hình...', duration: 1000, progress: 100 },
    ];

    let currentStageIndex = 0;
    let accumulatedTime = 0;

    const interval = setInterval(() => {
      if (currentStageIndex >= stages.length) {
        clearInterval(interval);
        return;
      }

      const currentStage = stages[currentStageIndex];
      setStage(currentStage.name);
      
      // Smooth progress increment
      setProgress(prev => {
        const increment = (currentStage.progress - prev) / 10;
        const newProgress = Math.min(prev + increment, currentStage.progress);
        return newProgress;
      });

      accumulatedTime += 100;
      if (accumulatedTime >= currentStage.duration) {
        accumulatedTime = 0;
        currentStageIndex++;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isTraining]);

  if (!isTraining) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-4 border border-blue-200 shadow-sm animate-fadeIn">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-4">
          <div className="relative">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Đang huấn luyện lại mô hình
          </h3>
          <p className="text-sm text-gray-600 animate-pulse">{stage}</p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="text-center">
            <span className="text-2xl font-bold text-blue-600 block">
              {Math.round(progress)}%
            </span>
            <span className="text-xs text-gray-500">hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Progress bar with gradient and animation */}
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out shadow-md"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer"></div>
          {/* Pulse effect */}
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </div>
        {/* Progress indicator line */}
        <div
          className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-500"
          style={{ left: `${progress}%` }}
        ></div>
      </div>

      {/* Detailed progress steps */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div
          className={`flex items-center p-2 rounded transition-all duration-300 ${
            progress >= 15
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-50 text-gray-400 border border-gray-200'
          }`}
        >
          {progress >= 15 ? (
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 animate-scaleIn"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <div className="w-5 h-5 mr-2 border-2 border-current rounded-full flex-shrink-0 animate-pulse"></div>
          )}
          <span className="text-xs font-medium">Tải dữ liệu</span>
        </div>
        <div
          className={`flex items-center p-2 rounded transition-all duration-300 ${
            progress >= 50
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-50 text-gray-400 border border-gray-200'
          }`}
        >
          {progress >= 50 ? (
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 animate-scaleIn"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <div className="w-5 h-5 mr-2 border-2 border-current rounded-full flex-shrink-0 animate-pulse"></div>
          )}
          <span className="text-xs font-medium">Xử lý văn bản</span>
        </div>
        <div
          className={`flex items-center p-2 rounded transition-all duration-300 ${
            progress >= 75
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-50 text-gray-400 border border-gray-200'
          }`}
        >
          {progress >= 75 ? (
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 animate-scaleIn"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <div className="w-5 h-5 mr-2 border-2 border-current rounded-full flex-shrink-0 animate-pulse"></div>
          )}
          <span className="text-xs font-medium">Huấn luyện</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 flex items-center bg-white bg-opacity-50 p-3 rounded">
        <svg
          className="w-4 h-4 mr-2 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          Vui lòng không đóng trình duyệt trong quá trình huấn luyện. 
          Thời gian dự kiến: <strong className="text-blue-600">2-3 phút</strong>
        </span>
      </div>

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TrainingProgress;
