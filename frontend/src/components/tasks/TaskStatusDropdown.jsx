import { useState } from "react";
import { StatusBadge } from "../common/Badge";
import { useToast } from "../../context/ToastContext";

export function TaskStatusDropdown({
  status = "todo",
  canEdit = false,
  onUpdate,
  disabled = false,
  size = "xs",
  className = "",
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

  if (!canEdit) {
    return <StatusBadge status={status} size={size} />;
  }

  const handleChange = async (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === status || isUpdating || disabled) return;

    setIsUpdating(true);
    try {
      const res = await onUpdate?.(newStatus);
      if (res?.success === false) {
        toastError(res?.error || "Failed to update status");
      } else {
        toastSuccess?.("Status updated");
      }
    } catch (err) {
      toastError(
        err?.response?.data?.message || err?.message || "Failed to update status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const sizeClasses = {
    xs: "h-6 text-[12px] px-2",
    sm: "h-7 text-[12px] px-2.5",
    md: "h-9 text-sm px-3",
  }[size] || "h-6 text-[12px] px-2";

  return (
    <div
      className="inline-flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      <select
        aria-label="Change status"
        value={status || "todo"}
        disabled={isUpdating || disabled}
        onChange={handleChange}
        className={`rounded border border-border bg-surface-subtle font-medium text-text-primary outline-none focus:border-brand cursor-pointer disabled:opacity-50 transition-colors shadow-subtle ${sizeClasses} ${className}`}
      >
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="testing">Testing</option>
        <option value="completed">Completed</option>
        <option value="done">Done</option>
      </select>
      {isUpdating && (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand border-t-transparent shrink-0" />
      )}
    </div>
  );
}

export default TaskStatusDropdown;
