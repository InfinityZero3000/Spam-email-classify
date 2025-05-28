import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import EmailAnalyzer from "../components/EmailAnalyzer.jsx";
import ComposeModal from "../components/ComposeModal.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";

const AnalyzerPage = () => {
  useDocumentTitle("Phân tích email");
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <EmailAnalyzer />
      </div>
      <ComposeModal />
    </div>
  );
};

export default AnalyzerPage;
