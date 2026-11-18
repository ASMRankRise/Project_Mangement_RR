import { useState } from "react";
import { AvatarGroup } from "../common/Avatar";
import {
  CalendarIcon,
  TrashIcon,
} from "../common/Icons";
import { useAuth } from "../../context/AuthContext";
import { getEntityId, getTaskPermissions } from "../../utils/taskPermissions";
import TaskStatusDropdown from "./TaskStatusDropdown";
import TaskPriorityDropdown from "./TaskPriorityDropdown";

export function TaskCard({
  task,
  projects = [],
  user,
  onUpdate,
  onDelete,
  onClick,
}) {
  const [deleting, setDeleting] = useState(false);

  const { user: authUser } = useAuth();
  const effectiveUser = user || authUser;

  const projectId = getEntityId(task.project);
  const project = projects.find(
    (item) => getEntityId(item) === String(projectId),
  );

  const {
    canView,
    canChangeStatus,
    canChangePriority,
    canDeleteTask,
  } = getTaskPermissions(task, project, effectiveUser);


  const assignedUsers = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
      ? [task.assignedTo]
      : [];

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
      onClick={() => {
        if (canView && onClick) {
          onClick(task);
        }
      }}
      className={`group relative flex flex-col justify-between rounded-lg border border-border bg-surface p-3.5 shadow-subtle transition-colors ${canView
        ? "hover:bg-surface-subtle/50 hover:border-brand/40 cursor-pointer"
        : "opacity-85 cursor-default"
        } text-left`}
    >
      <div>
        {/* Top Header: Inline Status & Priority Dropdowns + Delete Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <TaskStatusDropdown
              status={task.status}
              canEdit={canChangeStatus}
              onUpdate={(newStatus) =>
                onUpdate?.(task._id || task.id, { status: newStatus })
              }
              size="xs"
            />
            <TaskPriorityDropdown
              priority={task.priority}
              canEdit={canChangePriority}
              onUpdate={(newPriority) =>
                onUpdate?.(task._id || task.id, { priority: newPriority })
              }
              size="xs"
            />
          </div>

          {canDeleteTask && (
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
                className={`flex items-center gap-1 text-[12px] font-medium shrink-0 ${isOverdue
                  ? "text-accent font-semibold"
                  : "text-text-secondary"
                  }`}
              >
                <CalendarIcon className="h-3 w-3" />
                <span>{formattedDueDate}</span>
              </span>
            )}
          </div>

          {/* Assigned Members Avatars */}
          {assignedUsers.length > 0 && (
            <div className="shrink-0">
              <AvatarGroup users={assignedUsers} size="xs" max={2} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
