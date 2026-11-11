import { useState } from "react";
import { AvatarGroup } from "../common/Avatar";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import {
  CalendarIcon,
  TrashIcon,
} from "../common/Icons";

export function TaskCard({
  task,
  projects = [],
  user,
  onUpdate,
  onDelete,
  onClick,
}) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === "admin";
  const getId = (v) =>
    typeof v === "object" && v !== null ? v._id || v.id : v;

  const currentUserId = String(getId(user) || "");

  const assignedUsers = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
    ? [task.assignedTo]
    : [];

  const projectId = getId(task.project);
  const project = projects.find(
    (item) => String(getId(item)) === String(projectId),
  );

  const projectOwnerId = String(getId(project?.owner) || "");
  const isProjectOwner =
    currentUserId !== "" && projectOwnerId === currentUserId;

  const canManageTask = isAdmin || isProjectOwner;

  const handlePriorityChange = async (e, newPriority) => {
    e.stopPropagation();
    if (!onUpdate || updating || newPriority === task.priority) return;
    setUpdating(true);
    try {
      await onUpdate(task._id || task.id, { priority: newPriority });
    } catch (error) {
      console.error("Task priority update failed:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!onDelete || deleting) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDelete(task._id || task.id);
    } catch (error) {
      console.error("Task deletion failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed" &&
    task.status !== "done";

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article
      onClick={() => onClick && onClick(task)}
      className="group relative flex flex-col justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] hover:bg-slate-50/70 dark:hover:bg-slate-800/50 p-3 shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer text-left"
    >
      <div>
        {/* Top Meta: Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={task.status} size="xs" />
            {canManageTask ? (
              <select
                aria-label="Change priority"
                value={task.priority || "low"}
                disabled={updating}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handlePriorityChange(e, e.target.value)}
                className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <PriorityBadge priority={task.priority} size="xs" />
            )}
          </div>

          {canManageTask && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
              title="Delete task"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Task Title */}
        <h4 className="mt-2 text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Bottom Footer Meta */}
      <div className="mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Project Name & Due Date */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="truncate rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 max-w-[95px]"
              title={project?.name || task.project?.name}
            >
              {project?.name || task.project?.name || "Workspace"}
            </span>

            {formattedDueDate && (
              <span
                className={`flex items-center gap-1 text-[10px] font-medium ${
                  isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-slate-500 dark:text-slate-400"
                }`}
                title={`Due: ${formattedDueDate}`}
              >
                <CalendarIcon className="h-3 w-3" />
                <span>{formattedDueDate}</span>
              </span>
            )}
          </div>

          {/* Assigned Avatars */}
          <div className="shrink-0">
            <AvatarGroup users={assignedUsers} max={2} size="xs" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
