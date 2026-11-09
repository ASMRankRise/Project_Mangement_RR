import { KanbanIcon } from "../common/Icons";

export function TaskDistribution({ taskStats = {} }) {
  const byStatus = taskStats.byStatus || {};
  const byPriority = taskStats.byPriority || {};

  const statusConfig = [
    { key: "todo", label: "To Do", color: "bg-slate-400 dark:bg-slate-500", text: "text-slate-500 dark:text-slate-400" },
    { key: "in-progress", label: "In Progress", color: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
    { key: "testing", label: "Testing", color: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
    { key: "completed", label: "Completed", color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    { key: "done", label: "Done", color: "bg-teal-500", text: "text-teal-600 dark:text-teal-400" },
  ];

  const priorityConfig = [
    { key: "low", label: "Low Priority", color: "bg-slate-400" },
    { key: "medium", label: "Medium Priority", color: "bg-amber-500" },
    { key: "high", label: "High Priority", color: "bg-rose-500" },
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Status Breakdown */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KanbanIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Status Distribution</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Live status breakdown across accessible projects
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Completion</span>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </p>
          </div>
        </div>

        {/* Progress Bar Stack */}
        <div className="mt-4">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            {statusConfig.map((item) => {
              const count = byStatus[item.key] || 0;
              const pct = totalStatusTasks > 0 ? (count / totalStatusTasks) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={item.key}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${count} (${Math.round(pct)}%)`}
                  className={`${item.color} transition-all duration-300 hover:opacity-85`}
                />
              );
            })}
          </div>

          {/* Status Breakdown Legend & Counts */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {statusConfig.map((item) => {
              const count = byStatus[item.key] || 0;
              const pct = totalStatusTasks > 0 ? Math.round((count / totalStatusTasks) * 100) : 0;
              return (
                <div
                  key={item.key}
                  className="rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 p-2"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
                    <span className="text-[10px] text-slate-400">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Priority Urgency Matrix
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Workload distribution by urgency
            </p>
          </div>
          <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {totalStatusTasks} Tasks
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          {priorityConfig.map((p) => {
            const count = byPriority[p.key] || 0;
            const pct = totalStatusTasks > 0 ? Math.round((count / totalStatusTasks) * 100) : 0;
            return (
              <div key={p.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${p.color}`} />
                    {p.label}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {count}{" "}
                    <span className="text-slate-400 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full ${p.color} transition-all duration-300`}
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
