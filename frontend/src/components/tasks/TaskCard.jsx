import { useState } from "react";
import { AvatarGroup } from "../common/Avatar";
import { PriorityBadge } from "../common/Badge";
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

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
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
      className="group relative flex flex-col justify-between rounded-lg border border-border bg-surface hover:bg-surface-subtle/50 p-3.5 shadow-subtle transition-colors hover:border-brand/40 cursor-pointer text-left"
    >
      <div>
        {/* Top Header: Compact Inline Priority + Delete Action (Status pill removed per column context) */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center">
            {canManageTask ? (
              <select
                aria-label="Change priority"
                value={task.priority || "low"}
                disabled={updating}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handlePriorityChange(e, e.target.value)}
                className="h-6 rounded border border-border bg-surface-subtle px-2 text-[12px] font-medium text-text-secondary outline-none focus:border-brand cursor-pointer disabled:opacity-50 transition-colors"
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
              className="rounded p-1 text-text-tertiary hover:bg-[#FEF2F2] hover:text-[#991B1B] dark:hover:bg-[#3B0D0D] dark:hover:text-[#F87171] transition opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
              title="Delete task"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Task Title */}
        <h4 className="mt-2 text-sm font-semibold text-text-primary group-hover:text-brand transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-1 text-[13px] text-text-secondary line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Bottom Footer Meta: Project Chip & Due Date stay on one line */}
      <div className="mt-3 border-t border-border-subtle pt-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Project Name (with ellipsis) & Due Date on single line */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="truncate rounded-md bg-surface-subtle px-2 py-0.5 text-[12px] font-medium text-text-secondary border border-border max-w-[125px]"
              title={project?.name || task.project?.name}
            >
              {project?.name || task.project?.name || "Workspace"}
            </span>

            {formattedDueDate && (
              <span
                className={`flex items-center gap-1 text-[12px] font-medium shrink-0 ${
                  isOverdue
                    ? "text-accent font-semibold"
                    : "text-text-tertiary"
                }`}
                title={`Due: ${formattedDueDate}`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
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
