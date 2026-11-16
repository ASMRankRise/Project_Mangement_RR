import TaskCard from "./TaskCard";
import KanbanBoard from "./KanbanBoard";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import { AvatarGroup } from "../common/Avatar";
import { CheckSquareIcon, CalendarIcon, TrashIcon } from "../common/Icons";
import Pagination from "../common/Pagination";

export function TaskList({
  tasks = [],
  projects = [],
  user,
  loading = false,
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 10,
  onPageChange,
  onUpdate,
  onDelete,
  onTaskClick,
  viewMode = "kanban",
}) {
  const getId = (v) => (typeof v === "object" && v !== null ? v._id || v.id : v);
  const currentUserId = String(getId(user) || "");
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {loading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <p className="mt-2.5 text-sm text-text-secondary">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface p-10 text-center shadow-subtle">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-subtle text-text-secondary">
            <CheckSquareIcon className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-text-primary">No tasks found</h3>
          <p className="mt-1 max-w-sm text-[13px] text-text-secondary">
            No tasks match your current filter parameters or search query.
          </p>
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          tasks={tasks}
          projects={projects}
          user={user}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClick={onTaskClick}
        />
      ) : viewMode === "table" ? (
        <div className={`overflow-x-auto rounded-lg border border-border bg-surface shadow-subtle transition-opacity duration-150 ${loading ? "opacity-60" : "opacity-100"}`}>
          <table className="w-full text-left text-sm text-text-primary">
            <thead className="border-b border-border bg-surface-subtle/70 text-[12px] font-semibold text-text-secondary">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Assignees</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {tasks.map((task) => {
                const pId = getId(task.project);
                const proj = projects.find((p) => String(getId(p)) === String(pId));
                const isProjectOwner = String(getId(proj?.owner) || "") === currentUserId;
                const canManage = isAdmin || isProjectOwner;

                const assignedUsers = Array.isArray(task.assignedTo)
                  ? task.assignedTo
                  : task.assignedTo
                  ? [task.assignedTo]
                  : [];

                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "completed" &&
                  task.status !== "done";

                const formattedDate = task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No deadline";

                return (
                  <tr
                    key={task._id || task.id}
                    onClick={() => onTaskClick && onTaskClick(task)}
                    className="hover:bg-surface-subtle/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} size="xs" />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.priority} size="xs" />
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-[13px]">
                      {proj?.name || task.project?.name || "Workspace"}
                    </td>
                    <td className="px-4 py-3">
                      <AvatarGroup users={assignedUsers} size="xs" max={2} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                          isOverdue
                            ? "text-accent font-semibold"
                            : "text-text-secondary"
                        }`}
                      >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete task "${task.title}"?`)) {
                              onDelete?.(task._id || task.id);
                            }
                          }}
                          className="rounded p-1 text-text-tertiary hover:text-[#991B1B] hover:bg-[#FEF2F2] dark:hover:bg-[#3B0D0D] dark:hover:text-[#F87171] transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              projects={projects}
              user={user}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onClick={onTaskClick}
            />
          ))}
        </div>
      )}

      {/* Pagination: rendered only for Table and Grid views when onPageChange is provided and tasks exist */}
      {(viewMode === "table" || viewMode === "list") && onPageChange && total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          loading={loading}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export default TaskList;
