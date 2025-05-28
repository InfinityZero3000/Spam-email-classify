import React from "react";

const ModalFooter = ({
  closeModalSafely,
  handleAnalyze,
  handleSend,
  isAnalyzing,
  isSending,
  body,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
      <div>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-text-main bg-gray-100 hover:bg-gray-200 rounded-lg focus:ring-4 focus:ring-gray-200 mr-2"
          onClick={closeModalSafely}
        >
          <svg
            className="w-4 h-4 mr-1 inline"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
          Hủy
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg focus:ring-4 focus:ring-primary/25"
          onClick={handleAnalyze}
          disabled={!body || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <svg
                className="w-4 h-4 mr-2 text-white animate-spin inline"
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
              Đang phân tích...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1 inline"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Phân tích
            </>
          )}
        </button>
      </div>
      <button
        type="button"
        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg focus:ring-4 focus:ring-primary/25"
        onClick={handleSend}
        disabled={isSending}
      >
        {isSending ? (
          <>
            <svg
              className="w-4 h-4 mr-2 text-white animate-spin inline"
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
            Đang gửi...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-1 inline"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
            </svg>
            Gửi
          </>
        )}
      </button>
    </div>
  );
};

export default ModalFooter;
