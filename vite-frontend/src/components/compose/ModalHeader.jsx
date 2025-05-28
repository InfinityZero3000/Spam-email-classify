import React from "react";

const ModalHeader = ({ title, onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h3 className="text-xl font-semibold text-text-main" id="composeModalLabel">
        {title}
      </h3>
      <button
        type="button"
        className="text-text-secondary bg-transparent hover:bg-gray-100 hover:text-text-main rounded-lg p-1.5 ml-auto inline-flex items-center"
        onClick={onClose}
        data-modal-close
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
  );
};

export default ModalHeader;
