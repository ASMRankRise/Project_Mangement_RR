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
  const isAdmin = effectiveUser?.role === "admin";

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
      title={isEditing ? "Edit Task" : "Task Details"}
      size="lg"
    >
      <div className="space-y-4 text-slate-800 dark:text-slate-200">
        {/* Workspace / Project Badge */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <FolderIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {project?.name || task.project?.name || "Workspace Task"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <StatusBadge status={status} size="xs" />
            <PriorityBadge priority={priority} size="xs" />
          </div>
        </div>

        {/* Task Form or View */}
        {isEditing && canManageAll ? (
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                required
                className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Add additional context or requirements..."
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition resize-none shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 cursor-pointer shadow-2xs"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="testing">Testing</option>
                  <option value="completed">Completed</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 cursor-pointer shadow-2xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="h-8 inline-flex items-center gap-1.5 px-3 rounded-md text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>{deleting ? "Deleting..." : "Delete"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={submitting}
                  className="h-8 px-3 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-8 px-3 rounded-md text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight leading-snug">
                {task.title}
              </h3>
              {task.description ? (
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {task.description}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400 italic">
                  No detailed description provided.
                </p>
              )}
            </div>

            {/* Overdue alert if applicable */}
            {isOverdue && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertTriangleIcon className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  This task is overdue! The due date was{" "}
                  {new Date(task.dueDate).toLocaleDateString()}.
                </span>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Assigned Members
                </span>
                {assignedUsers.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AvatarGroup users={assignedUsers} size="xs" max={4} />
                    <span className="text-slate-700 dark:text-slate-300 text-xs">
                      {assignedUsers.map((u) => u.name || u.email).join(", ")}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">Unassigned</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Due Date
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
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
                <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Created On
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Workflow State
                </span>
                {canUpdateStatus && !canManageAll ? (
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      updateHandler?.(task._id || task.id, { status: e.target.value });
                    }}
                    className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1117] px-2 py-1 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
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
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              {canManageAll ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>{deleting ? "Deleting..." : "Delete"}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {canManageAll && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-3 rounded-md text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-2xs"
                  >
                    Edit Task
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 px-3 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
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
