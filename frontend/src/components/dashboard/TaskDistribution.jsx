import Icon from "../common/Icons";

export function TaskDistribution({ taskStats = {} }) {
  const byStatus = taskStats.byStatus || {};
  const byPriority = taskStats.byPriority || {};

  const statusConfig = [
    { key: "todo", label: "To Do", color: "bg-slate-500", text: "text-slate-400" },
    { key: "in-progress", label: "In Progress", color: "bg-sky-500", text: "text-sky-400" },
    { key: "testing", label: "Testing", color: "bg-purple-500", text: "text-purple-400" },
    { key: "completed", label: "Completed", color: "bg-emerald-500", text: "text-emerald-400" },
    { key: "done", label: "Done", color: "bg-teal-400", text: "text-teal-300" },
  ];

  const priorityConfig = [
    { key: "low", label: "Low Priority", color: "bg-slate-400" },
    { key: "medium", label: "Medium Priority", color: "bg-amber-400" },
    { key: "high", label: "High Priority", color: "bg-rose-500" },
  ];

  const totalStatusTasks = statusConfig.reduce(
    (acc, item) => acc + (byStatus[item.key] || 0),
    0,
  );

  const completedCount =
    (byStatus.completed || 0) + (byStatus.done || 0);

  const completionRate =
    totalStatusTasks > 0
      ? Math.round((completedCount / totalStatusTasks) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Status Breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Icon name="kanban" className="h-4 w-4 text-indigo-400" />
              Task Pipeline Distribution
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Live status breakdown across accessible projects
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Completion</span>
            <p className="text-lg font-extrabold text-emerald-400">
              {completionRate}%
            </p>
          </div>
        </div>

        {/* Progress Bar Stack */}
        <div className="mt-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
            {statusConfig.map((item) => {
              const count = byStatus[item.key] || 0;
              const pct = totalStatusTasks > 0 ? (count / totalStatusTasks) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={item.key}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${count} (${Math.round(pct)}%)`}
                  className={`${item.color} transition-all duration-500 hover:opacity-80`}
                />
              );
            })}
          </div>

          {/* Status Breakdown Legend & Counts */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statusConfig.map((item) => {
              const count = byStatus[item.key] || 0;
              const pct = totalStatusTasks > 0 ? Math.round((count / totalStatusTasks) * 100) : 0;
              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-white/5 bg-black/20 p-2.5 transition hover:bg-black/30"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {item.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-bold text-white">{count}</span>
                    <span className="text-[11px] text-slate-500">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Icon name="flag" className="h-4 w-4 text-amber-400" />
              Priority Severity Matrix
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Workload urgency breakdown
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
            {totalStatusTasks} Tasks
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {priorityConfig.map((p) => {
            const count = byPriority[p.key] || 0;
            const pct = totalStatusTasks > 0 ? Math.round((count / totalStatusTasks) * 100) : 0;
            return (
              <div key={p.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${p.color}`} />
                    {p.label}
                  </span>
                  <span className="font-semibold text-white">
                    {count}{" "}
                    <span className="text-slate-500 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full ${p.color} transition-all duration-500`}
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
