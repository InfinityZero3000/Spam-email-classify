import React from "react";

const StatsOverview = ({ stats }) => {
  return (
    <div className="w-full mb-4">
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="bg-primary text-white px-4 py-3 border-b border-gray-200">
          <h5 className="text-lg font-semibold mb-0">
            <i className="fas fa-chart-pie mr-2"></i>Thống kê tổng quan
          </h5>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-card rounded-lg shadow p-4 border border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary">
                  {stats.inbox_count}
                </h2>
                <p className="mb-0 text-text-secondary">Email trong hộp thư đến</p>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow p-4 border border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-500">
                  {stats.spam_count}
                </h2>
                <p className="mb-0 text-text-secondary">Email trong thư mục spam</p>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow p-4 border border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-cyan-500">
                  {stats.recent_emails}
                </h2>
                <p className="mb-0 text-text-secondary">Email gần đây</p>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow p-4 border border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-yellow-500">
                  {stats.recent_spam_detected}
                </h2>
                <p className="mb-0 text-text-secondary">Spam được phát hiện</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
