import React, { useState } from "react";
import { analyzeText, addToDataset } from "../services/api.js";
import { stripHtmlTags } from "./analyzer/utils.js";
import { useQuery, useMutation } from "@tanstack/react-query";
import AnalyzerForm from "./analyzer/AnalyzerForm";
import AnalysisResult from "./analyzer/AnalysisResult";

const EmailAnalyzer = () => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [analysisParams, setAnalysisParams] = useState(null);
  const [datasetLabel, setDatasetLabel] = useState("");

  // Query cho phân tích email
  const {
    data: analysisResult,
    isLoading: isAnalyzing,
    isRefetching, // Thêm trạng thái isRefetching
    refetch: analyzeEmail,
    error: analyzeError,
  } = useQuery({
    queryKey: ["analyze", analysisParams],
    queryFn: async () => {
      if (!analysisParams) return null;
      const response = await analyzeText(
        analysisParams.subject,
        analysisParams.content
      );
      return response.data;
    },
    enabled: !!analysisParams, // Chỉ thực hiện khi analysisParams có giá trị
    staleTime: Infinity, // Không bao giờ coi dữ liệu là cũ vì chúng ta chỉ fetch khi parameters thay đổi
  });

  // Mutation cho thêm vào dataset
  const addToDatasetMutation = useMutation({
    mutationFn: ({ subject, content, label }) =>
      addToDataset(subject, content, label),
    onSuccess: () => {
      window.showToast(
        "Thành công",
        "Đã thêm dữ liệu vào tập huấn luyện thành công!",
        "success"
      );
      setDatasetLabel("");
    },
    onError: (err) => {
      if (err.response?.status === 400 && err.response?.data) {
        // Nếu là trường hợp cập nhật nhãn thành công
        if (err.response.data.updated) {
          window.showToast("Thành công", err.response.data.message, "success");
          setDatasetLabel("");
          return;
        }
        // Nếu dữ liệu đã tồn tại
        else if (err.response.data.message) {
          window.showToast("Thông báo", err.response.data.message, "info");
        }
      } else {
        const errorMessage =
          "Lỗi khi thêm vào tập dữ liệu: " +
          (err.response?.data?.error || err.message);
        window.showToast("Lỗi", errorMessage, "error");
      }
    },
  });

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!content) {
      window.showToast("Lỗi", "Vui lòng nhập nội dung email", "error");
      return;
    }
    setAnalysisParams({ subject, content });
    analyzeEmail();
  };

  const handleReset = () => {
    setSubject("");
    setContent("");
    setAnalysisParams(null);
  };

  const handleAddToDataset = async () => {
    if (!datasetLabel) {
      window.showToast("Lỗi", "Vui lòng chọn nhãn cho dữ liệu", "error");
      return;
    }

    if (!content) {
      window.showToast("Lỗi", "Vui lòng nhập nội dung email", "error");
      return;
    }

    try {
      // Xử lý nội dung và tiêu đề trước khi thêm vào dataset
      let plainSubject = stripHtmlTags(subject);
      let plainContent = stripHtmlTags(content);

      // Loại bỏ các ký tự đặc biệt và khoảng trắng thừa
      plainSubject = plainSubject.replace(/\s+/g, " ").trim();
      plainContent = plainContent.replace(/\s+/g, " ").trim();

      addToDatasetMutation.mutate({
        subject: plainSubject,
        content: plainContent,
        label: datasetLabel,
      });
    } catch (err) {
      const errorMessage =
        "Lỗi khi xử lý dữ liệu: " + (err.message || "Unknown error");
      window.showToast("Lỗi", errorMessage, "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
        {/* Hiển thị status refetching */}
        {isRefetching && (
          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded absolute top-4 right-4 z-10 flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
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
            Đang cập nhật...
          </div>
        )}

        <div className="bg-primary p-4">
          <h2 className="text-xl font-bold text-white">
            Phân tích nội dung email
          </h2>
        </div>
        <div className="p-6">
          <AnalyzerForm
            subject={subject}
            setSubject={setSubject}
            content={content}
            setContent={setContent}
            isAnalyzing={isAnalyzing}
            handleAnalyze={handleAnalyze}
            handleReset={handleReset}
          />

          {analysisResult && (
            <AnalysisResult
              result={analysisResult}
              datasetLabel={datasetLabel}
              setDatasetLabel={setDatasetLabel}
              onAddToDataset={handleAddToDataset}
              isAddingToDataset={addToDatasetMutation.isLoading}
            />
          )}

          {analyzeError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              Lỗi: {analyzeError.message || "Không thể phân tích email"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailAnalyzer;
