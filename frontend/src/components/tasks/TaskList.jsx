import TaskCard from "./TaskCard";
import KanbanBoard from "./KanbanBoard";
import Pagination from "../common/Pagination";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import { AvatarGroup } from "../common/Avatar";
import { CheckSquareIcon, CalendarIcon, TrashIcon } from "../common/Icons";

export function TaskList({
  tasks = [],
  projects = [],
  user,
  page,
  totalPages = 1,
  total = 0,
  loading = false,
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
    <div className="space-y-3.5">
      {/* Loading state */}
      {loading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161B22] p-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <CheckSquareIcon className="h-5 w-5" />
          </div>
          <h3 className="mt-2.5 text-xs font-semibold text-slate-900 dark:text-white">No tasks found</h3>
          <p className="mt-1 max-w-sm text-[11px] text-slate-500 dark:text-slate-400">
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
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22]">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-3.5 py-2.5">Task</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5">Priority</th>
                <th className="px-3.5 py-2.5">Project</th>
                <th className="px-3.5 py-2.5">Assignees</th>
                <th className="px-3.5 py-2.5">Due Date</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="px-3.5 py-2.5 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <StatusBadge status={task.status} size="xs" />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <PriorityBadge priority={task.priority} size="xs" />
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400">
                      {proj?.name || task.project?.name || "Workspace"}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <AvatarGroup users={assignedUsers} size="xs" max={2} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] ${
                          isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete task "${task.title}"?`)) {
                              onDelete?.(task._id || task.id);
                            }
                          }}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete task"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing {tasks.length} of {total} tasks
          </span>
          <Pagination
            page={page}
            totalPages={totalPages}
            loading={loading}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default TaskList;
