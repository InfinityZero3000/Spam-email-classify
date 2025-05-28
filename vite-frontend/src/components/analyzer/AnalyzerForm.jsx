import React from "react";
import { ClipLoader } from "react-spinners";

const AnalyzerForm = ({
  subject,
  setSubject,
  content,
  setContent,
  isAnalyzing,
  handleAnalyze,
  handleReset,
}) => {
  return (
    <form onSubmit={handleAnalyze}>
      <div className="mb-4">
        <label htmlFor="emailSubject" className="block text-text-main mb-1">
          Tiêu đề:
        </label>
        <input
          type="text"
          className="w-full p-2 rounded border border-gray-300 bg-white text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
          id="emailSubject"
          placeholder="Nhập tiêu đề email (không bắt buộc)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="emailContent" className="block text-text-main mb-1">
          Nội dung email:
        </label>
        <textarea
          className="w-full p-2 rounded border border-gray-300 bg-white text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
          id="emailContent"
          rows="10"
          placeholder="Dán nội dung email cần phân tích vào đây"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="flex mb-4">
        <button
          type="submit"
          className="flex items-center mr-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          disabled={isAnalyzing || !content}
        >
          {isAnalyzing ? (
            <>
              <ClipLoader
                size={16}
                color="#ffffff"
                loading={true}
                aria-label="Loading Spinner"
              />
              <span className="ml-2">Đang phân tích...</span>
            </>
          ) : (
            <>
              <i className="fas fa-search mr-1"></i> Phân tích
            </>
          )}
        </button>
        <button
          type="button"
          className="flex items-center px-4 py-2 bg-gray-200 text-text-main rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          onClick={handleReset}
          disabled={isAnalyzing || (!subject && !content)}
        >
          <i className="fas fa-redo-alt mr-1"></i> Xóa nội dung
        </button>
      </div>
    </form>
  );
};

export default AnalyzerForm;
