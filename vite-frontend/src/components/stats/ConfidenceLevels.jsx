import React from "react";
import { Pie } from "react-chartjs-2";

const ConfidenceLevels = ({ stats }) => {
  return (
    <div className="w-full mb-4">
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="bg-primary text-white px-4 py-3 border-b border-gray-200">
          <h5 className="text-lg font-semibold mb-0">
            <i className="fas fa-chart-pie mr-2"></i>Độ tin cậy phát hiện Spam
          </h5>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* Độ tin cậy cao */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-text-main">Độ tin cậy cao (&gt;90%)</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {stats.confidence_levels.high}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-red-500 h-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{
                      width: `${
                        (stats.confidence_levels.high /
                          Math.max(stats.recent_spam_detected, 1)) *
                        100
                      }%`,
                    }}
                  >
                    {Math.round(
                      (stats.confidence_levels.high /
                        Math.max(stats.recent_spam_detected, 1)) *
                        100
                    )}%
                  </div>
                </div>
              </div>

              {/* Độ tin cậy trung bình */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-text-main">
                    Độ tin cậy trung bình (70-90%)
                  </span>
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    {stats.confidence_levels.medium}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-yellow-500 h-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{
                      width: `${
                        (stats.confidence_levels.medium /
                          Math.max(stats.recent_spam_detected, 1)) *
                        100
                      }%`,
                    }}
                  >
                    {Math.round(
                      (stats.confidence_levels.medium /
                        Math.max(stats.recent_spam_detected, 1)) *
                        100
                    )}%
                  </div>
                </div>
              </div>

              {/* Độ tin cậy thấp */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-text-main">Độ tin cậy thấp (&lt;70%)</span>
                  <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded">
                    {stats.confidence_levels.low}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-cyan-500 h-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{
                      width: `${
                        (stats.confidence_levels.low /
                          Math.max(stats.recent_spam_detected, 1)) *
                        100
                      }%`,
                    }}
                  >
                    {Math.round(
                      (stats.confidence_levels.low /
                        Math.max(stats.recent_spam_detected, 1)) *
                        100
                    )}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 h-[200px]">
              <Pie
                data={{
                  labels: [
                    "Độ tin cậy cao",
                    "Độ tin cậy trung bình",
                    "Độ tin cậy thấp",
                  ],
                  datasets: [
                    {
                      data: [
                        stats.confidence_levels.high,
                        stats.confidence_levels.medium,
                        stats.confidence_levels.low,
                      ],
                      backgroundColor: [
                        "rgba(239, 68, 68, 0.7)",
                        "rgba(234, 179, 8, 0.7)",
                        "rgba(8, 145, 178, 0.7)",
                      ],
                      borderColor: [
                        "rgb(239, 68, 68)",
                        "rgb(234, 179, 8)",
                        "rgb(8, 145, 178)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "#1F2937",
                        font: {
                          size: 12,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceLevels;
