import { KanbanIcon } from "../common/Icons";

export function TaskDistribution({ taskStats = {} }) {
  const byStatus = taskStats.byStatus || {};
  const byPriority = taskStats.byPriority || {};

  // Status configuration using approved design tokens:
  // To Do (stone), In Progress (brand pine), Testing (amber), Completed/Done (deep green)
  const statusConfig = [
    { key: "todo", label: "To Do", color: "bg-[#78716C] dark:bg-[#A8A29E]", text: "text-text-secondary" },
    { key: "in-progress", label: "In Progress", color: "bg-brand", text: "text-brand" },
    { key: "testing", label: "Testing", color: "bg-[#D97706] dark:bg-[#F59E0B]", text: "text-[#B45309] dark:text-[#FBBF24]" },
    { key: "completed", label: "Completed", color: "bg-done", text: "text-done" },
    { key: "done", label: "Done", color: "bg-done", text: "text-done" },
  ];

  // Priority configuration using approved design tokens:
  // Low (stone), Medium (amber), High (rust accent)
  const priorityConfig = [
    { key: "low", label: "Low", color: "bg-[#78716C] dark:bg-[#A8A29E]" },
    { key: "medium", label: "Medium", color: "bg-[#D97706] dark:bg-[#F59E0B]" },
    { key: "high", label: "High", color: "bg-accent" },
  ];

  const totalStatusTasks = statusConfig.reduce(
    (acc, item) => acc + (byStatus[item.key] || 0),
    0,
  );

  const completedCount = (byStatus.completed || 0) + (byStatus.done || 0);

  const completionRate =
    totalStatusTasks > 0
      ? Math.round((completedCount / totalStatusTasks) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Status Breakdown */}
      <div className="rounded-lg border border-border bg-surface p-4 text-left shadow-subtle">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <KanbanIcon className="h-4 w-4 text-text-secondary" />
              <span>Status Distribution</span>
            </h3>
            <p className="mt-0.5 text-[12px] text-text-secondary">
              Breakdown across accessible projects
            </p>
          </div>
          <div className="text-right">
            <span className="text-[12px] uppercase font-semibold text-text-tertiary">
              Completion
            </span>
            <p className="text-base font-bold text-done">
              {completionRate}%
            </p>
          </div>
        </div>

        {/* Progress Bar Stack */}
        <div className="mt-3.5">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-subtle">
            {statusConfig.map((item) => {
              const count = byStatus[item.key] || 0;
              const pct = totalStatusTasks > 0 ? (count / totalStatusTasks) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={item.key}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${count} (${Math.round(pct)}%)`}
                  className={`${item.color}`}
                />
              );
            })}
          </div>

          {/* Status Breakdown Legend & Counts */}
          <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {statusConfig.map((item) => {
              const count = byStatus[item.key] || 0;
              const pct = totalStatusTasks > 0 ? Math.round((count / totalStatusTasks) * 100) : 0;
              return (
                <div
                  key={item.key}
                  className="rounded-md border border-border bg-surface-subtle/60 p-2.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-[12px] font-medium text-text-secondary truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-text-primary">{count}</span>
                    <span className="text-[12px] text-text-tertiary">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="rounded-lg border border-border bg-surface p-4 text-left shadow-subtle">
        <div className="border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-text-primary">
            Priority
          </h3>
          <p className="mt-0.5 text-[12px] text-text-secondary">
            Workload distribution by urgency
          </p>
        </div>

        <div className="mt-3.5 space-y-3">
          {priorityConfig.map((item) => {
            const count = byPriority[item.key] || 0;
            const total = (byPriority.low || 0) + (byPriority.medium || 0) + (byPriority.high || 0);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="font-medium text-text-secondary text-[13px]">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-semibold text-text-primary text-[13px]">
                    {count} <span className="font-normal text-text-tertiary">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TaskDistribution;
