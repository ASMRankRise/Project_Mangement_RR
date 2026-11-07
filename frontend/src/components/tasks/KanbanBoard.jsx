import TaskCard from "./TaskCard";

export function KanbanBoard({
  tasks = [],
  projects = [],
  user,
  onUpdate,
  onDelete,
}) {
  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "border-slate-500/30 bg-slate-500/10 text-slate-300",
      dot: "bg-slate-400",
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "border-sky-500/30 bg-sky-500/10 text-sky-300",
      dot: "bg-sky-400",
    },
    {
      id: "testing",
      title: "Testing",
      color: "border-purple-500/30 bg-purple-500/10 text-purple-300",
      dot: "bg-purple-400",
    },
    {
      id: "completed",
      title: "Completed",
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      dot: "bg-emerald-400",
    },
    {
      id: "done",
      title: "Done",
      color: "border-teal-500/30 bg-teal-500/10 text-teal-300",
      dot: "bg-teal-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-3 xl:grid-cols-5 min-w-full">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => (t.status || "todo") === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl border border-white/5 bg-[#090d16]/60 p-3 backdrop-blur-sm min-w-[260px]"
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
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
            <div className="flex-1 space-y-3 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-white/5 p-4 text-center">
                  <p className="text-[11px] text-slate-500">No tasks in {col.title}</p>
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
