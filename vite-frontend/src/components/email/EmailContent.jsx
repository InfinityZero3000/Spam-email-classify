import React, { useState } from "react";

const EmailContent = ({
  email,
  type,
  onMarkSpam,
  onMarkNotSpam,
  onDelete,
  datasetLabel,
  setDatasetLabel,
  onAddToDataset,
  isAddingToDataset,
}) => {
  // Xác định tab mặc định dựa trên dữ liệu có sẵn
  const [activeTab, setActiveTab] = useState(email?.content ? "html" : "plain");

  if (!email) return null;

  // Định dạng ngày tháng đầy đủ
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("vi-VN", options);
  };  
  
  return (
    <div className="flex w-full h-full">
      {/* Sidebar with email information */}
      <div className="w-1/3 border-r border-gray-200 p-5 overflow-y-auto bg-gray-50">
        <h2 className="text-xl font-semibold mb-4 break-words">
          {email.subject || "(Không có tiêu đề)"}
        </h2>
        
        <div className="flex flex-col space-y-3 mb-5">
          <div className="flex flex-col">
            <span className="text-text-secondary text-sm font-medium">Từ:</span>
            <span className="break-words">
              {email.from_name
                ? `${email.from_name} <${email.sender || email.from}>`
                : email.sender || email.from}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-text-secondary text-sm font-medium">Ngày:</span>
            <span>{formatFullDate(email.date)}</span>
          </div>
        </div>

        {/* Classification info */}
        {email.classification && (
          <div className="mb-5 p-3 rounded-lg bg-white border border-gray-200">
            <div className="flex items-center mb-2">
              <span className="text-text-secondary mr-2">Phân loại:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    email.classification === "spam"
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${typeof email.confidence === "number" 
                      ? (email.confidence <= 1 
                        ? Math.round(email.confidence * 100) 
                        : Math.round(email.confidence))
                      : 50}%`,
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium">
                <span className={`px-2 py-0.5 rounded-md font-medium ${
                  email.classification === "spam"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {email.classification === "spam" ? "Spam" : "Không phải spam"}
                </span>
                {typeof email.confidence === "number" && (
                  <span className="ml-1">
                    (
                    {email.confidence <= 1
                      ? Math.round(email.confidence * 100)
                      : Math.round(email.confidence)}
                    %)
                  </span>
                )}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {email.classification === "spam"
                ? "Hệ thống phân loại email này là spam với độ tin cậy cao."
                : "Hệ thống phân loại email này là an toàn (không phải spam)."}
            </p>
          </div>
        )}

        {/* Spam probability */}
        {email.spam_probability !== undefined && (
          <div className="mb-5 p-3 rounded-lg bg-white border border-gray-200">
            <div className="flex items-center mb-2">
              <span className="text-text-secondary mr-2">Xác suất spam:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    typeof email.spam_probability === "number"
                      ? email.spam_probability > 0.7 ||
                        email.spam_probability > 70
                        ? "bg-red-500"
                        : email.spam_probability > 0.3 ||
                          email.spam_probability > 30
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                  style={{
                    width: `${
                      typeof email.spam_probability === "number" &&
                      email.spam_probability <= 1
                        ? email.spam_probability * 100
                        : email.spam_probability
                    }%`,
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium flex items-center">
                <span className={`px-2 py-0.5 rounded-md ${
                  typeof email.spam_probability === "number"
                    ? email.spam_probability > 0.7 ||
                      email.spam_probability > 70
                      ? "bg-red-100 text-red-700"
                      : email.spam_probability > 0.3 ||
                        email.spam_probability > 30
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {typeof email.spam_probability === "number" &&
                  email.spam_probability <= 1
                    ? Math.round(email.spam_probability * 100)
                    : Math.round(email.spam_probability)}
                  %
                </span>
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {typeof email.spam_probability === "number"
                ? email.spam_probability > 0.7 || email.spam_probability > 70
                  ? "Email này có khả năng cao là spam."
                  : email.spam_probability > 0.3 || email.spam_probability > 30
                  ? "Email này có một số đặc điểm của spam, nhưng không chắc chắn."
                  : "Email này có vẻ an toàn."
                : "Không thể xác định."}
            </p>
          </div>
        )}
      </div>

      {/* Email content area */}
      <div className="w-2/3 flex flex-col">
        {/* Tab navigation */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("html")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "html"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => setActiveTab("plain")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "plain"
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>

        {/* Email content */}
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="prose max-w-none">
            {activeTab === "html" ? (
              email.content ? (
                <div dangerouslySetInnerHTML={{ __html: email.content }}></div>
              ) : (
                <div className="text-gray-500 italic">
                  Không có nội dung HTML. Vui lòng chuyển sang Plain Text để xem nội dung.
                </div>
              )
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {email.plain_content || "Không có nội dung text."}
              </pre>
            )}
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-wrap gap-2 items-center">
            {type === "inbox" ? (
              <button
                onClick={() => onMarkSpam(email.id)}
                className="px-3 py-2 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Đánh dấu là spam
              </button>
            ) : (
              <button
                onClick={() => onMarkNotSpam(email.id)}
                className="px-3 py-2 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Không phải spam
              </button>
            )}
            <button
              onClick={() => onDelete(email.id)}
              className="px-3 py-2 h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Xóa email
            </button>
            <div className="flex-1"></div>{" "}
            <div className="flex items-center space-x-2">
              <select
                value={datasetLabel}
                onChange={(e) => setDatasetLabel(e.target.value)}
                className="h-10 bg-white border border-gray-300 text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary px-3"
              >
                <option value="">-- Chọn nhãn --</option>
                <option value="spam">Spam</option>
                <option value="ham">Không phải spam</option>
              </select>
              <button
                onClick={onAddToDataset}
                disabled={!datasetLabel || isAddingToDataset}
                className="px-3 py-2 h-10 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isAddingToDataset ? (
                  <>
                    <svg
                      className="animate-spin mr-2 h-4 w-4 text-white"
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
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
                    </svg>
                    Thêm vào dataset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailContent;
