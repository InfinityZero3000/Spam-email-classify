import React from "react";
import { ClipLoader } from "react-spinners";

const StatsHeader = ({
  fetchStats,
  handleRetrain,
  loading,
  isRetraining,
  isConfirmDialogOpen,
}) => {
  return (
    <div className="flex justify-between items-center bg-white p-4 border-b border-gray-200 text-text-main">
      <h4 className="text-xl font-semibold">Thống kê hệ thống</h4>
      <div className="flex gap-2">
        <button
          className="flex items-center px-3 py-1.5 bg-card text-text-main text-sm rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchStats}
          disabled={loading}
        >
          <i className="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
        <button
          className={`flex items-center px-3 py-1.5 text-sm rounded transition-colors disabled:cursor-not-allowed ${
            isRetraining
              ? "bg-blue-600 text-white disabled:opacity-80"
              : "bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
          }`}
          onClick={handleRetrain}
          disabled={isRetraining || isConfirmDialogOpen}
          title={
            isRetraining
              ? "Đang huấn luyện mô hình, vui lòng đợi..."
              : "Huấn luyện lại mô hình"
          }
        >
          {isRetraining ? (
            <div className="flex items-center">
              <ClipLoader
                size={16}
                color="#ffffff"
                loading={true}
                aria-label="Loading Spinner"
              />
              <span className="ml-2 font-medium">Đang huấn luyện...</span>
            </div>
          ) : (
            <>
              <i className="fas fa-cogs mr-1"></i> Huấn luyện lại mô hình
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StatsHeader;
