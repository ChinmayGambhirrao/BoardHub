import { createContext, useContext, useCallback } from "react";
import { toast } from "react-toastify";

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  SUCCESS: {
    duration: 3000,
    position: "top-right",
    autoClose: true,
  },
  ERROR: {
    duration: 5000,
    position: "top-right",
    autoClose: true,
  },
};

export function ToastProvider({ children }) {
  const showSuccess = useCallback((message) => {
    toast.success(message, TOAST_CONFIG.SUCCESS);
  }, []);

  const showError = useCallback((message) => {
    toast.error(message, TOAST_CONFIG.ERROR);
  }, []);

  const showInfo = useCallback((message) => {
    toast.info(message, TOAST_CONFIG.SUCCESS);
  }, []);

  const showWarning = useCallback((message) => {
    toast.warning(message, TOAST_CONFIG.SUCCESS);
  }, []);

  const value = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
