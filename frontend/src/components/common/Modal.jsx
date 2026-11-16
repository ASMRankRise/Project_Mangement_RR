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
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeClass} overflow-hidden rounded-lg border border-border bg-surface p-5 sm:p-6 text-text-primary shadow-lg transition-all my-8`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-3 mb-4">
          <div>
            {title && (
              <h3 className="text-[17px] font-semibold tracking-tight text-text-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition cursor-pointer"
            aria-label="Close dialog"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="text-sm text-text-primary leading-normal">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
