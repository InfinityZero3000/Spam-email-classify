import React from "react";
import ResultExplanation from "./ResultExplanation";
import EmailStats from "./EmailStats";
import KeywordImpact from "./KeywordImpact";
import AddToDataset from "./AddToDataset";

const AnalysisResult = ({
  result,
  datasetLabel,
  setDatasetLabel,
  isAddingToDataset,
  handleAddToDataset,
}) => {
  if (!result) return null;

  const { classification, confidence, email_stats, top_keywords } = result;
  const isSpam = classification === "spam";

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-text-main mb-4">
        Kết quả phân tích:
      </h3>

      <div
        className={`rounded shadow overflow-hidden ${
          isSpam ? "border-red-500 border" : "border-green-500 border"
        }`}
      >
        <div className={`p-4 ${isSpam ? "bg-red-50" : "bg-green-50"}`}>
          <div className="mb-4 flex items-center">
            <span className="font-semibold text-text-main text-lg mr-2">
              Phân loại:
            </span>
            <span
              className={`px-3 py-1 rounded text-white text-lg font-medium ${
                isSpam ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {isSpam ? "SPAM" : "KHÔNG PHẢI SPAM"}
            </span>
          </div>

          <div className="mt-4">
            <label className="block font-semibold text-text-main mb-1">
              Độ tin cậy: {confidence}%
            </label>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={`h-6 rounded-full ${
                  isSpam ? "bg-red-500" : "bg-green-500"
                } flex items-center justify-center text-white text-sm font-medium`}
                style={{ width: `${confidence}%` }}
              >
                {confidence}%
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <ResultExplanation result={result} />
            <EmailStats emailStats={email_stats} />
          </div>

          {top_keywords && top_keywords.length > 0 && (
            <KeywordImpact keywords={top_keywords} />
          )}
        </div>
      </div>

      <AddToDataset
        datasetLabel={datasetLabel}
        setDatasetLabel={setDatasetLabel}
        isAddingToDataset={isAddingToDataset}
        handleAddToDataset={handleAddToDataset}
      />
    </div>
  );
};

export default AnalysisResult;
