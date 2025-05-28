import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import EmailList from "../components/EmailList.jsx";
import ComposeModal from "../components/ComposeModal.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";

const SpamPage = () => {
  useDocumentTitle("Thư rác");
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <EmailList type="spam" />
      </div>
      <ComposeModal />
    </div>
  );
};

export default SpamPage;
