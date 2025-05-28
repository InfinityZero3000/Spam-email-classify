import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./tailwind.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút - thời gian dữ liệu còn "tươi"
      cacheTime: 30 * 60 * 1000, // 30 phút - thời gian cache tồn tại
      refetchOnWindowFocus: false, // Không refetch khi focus lại cửa sổ
      retry: 1, // Thử lại 1 lần nếu request thất bại
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
