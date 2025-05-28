import React from "react";
import { Bar } from "react-chartjs-2";

const SpamPatterns = ({ stats }) => {
  return (
    <div className="w-full mb-4">
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="bg-primary text-white px-4 py-3 border-b border-gray-200">
          <h5 className="text-lg font-semibold mb-0">
            <i className="fas fa-exclamation-triangle mr-2"></i>Phân tích mẫu
            Spam
          </h5>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h6 className="text-sm font-semibold text-text-main mb-3">
                Các mẫu spam phổ biến
              </h6>
              <div style={{ height: "300px" }}>
                <Bar
                  data={{
                    labels: stats.spam_patterns.map((item) => item.pattern),
                    datasets: [
                      {
                        label: "Tần suất xuất hiện",
                        data: stats.spam_patterns.map((item) => item.frequency),
                        backgroundColor: "rgba(239, 68, 68, 0.7)",
                        borderColor: "rgb(239, 68, 68)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          font: { size: 10 },
                          color: "#1F2937",
                        },
                        grid: {
                          color: "rgba(107, 114, 128, 0.1)",
                        },
                      },
                      x: {
                        ticks: {
                          color: "#1F2937",
                        },
                        grid: {
                          color: "rgba(107, 114, 128, 0.1)",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div>
              <h6 className="text-sm font-semibold text-text-main mb-3">
                Từ khóa phổ biến trong spam
              </h6>
              <div className="bg-card p-3 rounded border border-gray-200 min-h-[200px]">
                {stats.common_keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block bg-red-500 text-white px-2 py-1 rounded mr-2 mb-2"
                    style={{
                      fontSize: `${Math.max(
                        0.8,
                        Math.min(1.5, 0.8 + keyword.count / 20)
                      )}rem`,
                    }}
                  >
                    {keyword.word} ({keyword.count})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h6 className="text-sm font-semibold text-text-main">
              Thông tin về mô hình:
            </h6>
            <p className="text-sm text-text-secondary">
              Mô hình sử dụng thuật toán Naive Bayes kết hợp với TF-IDF để phân
              loại email. Mô hình được huấn luyện trên tập dữ liệu gồm các email
              spam và không spam, với các đặc trưng được trích xuất từ nội dung
              email.
            </p>
            <div className="bg-blue-50 p-3 rounded border border-gray-200 mt-2 text-text-main">
              <i className="fas fa-info-circle mr-2"></i>
              Để cải thiện độ chính xác của mô hình, bạn có thể thêm các email
              bị phân loại sai vào tập dữ liệu huấn luyện và huấn luyện lại mô
              hình bằng nút "Huấn luyện lại mô hình".
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpamPatterns;
