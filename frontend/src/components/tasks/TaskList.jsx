import TaskCard from "./TaskCard";
import KanbanBoard from "./KanbanBoard";
import Pagination from "../common/Pagination";
import Icon from "../common/Icons";

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
  viewMode = "kanban",
}) {
  return (
    <div className="space-y-4">
      {/* Loading state */}
      {loading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-400">Loading task pipeline...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Icon name="tasks" className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">No tasks match criteria</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            No work items match your current filter parameters or search query.
          </p>
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          tasks={tasks}
          projects={projects}
          user={user}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
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
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-slate-400">
            Showing page <strong className="text-white">{page}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong> ({total} total tasks)
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
