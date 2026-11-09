import TaskCard from "./TaskCard";

export function KanbanBoard({
  tasks = [],
  projects = [],
  user,
  onUpdate,
  onDelete,
  onTaskClick,
}) {
  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      dot: "bg-slate-400 dark:bg-slate-500",
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "border-sky-300 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300",
      dot: "bg-sky-500",
    },
    {
      id: "testing",
      title: "Testing",
      color: "border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300",
      dot: "bg-purple-500",
    },
    {
      id: "completed",
      title: "Completed",
      color: "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    {
      id: "done",
      title: "Done",
      color: "border-teal-300 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300",
      dot: "bg-teal-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 overflow-x-auto pb-4 md:grid-cols-3 xl:grid-cols-5 min-w-full">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => (t.status || "todo") === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-[#0A0E1A] p-2.5 min-w-[250px]"
          >
            {/* Column Header */}
            <div className="mb-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {col.title}
                </h4>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${col.color}`}
              >
                {colTasks.length}
              </span>
            </div>

            {/* Task Card Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="flex h-28 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">No tasks in {col.title}</p>
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
                    onClick={onTaskClick}
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
