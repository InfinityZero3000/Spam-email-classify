import React from "react";

const EmailHeader = ({
  type,
  searchQuery,
  setSearchQuery,
  handleSearch
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-main">
          {type === "inbox" ? "Hộp thư đến" : "Thư spam"}
        </h2>
      </div>

      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          className="flex-1 p-2 bg-white border border-gray-300 rounded-l-lg focus:ring-primary focus:border-primary text-text-main"
          placeholder="Tìm kiếm email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-r-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
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
        </button>
      </form>
    </div>
  );
};

export default EmailHeader;
