/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect } from "react";
import EmailContent from "./EmailContent";

const EmailModal = ({
  email,
  type,
  onClose,
  onMarkSpam,
  onMarkNotSpam,
  onDelete,
  datasetLabel,
  setDatasetLabel,
  onAddToDataset,
  isAddingToDataset,
}) => {
  if (!email) return null;

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target.id === "modalBackdrop") {
      onClose();
    }
  };

  // Add escape key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    // Add overflow hidden to body
    document.body.classList.add("overflow-hidden");

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      id="modalBackdrop"
      onClick={handleBackdropClick}
      aria-labelledby="emailModalLabel"
      aria-hidden="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="relative w-full max-w-7xl h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-lg bg-white shadow-lg border border-gray-200 h-full flex flex-col">
          {/* Modal header - fixed */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3
              className="text-xl font-semibold text-text-main"
              id="emailModalLabel"
            >
              Chi tiết email
            </h3>
            <button
              type="button"
              className="text-text-secondary bg-transparent hover:bg-gray-100 hover:text-text-main rounded-lg p-1.5 ml-auto inline-flex items-center"
              onClick={onClose}
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          </div>

          {/* Modal body - will scroll */}
          <div className="flex flex-1 overflow-hidden">
            <EmailContent
              email={email}
              type={type}
              onMarkSpam={onMarkSpam}
              onMarkNotSpam={onMarkNotSpam}
              onDelete={onDelete}
              datasetLabel={datasetLabel}
              setDatasetLabel={setDatasetLabel}
              onAddToDataset={onAddToDataset}
              isAddingToDataset={isAddingToDataset}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
