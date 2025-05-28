import React from "react";

const EmailItem = ({ email, onClick, type }) => {
  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Kiểm tra nếu là ngày hôm nay
    if (date.toDateString() === today.toDateString()) {
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    // Kiểm tra nếu là ngày hôm qua
    else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    }
    // Ngày khác trong năm nay
    else if (date.getFullYear() === today.getFullYear()) {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
    // Năm khác
    else {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  };

  // Rút gọn nội dung email để hiển thị trong danh sách
  const truncateContent = (content, maxLength = 120) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div
      className={`flex flex-col border-b border-gray-200 p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
        !email.read ? "bg-white" : "bg-card"
      }`}
      onClick={() => onClick(email)}
    >
      {" "}
      {/* Sender and date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center overflow-hidden max-w-[70%]">
          <span className="font-bold text-primary truncate inline-block">
            {email.from_name || email.sender || email.from}
          </span>
          {!email.read && (
            <span className="ml-2 min-w-2 h-2 bg-primary rounded-full inline-block"></span>
          )}
        </div>
        <span className="text-xs text-text-secondary whitespace-nowrap">
          {formatDate(email.date)}
        </span>
      </div>
      {/* Subject and content preview */}      <div className="flex flex-col mb-1">
        <div className="flex justify-between items-center">
          <h3
            className={`text-sm ${
              !email.read
                ? "font-semibold text-text-main"
                : "font-medium text-text-secondary"
            }`}
          >
            {email.subject || "(Không có tiêu đề)"}
          </h3>          {email.classification && (
            <div className="flex items-center">
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex items-center ${
                email.classification === "spam" 
                  ? "bg-red-100 text-red-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                  email.classification === "spam" 
                    ? "bg-red-500" 
                    : "bg-green-500"
                }`}></span>
                {email.classification === "spam" ? "Spam" : "Ham"}
                {typeof email.confidence === "number" && (
                  <span className="ml-1">
                    ({email.confidence <= 1 
                      ? Math.round(email.confidence * 100)
                      : Math.round(email.confidence)}%)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
          {truncateContent(email.snippet || email.plain_content || "")}
        </p>
      </div>{" "}      {/* Spam label */}
      {type === "inbox" &&
        (typeof email.spam_probability === "number"
          ? email.spam_probability > 0.3 || email.spam_probability > 30
          : false) && (
          <div className="flex items-center mt-1">
            <div
              className={`text-xs px-2 py-1 rounded-md font-bold shadow-sm inline-flex items-center ${
                typeof email.spam_probability === "number"
                  ? email.spam_probability > 0.7 || email.spam_probability > 70
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                  : "bg-yellow-100 text-yellow-700 border border-yellow-300"
              }`}
              title={`Xác suất spam: ${
                typeof email.spam_probability === "number" &&
                email.spam_probability <= 1
                  ? Math.round(email.spam_probability * 100)
                  : Math.round(email.spam_probability)
              }%`}
            >
              <div className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse bg-current"></div>
              {" "}
              {typeof email.spam_probability === "number" ? (
                email.spam_probability > 0.7 || email.spam_probability > 70 ? (
                  <>
                    <span className="mr-1">⚠️</span> Có thể là spam
                  </>
                ) : (
                  <>
                    <span className="mr-1">⚠️</span> Nghi ngờ spam
                  </>
                )
              ) : (
                <>
                  <span className="mr-1">⚠️</span> Nghi ngờ spam
                </>
              )}
              <span className="ml-1 font-bold">
                (
                {typeof email.spam_probability === "number" &&
                email.spam_probability <= 1
                  ? Math.round(email.spam_probability * 100)
                  : Math.round(email.spam_probability)}
                %)
              </span>
            </div>
          </div>
        )}
    </div>
  );
};

export default EmailItem;
