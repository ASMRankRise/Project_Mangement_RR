import TaskCard from "./TaskCard";

export function KanbanBoard({
  tasks = [],
  projects = [],
  user,
  onUpdate,
  onDelete,
  onClick,
}) {
  const columns = [
    {
      id: "todo",
      title: "To Do",
      dot: "bg-slate-400 dark:bg-slate-500",
    },
    {
      id: "in-progress",
      title: "In Progress",
      dot: "bg-blue-500",
    },
    {
      id: "testing",
      title: "Testing",
      dot: "bg-purple-500",
    },
    {
      id: "completed",
      title: "Completed",
      dot: "bg-emerald-500",
    },
    {
      id: "done",
      title: "Done",
      dot: "bg-teal-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 overflow-x-auto pb-3 md:grid-cols-3 xl:grid-cols-5 min-w-full">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => (t.status || "todo") === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#12161F] p-2 min-w-[240px]"
          >
            {/* Column Header */}
            <div className="mb-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 px-1">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {col.title}
                </h4>
              </div>
              <span className="rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                {colTasks.length}
              </span>
            </div>

            {/* Tasks Container */}
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto max-h-[600px] p-0.5">
              {colTasks.length === 0 ? (
                <div className="py-6 text-center text-[11px] text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800/80 rounded my-1">
                  No tasks
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    projects={projects}
                    user={user}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onClick={onClick}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
