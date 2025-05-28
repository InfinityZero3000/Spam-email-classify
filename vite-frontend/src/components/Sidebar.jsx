import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout, getStats, getEmails, getSpamEmails } from "../services/api.js";
import { useQueryClient } from "@tanstack/react-query";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const queryClient = useQueryClient();

  // Prefetch functions
  const prefetchInbox = () => {
    queryClient.prefetchQuery({
      queryKey: ["emails", "inbox", ""],
      queryFn: async () => {
        const response = await getEmails(20, "");
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchSpam = () => {
    queryClient.prefetchQuery({
      queryKey: ["emails", "spam", ""],
      queryFn: async () => {
        const response = await getSpamEmails(20, "");
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchStats = () => {
    queryClient.prefetchQuery({
      queryKey: ["stats"],
      queryFn: async () => {
        const response = await getStats();
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công!");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(
        "Lỗi khi đăng xuất: " + (error.response?.data?.error || error.message)
      );
    }
  };

  // Create navigation items structure for cleaner rendering
  const navItems = [
    {
      path: "/",
      icon: "inbox",
      label: "Hộp thư đến",
      prefetchFn: prefetchInbox,
    },
    {
      path: "/spam",
      icon: "ban",
      label: "Thư spam",
      prefetchFn: prefetchSpam,
    },
    {
      path: "/analyzer",
      icon: "search",
      label: "Phân tích",
      prefetchFn: null,
    },
    {
      path: "/stats",
      icon: "chart-bar",
      label: "Thống kê",
      prefetchFn: prefetchStats,
    },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar-bg flex flex-col fixed left-0 top-0 z-10 shadow-xl">
      {/* Logo and title section */}
      <div className="p-5 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1.5 rounded-lg shadow-md">
            <img
              src="/small-logo.png"
              alt="Spam Filter Logo"
              className="w-7 h-7"
            />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            Spam Filter
          </h1>
        </div>
      </div>

      {/* Compose button section */}
      <div className="px-4 pt-5 pb-3">
        <button
          className="w-full bg-white text-primary hover:bg-opacity-90 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-md"
          onClick={() => {
            const modal = document.getElementById("composeModal");
            if (modal) {
              modal.classList.remove("hidden");
              modal.classList.add("flex");
              document.body.classList.add("overflow-hidden");
            }
          }}
        >
          <i className="fas fa-plus mr-2"></i> Soạn thư
        </button>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  currentPath === item.path
                    ? "bg-white text-primary font-medium"
                    : "text-white hover:bg-white/10"
                }`}
                onMouseEnter={
                  item.prefetchFn && currentPath !== item.path
                    ? item.prefetchFn
                    : undefined
                }
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    currentPath === item.path ? "bg-primary/10" : ""
                  }`}
                >
                  <i
                    className={`fas fa-${item.icon} ${
                      currentPath === item.path ? "text-primary" : "text-white"
                    }`}
                  ></i>
                </div>
                <span className="ml-3">{item.label}</span>

                {currentPath === item.path && (
                  <span className="ml-auto">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full block"></span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout section */}
      <div className="p-4 mt-auto border-t border-white/20">
        <button
          onClick={handleLogout}
          className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
