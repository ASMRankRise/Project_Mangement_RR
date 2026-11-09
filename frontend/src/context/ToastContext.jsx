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
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl transition-all duration-200 transform translate-y-0 backdrop-blur-md ${
                isSuccess
                  ? "bg-white dark:bg-[#0F1E19] border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                  : isError
                  ? "bg-white dark:bg-[#201215] border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200"
                  : isWarning
                  ? "bg-white dark:bg-[#20190E] border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200"
                  : "bg-white dark:bg-[#101726] border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-200"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircleIcon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />}
                {isError && <AlertTriangleIcon className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />}
                {isWarning && <AlertTriangleIcon className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <InfoIcon className="w-4.5 h-4.5 text-sky-600 dark:text-sky-400" />}
              </div>
              <div className="flex-1 text-xs font-semibold leading-relaxed break-words">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-0.5 rounded"
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
