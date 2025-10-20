import { useState } from "react";
import { getStats, retrainModel } from "../services/api.js";
import { Confirm } from "notiflix/build/notiflix-confirm-aio";
import { ScaleLoader } from "react-spinners";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Import các component con
import StatsHeader from "./stats/StatsHeader";
import StatsOverview from "./stats/StatsOverview";
import ConfidenceLevels from "./stats/ConfidenceLevels";
import ModelPerformance from "./stats/ModelPerformance";
import SpamPatterns from "./stats/SpamPatterns";
import UsageGuide from "./stats/UsageGuide";
import TrainingProgress from "./stats/TrainingProgress";

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Stats = () => {
  const [error, setError] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Sử dụng React Query để fetch statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      try {
        const response = await getStats();
        return response.data;
      } catch (err) {
        setError(
          "Lỗi khi tải thống kê: " + (err.response?.data?.error || err.message)
        );
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });

  // Sử dụng mutation cho retrain model
  const retrainMutation = useMutation({
    mutationFn: retrainModel,
    onSuccess: () => {
      window.showToast(
        "Thành công",
        "Đã huấn luyện lại mô hình thành công",
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      // Đặt trạng thái hộp thoại xác nhận thành đóng sau khi huấn luyện thành công
      setIsConfirmDialogOpen(false);
    },
    onError: (err) => {
      setError(
        "Lỗi khi huấn luyện lại mô hình: " +
          (err.response?.data?.error || err.message)
      );
      // Đặt trạng thái hộp thoại xác nhận thành đóng sau khi có lỗi
      setIsConfirmDialogOpen(false);
    },
  });

  const fetchStats = () => {
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const handleRetrain = async () => {
    // Đặt trạng thái hộp thoại xác nhận thành mở
    setIsConfirmDialogOpen(true);

    Confirm.show(
      "Huấn luyện lại mô hình",
      "Bạn có chắc chắn muốn huấn luyện lại mô hình? Quá trình này có thể mất vài phút.",
      "Huấn luyện",
      "Hủy",
      () => {
        retrainMutation.mutate();
        // Không đặt setIsConfirmDialogOpen(false) ở đây
        // Sẽ được đặt trong onSuccess hoặc onError của mutation
      },
      () => {
        // Đặt trạng thái hộp thoại xác nhận thành đóng sau khi hủy
        setIsConfirmDialogOpen(false);
      },
      {
        titleColor: "#3b82f6", // Tailwind blue-500
        okButtonBackground: "#3b82f6",
        borderRadius: "8px",
        width: "320px",
        messageMaxLength: 500,
        buttonsFontSize: "14px",
        buttonsTextDecoration: "none",
        cssAnimationStyle: "zoom",
      }
    );
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 mb-4 relative">
        {/* Đã loại bỏ chỉ báo isRefetching để tránh nhầm lẫn với trạng thái huấn luyện */}

        {/* Indicator khi đang huấn luyện lại mô hình */}
        {retrainMutation.isLoading && (
          <div className="bg-blue-600 text-white text-sm px-3 py-2 rounded absolute top-4 right-4 z-20 flex items-center shadow-md">
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
            <span>Đang huấn luyện lại mô hình...</span>
          </div>
        )}

        <StatsHeader
          fetchStats={fetchStats}
          handleRetrain={handleRetrain}
          loading={isLoading && !stats}
          isRetraining={retrainMutation.isLoading}
          isConfirmDialogOpen={isConfirmDialogOpen}
        />
        <div className="p-4">
          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded mb-4 border border-red-200">
              {error}
            </div>
          )}

          {/* Thanh tiến trình huấn luyện */}
          <TrainingProgress isTraining={retrainMutation.isLoading} />

          {isLoading && !stats ? (
            <div className="flex flex-col justify-center items-center py-10">
              <ScaleLoader size={50} color="#3b82f6" loading={true} />
              <p className="mt-3 text-text-secondary">Đang tải thống kê...</p>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <StatsOverview stats={stats} />
              <ConfidenceLevels stats={stats} />
              <ModelPerformance stats={stats} />
              <SpamPatterns stats={stats} />
              <UsageGuide />
            </div>
          ) : (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded border border-yellow-200">
              Không thể tải thống kê. Vui lòng thử lại sau.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
