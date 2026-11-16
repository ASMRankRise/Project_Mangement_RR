import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import { AvatarGroup } from "../common/Avatar";
import {
  CalendarIcon,
  TrashIcon,
  ClockIcon,
  FolderIcon,
  AlertTriangleIcon,
} from "../common/Icons";
import { useToast } from "../../context/ToastContext";

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projects = [],
  currentUser,
  user,
  onUpdateTask,
  onUpdate,
  onDeleteTask,
  onDelete,
}) {
  const { success, error: toastError } = useToast();
  const effectiveUser = currentUser || user;
  const updateHandler = onUpdateTask || onUpdate;
  const deleteHandler = onDeleteTask || onDelete;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "todo");
      setPriority(task.priority || "medium");
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  const getId = (v) => (typeof v === "object" && v !== null ? v._id || v.id : v);
  const currentUserId = String(getId(effectiveUser) || "");
  const isAdmin =
    effectiveUser?.role === "admin" || effectiveUser?.role === "superadmin";

  const assignedUsers = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
    ? [task.assignedTo]
    : [];

  const isAssignedToMe =
    currentUserId !== "" &&
    assignedUsers.some((m) => String(getId(m) || "") === currentUserId);

  const projectId = getId(task.project);
  const project = projects.find((p) => String(getId(p)) === String(projectId));
  const isProjectOwner =
    currentUserId !== "" && String(getId(project?.owner) || "") === currentUserId;

  const canManageAll = isAdmin || isProjectOwner;
  const canUpdateStatus = canManageAll || isAssignedToMe;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    status !== "completed" &&
    status !== "done";

  const handleSave = async (e) => {
    e?.preventDefault();
    if (submitting) return;

    if (canManageAll) {
      if (!title.trim()) {
        toastError("Task title cannot be empty");
        return;
      }
      if (title.trim().length > 150) {
        toastError("Title cannot exceed 150 characters");
        return;
      }
      if (description.trim().length > 1000) {
        toastError("Description cannot exceed 1000 characters");
        return;
      }

      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      const res = await updateHandler?.(task._id || task.id, payload);
      setSubmitting(false);

      if (res?.success !== false) {
        success("Task updated successfully");
        setIsEditing(false);
        onClose();
      } else {
        toastError(res?.error || "Failed to update task");
      }
    } else if (canUpdateStatus) {
      setSubmitting(true);
      const res = await updateHandler?.(task._id || task.id, { status });
      setSubmitting(false);

      if (res?.success !== false) {
        success("Task status updated");
        onClose();
      } else {
        toastError(res?.error || "Failed to update status");
      }
    }
  };

  const handleDelete = async () => {
    if (!canManageAll || deleting) return;
    const confirmed = window.confirm(`Permanently delete "${task.title}"?`);
    if (!confirmed) return;

    setDeleting(true);
    const res = await deleteHandler?.(task._id || task.id);
    setDeleting(false);

    if (res?.success !== false) {
      success("Task deleted successfully");
      onClose();
    } else {
      toastError(res?.error || "Failed to delete task");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit task" : "Task details"}
      size="lg"
    >
      <div className="space-y-4 text-text-primary text-left">
        {/* Workspace / Project Badge */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-text-secondary" />
            <span className="text-sm font-semibold text-text-primary">
              {project?.name || task.project?.name || "Workspace Task"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={status} size="xs" />
            <PriorityBadge priority={priority} size="xs" />
          </div>
        </div>

        {/* Task Form or View */}
        {isEditing && canManageAll ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">
                Task title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                required
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors shadow-subtle"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Add additional context or requirements..."
                className="w-full rounded-md border border-border bg-surface p-3 text-sm text-text-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none shadow-subtle placeholder:text-text-tertiary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand cursor-pointer shadow-subtle"
                >
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="testing">Testing</option>
                  <option value="completed">Completed</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand cursor-pointer shadow-subtle"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1">
                  Due date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand shadow-subtle"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="h-9 inline-flex items-center gap-1.5 px-3 rounded-md text-[13px] font-medium text-[#991B1B] dark:text-[#F87171] hover:bg-[#FEF2F2] dark:hover:bg-[#3B0D0D] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <TrashIcon className="w-4 h-4" />
                <span>{deleting ? "Deleting..." : "Delete"}</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={submitting}
                  className="h-9 px-3.5 rounded-md text-[13px] font-medium text-text-primary border border-border bg-surface hover:bg-surface-subtle transition-colors cursor-pointer shadow-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-3.5 rounded-md text-[13px] font-medium text-brand-text bg-brand hover:bg-brand-hover transition-colors shadow-subtle disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary tracking-tight leading-snug">
                {task.title}
              </h3>
              {task.description ? (
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {task.description}
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-text-tertiary italic">
                  No detailed description provided.
                </p>
              )}
            </div>

            {/* Overdue alert if applicable */}
            {isOverdue && (
              <div className="flex items-center gap-2.5 p-3 rounded-md bg-accent-subtle border border-accent/20 text-accent-text text-sm font-medium">
                <AlertTriangleIcon className="w-4 h-4 text-accent shrink-0" />
                <span>
                  This task is overdue. The due date was{" "}
                  {new Date(task.dueDate).toLocaleDateString()}.
                </span>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-lg bg-surface-subtle border border-border text-sm">
              <div>
                <span className="text-text-tertiary block mb-1 font-medium text-[12px]">
                  Assigned members
                </span>
                {assignedUsers.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AvatarGroup users={assignedUsers} size="xs" max={4} />
                    <span className="text-text-primary text-sm font-medium">
                      {assignedUsers.map((u) => u.name || u.email).join(", ")}
                    </span>
                  </div>
                ) : (
                  <span className="text-text-tertiary text-sm">Unassigned</span>
                )}
              </div>

              <div>
                <span className="text-text-tertiary block mb-1 font-medium text-[12px]">
                  Due date
                </span>
                <div className="flex items-center gap-1.5 text-text-primary text-sm font-medium">
                  <CalendarIcon className="w-4 h-4 text-text-secondary" />
                  <span>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "No deadline specified"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-text-tertiary block mb-1 font-medium text-[12px]">
                  Created on
                </span>
                <div className="flex items-center gap-1.5 text-text-primary text-sm">
                  <ClockIcon className="w-4 h-4 text-text-secondary" />
                  <span>
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-text-tertiary block mb-1 font-medium text-[12px]">
                  Status
                </span>
                {canUpdateStatus && !canManageAll ? (
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      updateHandler?.(task._id || task.id, { status: e.target.value });
                    }}
                    className="h-8 rounded-md border border-border bg-surface px-2.5 text-[13px] font-medium text-text-primary outline-none focus:border-brand cursor-pointer shadow-subtle"
                  >
                    <option value="todo">To do</option>
                    <option value="in-progress">In progress</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <StatusBadge status={status} size="xs" />
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              {canManageAll ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-9 inline-flex items-center gap-1.5 px-3 rounded-md text-[13px] font-medium text-[#991B1B] dark:text-[#F87171] hover:bg-[#FEF2F2] dark:hover:bg-[#3B0D0D] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>{deleting ? "Deleting..." : "Delete"}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2.5">
                {canManageAll && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="h-9 px-3.5 rounded-md text-[13px] font-medium text-brand-text bg-brand hover:bg-brand-hover transition-colors shadow-subtle cursor-pointer"
                  >
                    Edit task
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-3.5 rounded-md text-[13px] font-medium text-text-primary border border-border bg-surface hover:bg-surface-subtle transition-colors cursor-pointer shadow-subtle"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TaskDetailModal;
