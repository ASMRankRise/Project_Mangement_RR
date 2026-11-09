import { StatusBadge, PriorityBadge } from "../common/Badge";
import { CalendarIcon, AlertTriangleIcon, CheckCircleIcon } from "../common/Icons";

export function UpcomingDeadlines({ tasks = [], onTaskClick }) {
  // Filter active tasks that have a dueDate
  const activeTasksWithDueDate = tasks
    .filter(
      (t) =>
        t.dueDate &&
        t.status !== "completed" &&
        t.status !== "done"
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const topDeadlines = activeTasksWithDueDate.slice(0, 6);

  const getDaysDiff = (dateStr) => {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Upcoming Deadlines</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Active milestones requiring prompt attention
          </p>
        </div>
        <span className="rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
          {activeTasksWithDueDate.length} upcoming
        </span>
      </div>

      {topDeadlines.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <CheckCircleIcon className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
          No upcoming deadlines. All active work is on schedule!
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {topDeadlines.map((task) => {
            const daysDiff = getDaysDiff(task.dueDate);
            const isOverdue = daysDiff < 0;
            const isToday = daysDiff === 0;

            return (
              <div
                key={task._id || task.id}
                onClick={() => onTaskClick && onTaskClick(task)}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                      {task.title}
                    </span>
                    <PriorityBadge priority={task.priority} size="xs" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="truncate max-w-[120px]">
                      {task.project?.name || "Workspace"}
                    </span>
                    <span>•</span>
                    <StatusBadge status={task.status} size="xs" />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                      isOverdue
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30"
                        : isToday
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
                        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {isOverdue && <AlertTriangleIcon className="w-3 h-3 text-rose-500" />}
                    {isOverdue
                      ? `${Math.abs(daysDiff)}d overdue`
                      : isToday
                      ? "Due today"
                      : `${daysDiff}d left`}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UpcomingDeadlines;
