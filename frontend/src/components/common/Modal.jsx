                  import { useEffect } from "react";
import { XIcon } from "./Icons";

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md", // "sm" | "md" | "lg" | "xl"
  maxWidth,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass =
    maxWidth ||
    (size === "sm"
      ? "max-w-md"
      : size === "lg"
      ? "max-w-2xl"
      : size === "xl"
      ? "max-w-4xl"
      : "max-w-lg");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 transition-opacity"
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeClass} overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-5 sm:p-6 text-slate-900 dark:text-slate-100 shadow-xl transition-all my-8`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            aria-label="Close dialog"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="text-xs">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
