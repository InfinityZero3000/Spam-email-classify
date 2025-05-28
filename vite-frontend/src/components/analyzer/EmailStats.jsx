import React from "react";

const EmailStats = ({ emailStats }) => {
  if (!emailStats) return null;

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="mb-3 border-b pb-2 border-gray-200">
        <h3 className="text-lg font-semibold text-text-main flex items-center">
          <i className="fas fa-chart-bar mr-2"></i>Thống kê email
        </h3>
      </div>
      <ul className="space-y-3">
        <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-text-main">Độ dài</span>
          <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
            {emailStats.total_length || "N/A"} ký tự
          </span>
        </li>
        <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-text-main">Số từ</span>
          <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
            {emailStats.word_count || "N/A"}
          </span>
        </li>
        <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-text-main">Tỷ lệ chữ hoa</span>
          <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
            {emailStats.uppercase_ratio?.toFixed(2) || "N/A"}
          </span>
        </li>
        <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-text-main">Có URL</span>
          <span
            className={`px-3 py-1 ${
              emailStats.has_urls ? "bg-yellow-500" : "bg-green-500"
            } text-white rounded-full text-sm`}
          >
            {emailStats.has_urls ? "Có" : "Không"}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default EmailStats;
