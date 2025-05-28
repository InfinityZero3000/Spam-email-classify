import React, { useState, useRef, useEffect } from "react";
import { sendEmail, analyzeText } from "../services/api.js";
import ModalHeader from "./compose/ModalHeader";
import ModalBody from "./compose/ModalBody";
import ModalFooter from "./compose/ModalFooter";

const ComposeModal = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  // References for the modal element and instance
  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  // Initialize modal when component mounts
  useEffect(() => {
    modalRef.current = document.getElementById("composeModal");

    if (modalRef.current) {
      // Sử dụng headless UI hoặc custom modal thay vì Bootstrap
      // Đây là phần code tạm thời để đảm bảo tương thích với code cũ
      const showModal = () => {
        if (modalRef.current) {
          modalRef.current.classList.remove("hidden");
          modalRef.current.classList.add("flex");
          document.body.classList.add("overflow-hidden");
        }
      };

      const hideModal = () => {
        if (modalRef.current) {
          modalRef.current.classList.add("hidden");
          modalRef.current.classList.remove("flex");
          document.body.classList.remove("overflow-hidden");

          // Reset form fields
          setTo("");
          setSubject("");
          setBody("");
          setAnalysisResult(null);
          setError("");
          setEmailError("");
        }
      };

      // Lưu các hàm vào ref để sử dụng sau này
      modalInstance.current = {
        show: showModal,
        hide: hideModal,
        dispose: () => {},
      };

      // Thêm sự kiện cho nút đóng modal
      const closeButton = modalRef.current.querySelector("[data-modal-close]");
      if (closeButton) {
        closeButton.addEventListener("click", hideModal);
      }
    }

    return () => {
      if (modalRef.current) {
        const closeButton =
          modalRef.current.querySelector("[data-modal-close]");
        if (closeButton) {
          closeButton.removeEventListener("click", modalInstance.current?.hide);
        }
      }
    };
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError("");

    try {
      const response = await analyzeText(subject, body);
      setAnalysisResult(response.data);
    } catch (err) {
      setError(
        "Lỗi khi phân tích email: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  // Function to safely close the modal
  const closeModalSafely = () => {
    try {
      if (modalInstance.current) {
        modalInstance.current.hide();
      }
    } catch (error) {
      console.log("Error closing modal:", error);
      // Fallback: just reset the form
      setTo("");
      setSubject("");
      setBody("");
      setAnalysisResult(null);
      setError("");
      setEmailError("");
    }
  };

  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);

    if (value && !validateEmail(value)) {
      setEmailError("Địa chỉ email không hợp lệ");
    } else {
      setEmailError("");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError("");

    if (!to || !subject || !body) {
      setError("Vui lòng điền đầy đủ thông tin");
      setIsSending(false);
      return;
    }

    if (!validateEmail(to)) {
      setError("Địa chỉ email người nhận không hợp lệ");
      setIsSending(false);
      return;
    }

    try {
      await sendEmail(to, subject, body);
      // Close modal using the safe method
      closeModalSafely();

      // Show success toast
      window.showToast("Thành công", "Email đã được gửi", "success");
    } catch (err) {
      setError(
        "Lỗi khi gửi email: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setIsSending(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target.id === "composeModal") {
      closeModalSafely();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 hidden items-center justify-center overflow-y-auto overflow-x-hidden p-4"
      id="composeModal"
      onClick={handleBackdropClick}
      aria-labelledby="composeModalLabel"
      aria-hidden="true"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="relative w-full max-w-7xl h-[90vh]">
        <div className="relative rounded-lg bg-white shadow-lg border border-gray-200 h-full flex flex-col">
          <ModalHeader title="Soạn email mới" onClose={closeModalSafely} />
          
          <div className="flex flex-1 overflow-hidden">
            <ModalBody
              error={error}
              emailError={emailError}
              to={to}
              subject={subject}
              body={body}
              handleToChange={handleToChange}
              setSubject={setSubject}
              setBody={setBody}
              analysisResult={analysisResult}
            />
          </div>
          
          <ModalFooter
            closeModalSafely={closeModalSafely}
            handleAnalyze={handleAnalyze}
            handleSend={handleSend}
            isAnalyzing={isAnalyzing}
            isSending={isSending}
            body={body}
          />
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;
