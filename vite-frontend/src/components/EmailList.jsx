import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmails,
  getSpamEmails,
  markAsSpam,
  markAsNotSpam,
  markAsRead,
  deleteEmail,
  addToDataset,
} from "../services/api.js";
import { Confirm } from "notiflix/build/notiflix-confirm-aio";
import EmailItem from "./email/EmailItem";
import EmailModal from "./email/EmailModal";
import EmailHeader from "./email/EmailHeader";

// Giữ nguyên hàm stripHtmlTags
const stripHtmlTags = (html) => {
  if (!html) return "";

  try {
    // Phương pháp 1: Sử dụng DOM API
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Loại bỏ các phần tử script và style
    const scripts = tempDiv.getElementsByTagName("script");
    const styles = tempDiv.getElementsByTagName("style");

    // Xóa từ cuối lên đầu để tránh vấn đề với NodeList động
    for (let i = scripts.length - 1; i >= 0; i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }

    for (let i = styles.length - 1; i >= 0; i--) {
      styles[i].parentNode.removeChild(styles[i]);
    }

    // Lấy văn bản thuần túy
    let text = tempDiv.textContent || tempDiv.innerText || "";

    // Phương pháp 2: Sử dụng regex để đảm bảo loại bỏ tất cả các thẻ còn sót lại
    // Loại bỏ tất cả các thẻ HTML còn sót lại
    text = text.replace(/<[^>]*>/g, "");

    // Loại bỏ khoảng trắng thừa và ký tự đặc biệt
    text = text.replace(/\s+/g, " ").trim();

    return text;
  } catch (error) {
    console.error("Lỗi khi loại bỏ HTML:", error);

    // Phương pháp dự phòng: Sử dụng regex
    return html
      .replace(/<[^>]*>/g, "") // Loại bỏ tất cả các thẻ HTML
      .replace(/&nbsp;/g, " ") // Thay thế &nbsp; bằng khoảng trắng
      .replace(/&amp;/g, "&") // Thay thế &amp; bằng &
      .replace(/&lt;/g, "<") // Thay thế &lt; bằng <
      .replace(/&gt;/g, ">") // Thay thế &gt; bằng >
      .replace(/&quot;/g, '"') // Thay thế &quot; bằng "
      .replace(/&#39;/g, "'") // Thay thế &#39; bằng '
      .replace(/\s+/g, " ") // Loại bỏ khoảng trắng thừa
      .trim(); // Loại bỏ khoảng trắng ở đầu và cuối
  }
};

const EmailList = ({ type = "inbox" }) => {
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [datasetLabel, setDatasetLabel] = useState("");
  const [isAddingToDataset, setIsAddingToDataset] = useState(false);
  const scrollContainerRef = useRef(null);

  // Sử dụng React Query để fetch emails
  const {
    data,
    isLoading,
    isRefetching, // Thêm trạng thái isRefetching
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["emails", type, searchQuery],
    queryFn: async ({ pageParam = null }) => {
      const response =
        type === "inbox"
          ? await getEmails(20, searchQuery, pageParam)
          : await getSpamEmails(20, searchQuery, pageParam);
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    initialPageParam: null,
  });

  // Trích xuất emails từ data.pages
  const emails = data?.pages?.flatMap((page) => page.emails) || [];
  const error = queryError ? `Lỗi khi tải email: ${queryError.message}` : "";

  // Debug logging
  useEffect(() => {
    console.log('📧 Email List Debug:', {
      totalEmails: emails.length,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      pagesCount: data?.pages?.length || 0,
      lastPageToken: data?.pages?.[data.pages.length - 1]?.nextPageToken || 'none',
      allData: data
    });
  }, [emails.length, hasNextPage, isFetchingNextPage, isLoading, data]);

  // Infinite scroll: Tự động load khi scroll gần đến cuối
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Khi scroll đến 90% chiều cao, tự động load thêm
      if (scrollPercentage > 0.9) {
        if (hasNextPage && !isFetchingNextPage && !isLoading) {
          console.log('🔄 Auto-loading more emails...', {
            hasNextPage,
            isFetchingNextPage,
            scrollPercentage: Math.round(scrollPercentage * 100) + '%'
          });
          fetchNextPage();
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  // Mutation cho markAsSpam
  const markSpamMutation = useMutation({
    mutationFn: (emailId) => markAsSpam(emailId),
    onSuccess: () => {
      // Invalidate liên quan để React Query tự động refetch
      queryClient.invalidateQueries({ queryKey: ["emails", "inbox"] });
      queryClient.invalidateQueries({ queryKey: ["emails", "spam"] });
      window.showToast(
        "Thành công",
        "Email đã được đánh dấu là spam",
        "success"
      );
    },
    onError: (err) => {
      window.showToast(
        "Lỗi",
        `Lỗi khi đánh dấu email là spam: ${err.message}`,
        "error"
      );
    },
  });

  // Mutation cho markAsNotSpam
  const markNotSpamMutation = useMutation({
    mutationFn: (emailId) => markAsNotSpam(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", "inbox"] });
      queryClient.invalidateQueries({ queryKey: ["emails", "spam"] });
      window.showToast(
        "Thành công",
        "Email đã được đánh dấu là không phải spam",
        "success"
      );
    },
    onError: (err) => {
      window.showToast(
        "Lỗi",
        `Lỗi khi đánh dấu email là không phải spam: ${err.message}`,
        "error"
      );
    },
  });

  // Mutation cho deleteEmail
  const deleteEmailMutation = useMutation({
    mutationFn: (emailId) => deleteEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", type] });
      window.showToast("Thành công", "Email đã được xóa", "success");
    },
    onError: (err) => {
      window.showToast("Lỗi", `Lỗi khi xóa email: ${err.message}`, "error");
    },
  });

  // Mutation cho addToDataset
  const addToDatasetMutation = useMutation({
    mutationFn: ({ subject, content, label }) =>
      addToDataset(subject, content, label),
    onSuccess: () => {
      window.showToast(
        "Thành công",
        "Đã thêm email vào tập huấn luyện thành công!",
        "success"
      );
      setDatasetLabel("");
    },
    onError: (err) => {
      if (err.response?.status === 400 && err.response?.data) {
        if (err.response.data.updated) {
          window.showToast("Thành công", err.response.data.message, "success");
          setDatasetLabel("");
          return;
        } else if (err.response.data.message) {
          window.showToast("Thông báo", err.response.data.message, "info");
        }
      } else {
        const errorMessage =
          "Lỗi khi thêm vào tập dữ liệu: " +
          (err.response?.data?.error || err.message);
        window.showToast("Lỗi", errorMessage, "error");
      }
    },
    onSettled: () => {
      setIsAddingToDataset(false);
    },
  });

  // Handlers
  const handleEmailClick = async (email) => {
    try {
      if (!email.read) {
        await markAsRead(email.id);
      }
      setSelectedEmail(email);
    } catch (err) {
      console.error("Error marking email as read:", err);
    }
  };

  const closeModal = () => {
    setSelectedEmail(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    queryClient.invalidateQueries({ queryKey: ["emails", type, searchQuery] });
  };

  const handleLoadMore = () => {
    fetchNextPage();
  };

  const handleMarkSpam = (emailId) => {
    Confirm.show(
      "Đánh dấu là spam",
      "Bạn có chắc chắn muốn đánh dấu email này là spam không?",
      "Đánh dấu",
      "Hủy",
      () => {
        markSpamMutation.mutate(emailId);
        closeModal();
      },
      () => {},
      {
        titleColor: "#3b82f6",
        okButtonBackground: "#3b82f6",
        borderRadius: "8px",
        width: "320px",
        messageMaxLength: 500,
        buttonsFontSize: "14px",
        buttonsTextDecoration: "none",
        cssAnimationStyle: "zoom",
      }
    );
  };

  const handleMarkNotSpam = (emailId) => {
    Confirm.show(
      "Đánh dấu là không phải spam",
      "Bạn có chắc chắn muốn đánh dấu email này là không phải spam không?",
      "Đánh dấu",
      "Hủy",
      () => {
        markNotSpamMutation.mutate(emailId);
        closeModal();
      },
      () => {},
      {
        titleColor: "#3b82f6",
        okButtonBackground: "#3b82f6",
        borderRadius: "8px",
        width: "320px",
        messageMaxLength: 500,
        buttonsFontSize: "14px",
        buttonsTextDecoration: "none",
        cssAnimationStyle: "zoom",
      }
    );
  };

  const handleDeleteEmail = (emailId) => {
    Confirm.show(
      "Xóa email",
      "Bạn có chắc chắn muốn xóa email này vĩnh viễn không?",
      "Xóa",
      "Hủy",
      () => {
        deleteEmailMutation.mutate(emailId);
        closeModal();
      },
      () => {},
      {
        titleColor: "#dc3545",
        okButtonBackground: "#dc3545",
        borderRadius: "8px",
        width: "320px",
        messageMaxLength: 500,
        buttonsFontSize: "14px",
        buttonsTextDecoration: "none",
        cssAnimationStyle: "zoom",
      }
    );
  };

  const handleAddToDataset = async () => {
    if (!datasetLabel) {
      window.showToast("Lỗi", "Vui lòng chọn nhãn cho dữ liệu", "error");
      return;
    }

    if (!selectedEmail) {
      window.showToast("Lỗi", "Không có email được chọn", "error");
      return;
    }

    setIsAddingToDataset(true);

    try {
      // Xử lý nội dung email trước khi thêm vào dataset
      let plainContent = "";

      if (selectedEmail.plain_content && selectedEmail.plain_content.trim()) {
        plainContent = stripHtmlTags(selectedEmail.plain_content);
      } else {
        plainContent = stripHtmlTags(selectedEmail.content);
      }

      // Loại bỏ các ký tự đặc biệt và khoảng trắng thừa
      plainContent = plainContent.replace(/\s+/g, " ").trim();

      addToDatasetMutation.mutate({
        subject: selectedEmail.subject,
        content: plainContent,
        label: datasetLabel,
      });
    } catch (err) {
      setIsAddingToDataset(false);
      window.showToast("Lỗi", `Lỗi khi xử lý dữ liệu: ${err.message}`, "error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-text-main relative">
      {/* Thêm indicator khi đang refetch */}
      {isRefetching && (
        <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded absolute top-2 right-2 z-10 flex items-center">
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

      <EmailHeader
        type={type}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        loading={isLoading}
      />

      {error && (
        <div className="p-4 mb-4 text-sm text-red-600 rounded-lg bg-red-100">
          {error}
        </div>
      )}

      {isLoading && !data?.emails?.length ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
          <p className="text-text-secondary">Đang tải email...</p>
        </div>
      ) : emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <svg
            className="w-16 h-16 text-text-secondary"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
          </svg>
          <p className="text-text-secondary">Không có email nào</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
          <div className="divide-y divide-gray-200">
            {emails.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                onClick={handleEmailClick}
                type={type}
              />
            ))}
          </div>
          
          {/* Debug Info - Remove in production */}
          <div className="p-2 bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
            Debug: hasNextPage={String(hasNextPage)} | isFetchingNextPage={String(isFetchingNextPage)} | emails={emails.length}
          </div>
          
          {/* Loading indicator khi đang tải thêm */}
          {isFetchingNextPage && (
            <div className="p-6 flex justify-center bg-gray-50">
              <div className="flex items-center space-x-3 text-primary">
                <svg
                  className="animate-spin h-5 w-5"
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
                <span className="font-medium">Đang tải thêm email...</span>
              </div>
            </div>
          )}
          
          {/* Nút "Tải thêm" - hiển thị khi còn email và không đang tải */}
          {hasNextPage && !isFetchingNextPage && (
            <div className="p-6 flex justify-center bg-gradient-to-t from-gray-50 to-white border-t">
              <button
                className="group relative px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
              >
                <svg 
                  className="w-5 h-5 group-hover:animate-bounce" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
                <span>Tải thêm email</span>
                <svg 
                  className="w-5 h-5 group-hover:animate-bounce" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </button>
            </div>
          )}
          
          {/* Thông báo khi hết email */}
          {!hasNextPage && emails.length > 0 && (
            <div className="p-6 flex justify-center text-text-secondary bg-gray-50 border-t">
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="font-medium">Đã tải tất cả email</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Modal */}
      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          type={type}
          onClose={closeModal}
          onMarkSpam={handleMarkSpam}
          onMarkNotSpam={handleMarkNotSpam}
          onDelete={handleDeleteEmail}
          datasetLabel={datasetLabel}
          setDatasetLabel={setDatasetLabel}
          onAddToDataset={handleAddToDataset}
          isAddingToDataset={isAddingToDataset}
        />
      )}
    </div>
  );
};

export default EmailList;
