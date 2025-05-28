import React from "react";

const UsageGuide = () => {
  return (
    <div className="w-full mb-4">
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="bg-card px-4 py-3 border-b border-gray-200">
          <h5 className="text-lg font-semibold mb-0 text-text-main">
            <i className="fas fa-info-circle mr-2"></i>Hướng dẫn sử dụng
          </h5>
        </div>
        <div className="p-4">
          <div className="bg-card rounded p-4 border border-gray-200">
            <p className="mb-2">
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              <strong className="text-text-main">Hộp thư đến:</strong>{" "}
              <span className="text-text-secondary">
                Xem và quản lý email, đánh dấu email là spam nếu cần.
              </span>
            </p>
            <p className="mb-2">
              <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              <strong className="text-text-main">Thư mục spam:</strong>{" "}
              <span className="text-text-secondary">
                Xem các email bị đánh dấu là spam, khôi phục nếu cần.
              </span>
            </p>
            <p className="mb-2">
              <i className="fas fa-search text-primary mr-2"></i>
              <strong className="text-text-main">Phân tích email:</strong>{" "}
              <span className="text-text-secondary">
                Phân tích nội dung email để xác định có phải spam không.
              </span>
            </p>
            <p className="mb-0">
              <i className="fas fa-cogs text-gray-500 mr-2"></i>
              <strong className="text-text-main">
                Huấn luyện lại mô hình:
              </strong>{" "}
              <span className="text-text-secondary">
                Cập nhật mô hình với dữ liệu mới để cải thiện độ chính xác.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageGuide;
