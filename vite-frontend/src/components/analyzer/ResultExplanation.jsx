import React from "react";

const ResultExplanation = ({ result }) => {
  if (!result) return null;

  const { classification, confidence, email_stats } = result;
  const isSpam = classification === "spam";

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="mb-3 border-b pb-2 border-gray-200">
        <h3 className="text-lg font-semibold text-text-main flex items-center">
          <i className="fas fa-info-circle mr-2"></i>Giải thích kết quả
        </h3>
      </div>

      <p className="mb-4 text-text-main">
        Thuật toán Naive Bayes đã phân tích nội dung email và
        {isSpam
          ? " phân loại đây là email SPAM với độ tin cậy "
          : " phân loại đây là email an toàn với độ tin cậy "}
        <strong>{confidence}%</strong>.
      </p>

      <div className="bg-gray-50 p-3 rounded mb-4">
        <h4 className="font-semibold text-text-main mb-2">
          Cách thuật toán Naive Bayes hoạt động:
        </h4>
        <ol className="pl-5 space-y-1 text-text-main">
          <li>
            Tính toán xác suất có điều kiện cho mỗi từ xuất hiện trong email
          </li>
          <li>
            So sánh xác suất từ đó xuất hiện trong email spam và email thường
          </li>
          <li>Kết hợp các xác suất để đưa ra quyết định cuối cùng</li>
        </ol>
      </div>

      {isSpam ? (
        <div>
          <h4 className="font-semibold text-text-main mb-2">
            Lý do phân loại là SPAM:
          </h4>
          <ul className="pl-5 list-disc space-y-1 text-text-main">
            <li>Email chứa các từ khóa có xác suất cao xuất hiện trong spam</li>
            {email_stats?.has_urls && (
              <li>Email chứa URL, một đặc điểm phổ biến trong email spam</li>
            )}
            {email_stats?.uppercase_ratio > 0.3 && (
              <li>
                Email có tỷ lệ chữ hoa cao (
                {(email_stats?.uppercase_ratio * 100).toFixed(1)}%), thường thấy
                trong spam
              </li>
            )}
            {email_stats?.special_char_count > 10 && (
              <li>
                Email chứa nhiều ký tự đặc biệt, thường gặp trong email spam
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div>
          <h4 className="font-semibold text-text-main mb-2">
            Lý do phân loại là KHÔNG PHẢI SPAM:
          </h4>
          <ul className="pl-5 list-disc space-y-1 text-text-main">
            <li>
              Email chứa các từ khóa thường xuất hiện trong email bình thường
            </li>
            {!email_stats?.has_urls && (
              <li>Email không chứa URL, giảm khả năng là spam</li>
            )}
            {email_stats?.uppercase_ratio < 0.2 && (
              <li>
                Email có tỷ lệ chữ hoa thấp, phù hợp với email bình thường
              </li>
            )}
            {email_stats?.word_count > 20 && (
              <li>
                Email có độ dài hợp lý ({email_stats?.word_count} từ), phù hợp
                với email bình thường
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultExplanation;
