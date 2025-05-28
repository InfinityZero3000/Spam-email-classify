import React from "react";
import { ClipLoader } from "react-spinners";

const AddToDataset = ({
  datasetLabel,
  setDatasetLabel,
  isAddingToDataset,
  handleAddToDataset,
}) => {
  return (
    <div className="bg-white rounded shadow p-4 mt-6">
      <h3 className="text-lg font-semibold text-text-main mb-3">
        Thêm vào tập dữ liệu huấn luyện:
      </h3>
      <p className="text-text-secondary mb-4">
        Nếu kết quả phân loại không chính xác, bạn có thể thêm email này vào tập
        dữ liệu huấn luyện với nhãn đúng.
      </p>
      <div className="mb-4">
        <label className="text-text-main font-medium block mb-2">
          Chọn nhãn:
        </label>
        <div className="space-x-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-primary"
              name="datasetLabel"
              value="ham"
              checked={datasetLabel === "ham"}
              onChange={() => setDatasetLabel("ham")}
            />
            <span className="ml-2 text-text-main">Không phải spam</span>
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-primary"
              name="datasetLabel"
              value="spam"
              checked={datasetLabel === "spam"}
              onChange={() => setDatasetLabel("spam")}
            />
            <span className="ml-2 text-text-main">Spam</span>
          </label>
        </div>
      </div>
      <button
        className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        onClick={handleAddToDataset}
        disabled={isAddingToDataset || !datasetLabel}
      >
        {isAddingToDataset ? (
          <>
            <ClipLoader
              size={16}
              color="#ffffff"
              loading={true}
              aria-label="Loading Spinner"
            />
            <span className="ml-2">Đang thêm...</span>
          </>
        ) : (
          <>
            <i className="fas fa-plus mr-1"></i> Thêm vào tập dữ liệu
          </>
        )}
      </button>
    </div>
  );
};

export default AddToDataset;
