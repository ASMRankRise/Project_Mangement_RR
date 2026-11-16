import TaskCard from "./TaskCard";

export function KanbanBoard({
  tasks = [],
  projects = [],
  user,
  onUpdate,
  onDelete,
  onClick,
}) {
  // Columns in sentence case with token-based status styling
  const columns = [
    {
      id: "todo",
      title: "To do",
      dot: "bg-[#78716C] dark:bg-[#A8A29E]",
      countBadge: "bg-surface text-text-secondary border-border",
    },
    {
      id: "in-progress",
      title: "In progress",
      dot: "bg-brand",
      countBadge: "bg-brand/10 text-brand border border-brand/30",
    },
    {
      id: "testing",
      title: "Testing",
      dot: "bg-[#D97706] dark:bg-[#F59E0B]",
      countBadge: "bg-[#FFF4EC] text-[#9A3412] border border-[#FBD6BA] dark:bg-[#341708] dark:text-[#FB923C] dark:border-[#5C2A10]",
    },
    {
      id: "completed",
      title: "Completed",
      dot: "bg-done",
      countBadge: "bg-done-bg text-done border border-done-border",
    },
    {
      id: "done",
      title: "Done",
      dot: "bg-done",
      countBadge: "bg-done-bg text-done border border-done-border",
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* Scrollable board track with fixed column widths so cards never spill */}
      <div className="flex gap-4 items-start min-w-max">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => (t.status || "todo") === col.id);

          return (
            <div
              key={col.id}
              className="w-[310px] min-w-[310px] shrink-0 flex flex-col rounded-lg border border-border bg-surface-subtle/40 p-3 shadow-subtle text-left"
            >
              {/* Column Header: Sentence case, dot, count next to name */}
              <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5 px-0.5">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <h4 className="text-sm font-semibold text-text-primary">
                    {col.title}
                  </h4>
                  <span
                    className={`rounded-md px-1.5 py-0.2 text-[12px] font-mono font-medium border ${col.countBadge}`}
                  >
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks Container */}
              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto max-h-[640px] pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-text-tertiary border border-dashed border-border rounded-md my-1 bg-surface/30">
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
    </div>
  );
}

export default KanbanBoard;
