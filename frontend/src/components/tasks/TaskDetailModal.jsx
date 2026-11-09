import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import { AvatarGroup } from "../common/Avatar";
import {
  CalendarIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
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
  onUpdateTask,
  onDeleteTask,
}) {
  const { success, error: toastError } = useToast();

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
  const currentUserId = String(getId(currentUser) || "");
  const isAdmin = currentUser?.role === "admin";

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

      const res = await onUpdateTask(task._id || task.id, payload);
      setSubmitting(false);

      if (res?.success !== false) {
        success("Task updated successfully");
        setIsEditing(false);
        onClose();
      } else {
        toastError(res?.error || "Failed to update task");
      }
    } else if (canUpdateStatus) {
      // Member can only update status
      setSubmitting(true);
      const res = await onUpdateTask(task._id || task.id, { status });
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
    const res = await onDeleteTask(task._id || task.id);
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
      <div className="space-y-5 text-slate-800 dark:text-slate-200">
        {/* Workspace / Project Badge */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {project?.name || task.project?.name || "Workspace Task"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={status} size="sm" />
            <PriorityBadge priority={priority} size="sm" />
          </div>
        </div>

        {/* Task Form or View */}
        {isEditing && canManageAll ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14] px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Add additional context or requirements..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14] px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition resize-none shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="testing">Testing</option>
                  <option value="completed">Completed</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14] px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition disabled:opacity-50"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>{deleting ? "Deleting..." : "Delete Task"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                {task.title}
              </h3>
              {task.description ? (
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {task.description}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-400 italic">
                  No detailed description provided.
                </p>
              )}
            </div>

            {/* Overdue alert if applicable */}
            {isOverdue && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertTriangleIcon className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  This task is overdue! The due date was{" "}
                  {new Date(task.dueDate).toLocaleDateString()}.
                </span>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Assigned Members
                </span>
                {assignedUsers.length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AvatarGroup users={assignedUsers} size="sm" max={4} />
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
                      : "No deadline set"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Created By
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {task.createdBy?.name || task.createdBy?.email || "System"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Created Date
                </span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Update for Assignee */}
            {canUpdateStatus && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white block">Task Status</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {canManageAll
                      ? "Update current progress state"
                      : "You can update the progress of tasks assigned to you"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={submitting}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B0E14] px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                    <option value="done">Done</option>
                  </select>
                  {status !== task.status && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={submitting}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-xs disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Apply"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              {canManageAll ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Edit Task
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                    title="Delete task"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TaskDetailModal;
