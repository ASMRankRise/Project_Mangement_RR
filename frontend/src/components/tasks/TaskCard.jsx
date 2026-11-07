import { useState } from "react";
import { AvatarGroup } from "../common/Avatar";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import Icon from "../common/Icons";

export function TaskCard({ task, projects = [], user, onUpdate, onDelete }) {
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

  const isAssignedToMe =
    currentUserId !== "" &&
    assignedUsers.some((m) => String(getId(m) || "") === currentUserId);

  const projectId = getId(task.project);
  const project = projects.find(
    (item) => String(getId(item)) === String(projectId),
  );

  const projectOwnerId = String(getId(project?.owner) || "");
  const isProjectOwner =
    currentUserId !== "" && projectOwnerId === currentUserId;

  const canManageTask = isAdmin || isProjectOwner;
  const canUpdateStatus = canManageTask || isAssignedToMe;

  const handleStatusChange = async (newStatus) => {
    if (!onUpdate || updating || newStatus === task.status) return;
    setUpdating(true);
    try {
      await onUpdate(task._id || task.id, { status: newStatus });
    } catch (error) {
      console.error("Task status update failed:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
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

  const handleDelete = async () => {
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
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-4 backdrop-blur-md transition-all duration-200 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-950/20">
      <div>
        {/* Top Meta: Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={task.status} size="sm" />
            {canManageTask ? (
              <select
                aria-label="Change priority"
                value={task.priority || "low"}
                disabled={updating}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="rounded-full border border-white/10 bg-[#070a13] px-2 py-0.5 text-[11px] text-slate-300 outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <PriorityBadge priority={task.priority} size="sm" />
            )}
          </div>

          {canManageTask && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-300 transition opacity-80 group-hover:opacity-100 disabled:opacity-50"
              title="Delete task"
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Task Title */}
        <h4 className="mt-3 text-sm font-bold text-white group-hover:text-indigo-200 transition line-clamp-2">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Bottom Footer Meta */}
      <div className="mt-4 border-t border-white/5 pt-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Project Name & Due Date */}
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="truncate rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-white/5 max-w-[110px]"
              title={project?.name || task.project?.name}
            >
              {project?.name || task.project?.name || "Workspace"}
            </span>

            {formattedDueDate && (
              <span
                className={`flex items-center gap-1 text-[11px] font-medium ${
                  isOverdue ? "text-rose-400" : "text-slate-400"
                }`}
                title={`Due: ${formattedDueDate}`}
              >
                <Icon name="calendar" className="h-3 w-3" />
                <span>{formattedDueDate}</span>
              </span>
            )}
          </div>

          {/* Assignees */}
          <div className="shrink-0">
            <AvatarGroup users={assignedUsers} max={3} size="xs" />
          </div>
        </div>

        {/* Quick Inline Status Changer */}
        {canUpdateStatus && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase font-semibold text-slate-500">
              Move to:
            </span>
            <select
              value={task.status || "todo"}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-[#070a13] px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="testing">Testing</option>
              <option value="completed">Completed</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </div>
    </article>
  );
}

export default TaskCard;
