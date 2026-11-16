import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from "../components/common/Icons";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newToast = {
      id,
      type: toast.type || "info", // "success" | "error" | "info" | "warning"
      message: toast.message || "",
      duration: toast.duration ?? 4000,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((message, duration) => addToast({ type: "success", message, duration }), [addToast]);
  const error = useCallback((message, duration) => addToast({ type: "error", message, duration }), [addToast]);
  const info = useCallback((message, duration) => addToast({ type: "info", message, duration }), [addToast]);
  const warning = useCallback((message, duration) => addToast({ type: "warning", message, duration }), [addToast]);

  const value = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }), [toasts, addToast, removeToast, success, error, info, warning]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-md border shadow-lg transition-all duration-200 transform translate-y-0 ${
                isSuccess
                  ? "bg-surface border-[#BBF7D0] dark:border-[#14532D] text-text-primary"
                  : isError
                  ? "bg-surface border-[#FECACA] dark:border-[#681D1D] text-text-primary"
                  : isWarning
                  ? "bg-surface border-[#FBD6BA] dark:border-[#5C2A10] text-text-primary"
                  : "bg-surface border-border text-text-primary"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircleIcon className="w-4 h-4 text-brand" />}
                {isError && <AlertTriangleIcon className="w-4 h-4 text-accent" />}
                {isWarning && <AlertTriangleIcon className="w-4 h-4 text-accent" />}
                {!isSuccess && !isError && !isWarning && <InfoIcon className="w-4 h-4 text-text-secondary" />}
              </div>
              <div className="flex-1 text-[13px] font-medium leading-relaxed break-words text-text-primary text-left">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors p-0.5 rounded cursor-pointer"
                aria-label="Dismiss toast"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export default ToastContext;
