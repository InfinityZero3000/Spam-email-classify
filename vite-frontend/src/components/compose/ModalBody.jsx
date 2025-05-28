import React, { useState } from "react";

const ModalBody = ({
  error,
  emailError,
  to,
  subject,
  body,
  handleToChange,
  setSubject,
  setBody,
  analysisResult,
}) => {
  // Để phân biệt tab trong phần phân tích
  const [activeTab, setActiveTab] = useState("explanation");

  return (
    <div className="flex w-full h-full">
      {/* Left side - Email Form (1/3 width) */}
      <div className="w-1/3 border-r border-gray-200 p-5 overflow-y-auto bg-gray-50">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 rounded-lg bg-red-100">
            {error}
          </div>
        )}

        <form>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-text-main mb-2"
              htmlFor="emailTo"
            >
              Người nhận:
            </label>
            <input
              type="email"
              className={`w-full p-2.5 bg-white border ${
                emailError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-primary focus:border-primary`}
              id="emailTo"
              placeholder="Nhập địa chỉ email người nhận"
              value={to}
              onChange={handleToChange}
            />
            {emailError && (
              <p className="mt-2 text-sm text-red-500">{emailError}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-text-main mb-2"
              htmlFor="emailSubject"
            >
              Tiêu đề:
            </label>
            <input
              type="text"
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              id="emailSubject"
              placeholder="Nhập tiêu đề email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-text-main mb-2"
              htmlFor="emailBody"
            >
              Nội dung:
            </label>
            <textarea
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              id="emailBody"
              rows="12"
              placeholder="Nhập nội dung email"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            ></textarea>
          </div>
        </form>
      </div>

      {/* Right side - Analysis Content (2/3 width) */}
      <div className="w-2/3 flex flex-col">
        {!analysisResult ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
            <div className="text-center max-w-md">
              <svg
                className="mx-auto h-16 w-16 text-text-secondary"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-text-main">
                Chưa có kết quả phân tích
              </h3>
              <p className="mt-2 text-text-secondary">
                Nhập nội dung email và nhấn nút "Phân tích" để kiểm tra khả năng
                spam
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-white p-5">
            {/* Tabs navigation */}
            <div className="border-b border-gray-200 mb-4">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("explanation")}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "explanation"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-main"
                  }`}
                >
                  Giải thích kết quả
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "details"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-main"
                  }`}
                >
                  Chi tiết phân tích
                </button>
              </div>
            </div>

            {/* Analysis result content */}
            <div>
              {/* Classification banner */}
              <div className="flex items-center mb-3">
                <strong className="mr-2 text-text-main">Phân loại:</strong>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    analysisResult.classification === "spam"
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {analysisResult.classification === "spam"
                    ? "SPAM"
                    : "KHÔNG PHẢI SPAM"}
                </span>
              </div>

              {/* Confidence bar */}
              <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
                <div
                  className={`h-6 rounded-full ${
                    analysisResult.classification === "spam"
                      ? "bg-red-600"
                      : "bg-green-600"
                  } flex items-center justify-center text-xs font-medium text-white`}
                  style={{ width: `${analysisResult.confidence}%` }}
                >
                  {analysisResult.confidence}% độ tin cậy
                </div>
              </div>

              {activeTab === "explanation" && (
                <>
                  <div className="p-4 bg-card rounded-lg mb-4 border border-gray-200">
                    <h6 className="mb-2 font-medium flex items-center text-text-main">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Giải thích kết quả phân tích:
                    </h6>
                    <p className="text-text-main">
                      Thuật toán Naive Bayes đã phân tích nội dung email và
                      {analysisResult.classification === "spam"
                        ? " phân loại đây là email SPAM với độ tin cậy "
                        : " phân loại đây là email an toàn với độ tin cậy "}
                      <strong>{analysisResult.confidence}%</strong>.
                    </p>

                    <div className="border border-gray-200 rounded-lg mb-2 mt-3">
                      <div className="py-1 px-3 bg-gray-100 rounded-t-lg text-text-main">
                        <strong>Cách thuật toán Naive Bayes hoạt động:</strong>
                      </div>
                      <div className="py-2 px-3 text-text-secondary">
                        <small>
                          Thuật toán tính toán xác suất có điều kiện cho mỗi từ
                          trong email, so sánh xác suất xuất hiện trong email
                          spam và email thường, sau đó kết hợp các xác suất để
                          đưa ra quyết định cuối cùng.
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Reasons for classification */}
                  {analysisResult.classification === "spam" ? (
                    <div className="p-4 bg-red-50 rounded-lg mb-4 border border-red-100">
                      <h6 className="text-red-700 font-medium flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Lý do phân loại là SPAM:
                      </h6>
                      <ul className="pl-5 mt-2 space-y-1 list-disc text-text-main">
                        <li>
                          Email chứa các từ khóa có xác suất cao xuất hiện trong
                          spam
                        </li>
                        {analysisResult.top_keywords &&
                          analysisResult.top_keywords.length > 0 && (
                            <li>
                              Các từ khóa đáng chú ý:{" "}
                              <strong>
                                {analysisResult.top_keywords
                                  .slice(0, 3)
                                  .map((k) => k.word)
                                  .join(", ")}
                              </strong>
                            </li>
                          )}
                        {analysisResult.email_stats?.has_urls && (
                          <li>
                            Email chứa URL, một đặc điểm phổ biến trong email
                            spam
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-lg mb-4 border border-green-100">
                      <h6 className="text-green-700 font-medium flex items-center">
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
                        Lý do phân loại là KHÔNG PHẢI SPAM:
                      </h6>
                      <ul className="pl-5 mt-2 space-y-1 list-disc text-text-main">
                        <li>
                          Email chứa các từ khóa thường xuất hiện trong email
                          bình thường
                        </li>
                        {analysisResult.top_keywords &&
                          analysisResult.top_keywords.length > 0 && (
                            <li>
                              Các từ khóa đáng chú ý:{" "}
                              <strong>
                                {analysisResult.top_keywords
                                  .slice(0, 3)
                                  .map((k) => k.word)
                                  .join(", ")}
                              </strong>
                            </li>
                          )}
                        {!analysisResult.email_stats?.has_urls && (
                          <li>Email không chứa URL, giảm khả năng là spam</li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {activeTab === "details" && (
                <div className="space-y-4">
                  {analysisResult.top_keywords &&
                    analysisResult.top_keywords.length > 0 && (
                      <div className="p-4 bg-card rounded-lg border border-gray-200">
                        <h6 className="font-medium flex items-center text-text-main">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-.257-.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          Từ khóa ảnh hưởng đến kết quả:
                        </h6>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {analysisResult.top_keywords
                            .slice(0, 10)
                            .map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white"
                                title="Từ khóa ảnh hưởng đến kết quả phân loại"
                              >
                                {keyword.word}
                              </span>
                            ))}
                        </div>
                        <small className="text-text-secondary mt-2 block">
                          Các từ khóa này có trọng số cao trong việc xác định
                          email là spam hay không.
                        </small>
                      </div>
                    )}

                  {analysisResult.email_stats && (
                    <div className="p-4 bg-card rounded-lg border border-gray-200">
                      <h6 className="font-medium text-text-main mb-2">
                        Thống kê email:
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-text-main">
                            <strong>Số từ:</strong>{" "}
                            {analysisResult.email_stats.word_count}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-text-main">
                            <strong>Chứa URL:</strong>{" "}
                            {analysisResult.email_stats.has_urls
                              ? "Có"
                              : "Không"}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-text-main">
                            <strong>Độ phức tạp:</strong>{" "}
                            {analysisResult.email_stats.complexity || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h6 className="font-medium text-blue-700 mb-2">
                      <i className="fas fa-info-circle mr-2"></i>
                      Thông tin bổ sung:
                    </h6>
                    <p className="text-sm text-blue-700">
                      Việc phân tích này là một ước tính và có thể không chính
                      xác 100%. Các email spam thường xuyên thay đổi cách tiếp
                      cận để lừa các hệ thống phân loại.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalBody;
