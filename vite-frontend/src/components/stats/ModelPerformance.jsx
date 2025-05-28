import React from "react";

const ModelPerformance = ({ stats }) => {
  return (
    <div className="w-full mb-4">
      <div className="bg-white rounded-lg shadow overflow-hidden h-full border border-gray-200">
        <div className="bg-primary text-white px-4 py-3 border-b border-gray-200">
          <h5 className="text-lg font-semibold mb-0">
            <i className="fas fa-chart-line mr-2"></i>Hiệu suất mô hình
          </h5>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="space-y-4">
                <div>
                  <h6 className="text-sm font-semibold text-text-main mb-1">
                    Độ chính xác (Accuracy)
                  </h6>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-primary h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ width: `${stats.model_metrics.accuracy}%` }}
                    >
                      {stats.model_metrics.accuracy}%
                    </div>
                  </div>
                </div>
                <div>
                  <h6 className="text-sm font-semibold text-text-main mb-1">
                    Độ chính xác (Precision)
                  </h6>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-green-500 h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ width: `${stats.model_metrics.precision}%` }}
                    >
                      {stats.model_metrics.precision}%
                    </div>
                  </div>
                </div>
                <div>
                  <h6 className="text-sm font-semibold text-text-main mb-1">
                    Độ nhạy (Recall)
                  </h6>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-yellow-500 h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ width: `${stats.model_metrics.recall}%` }}
                    >
                      {stats.model_metrics.recall}%
                    </div>
                  </div>
                </div>
                <div>
                  <h6 className="text-sm font-semibold text-text-main mb-1">
                    Điểm F1 (F1 Score)
                  </h6>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-primary h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ width: `${stats.model_metrics.f1_score}%` }}
                    >
                      {stats.model_metrics.f1_score}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h6 className="text-center text-sm font-semibold text-text-main mb-3">
                Ma trận nhầm lẫn (Confusion Matrix)
              </h6>
              <div className="overflow-hidden">
                <table className="min-w-full text-center text-sm">
                  <thead className="bg-gray-100 text-text-main">
                    <tr>
                      <th className="py-2 px-3"></th>
                      <th className="py-2 px-3">Dự đoán: Không phải spam</th>
                      <th className="py-2 px-3">Dự đoán: Spam</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 px-3 text-left text-text-main bg-gray-100">
                        Thực tế: Không phải spam
                      </th>
                      <td className="py-2 px-3 bg-green-100">
                        {stats.model_metrics.confusion_matrix[0][0]}
                      </td>
                      <td className="py-2 px-3 bg-red-100">
                        {stats.model_metrics.confusion_matrix[0][1]}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 text-left text-text-main bg-gray-100">
                        Thực tế: Spam
                      </th>
                      <td className="py-2 px-3 bg-red-100">
                        {stats.model_metrics.confusion_matrix[1][0]}
                      </td>
                      <td className="py-2 px-3 bg-green-100">
                        {stats.model_metrics.confusion_matrix[1][1]}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-2">
                <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-text-main mr-1">
                  Đúng
                </span>
                <span className="inline-block px-2 py-1 text-xs rounded bg-red-100 text-text-main">
                  Sai
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card p-3 rounded border border-gray-200 mt-4">
            <div className="grid gap-2">
              <div>
                <strong className="text-text-main">
                  Kích thước tập huấn luyện:
                </strong>
                <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded">
                  {stats.training_size} mẫu
                </span>
              </div>
              <div>
                <strong className="text-text-main">
                  Độ chính xác trên tập kiểm thử:
                </strong>
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  {stats.test_accuracy}
                </span>
              </div>
              <div>
                <strong className="text-text-main">Lần huấn luyện cuối:</strong>
                <span className="ml-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                  {stats.last_training || "Chưa có thông tin"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;
