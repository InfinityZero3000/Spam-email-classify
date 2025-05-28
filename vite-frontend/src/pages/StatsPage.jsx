import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import Stats from "../components/Stats.jsx";
import ComposeModal from "../components/ComposeModal.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";

const StatsPage = () => {
  useDocumentTitle("Thống kê");
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <Stats />
      </div>
      <ComposeModal />
    </div>
  );
};

export default StatsPage;
