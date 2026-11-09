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
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {loading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-400">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <CheckSquareIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">No tasks found</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
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
          onTaskClick={onTaskClick}
        />
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0E131F]/90 backdrop-blur-sm">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Assignees</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tasks.map((task) => {
                const assignedUsers = Array.isArray(task.assignedTo)
                  ? task.assignedTo
                  : task.assignedTo
                  ? [task.assignedTo]
                  : [];
                const projectId = getId(task.project);
                const project = projects.find(
                  (p) => String(getId(p)) === String(projectId),
                );
                const projectOwnerId = String(getId(project?.owner) || "");
                const isProjectOwner =
                  currentUserId !== "" && projectOwnerId === currentUserId;
                const canManage = isAdmin || isProjectOwner;

                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "completed" &&
                  task.status !== "done";

                return (
                  <tr
                    key={task._id || task.id}
                    onClick={() => onTaskClick && onTaskClick(task)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="font-semibold text-white group-hover:text-indigo-300 transition truncate">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} size="sm" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-slate-300 font-medium truncate max-w-[120px] inline-block">
                        {project?.name || task.project?.name || "Workspace"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <AvatarGroup users={assignedUsers} size="xs" max={3} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {task.dueDate ? (
                        <span
                          className={`flex items-center gap-1 ${
                            isOverdue ? "text-rose-400 font-semibold" : "text-slate-400"
                          }`}
                        >
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => onDelete && onDelete(task._id || task.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                            title="Delete task"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{page}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong> ({total} total)
          </span>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default TaskList;
