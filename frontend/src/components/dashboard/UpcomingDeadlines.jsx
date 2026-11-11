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
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] p-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-2.5">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Upcoming Deadlines</span>
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            Active milestones requiring prompt attention
          </p>
        </div>
        <span className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
          {activeTasksWithDueDate.length} upcoming
        </span>
      </div>

      {topDeadlines.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <CheckCircleIcon className="w-5 h-5 text-emerald-500 mx-auto mb-1.5 opacity-80" />
          No upcoming deadlines. All active work is on schedule!
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topDeadlines.map((task) => {
            const daysDiff = getDaysDiff(task.dueDate);
            const isOverdue = daysDiff < 0;
            const isToday = daysDiff === 0;

            return (
              <div
                key={task._id || task.id}
                onClick={() => onTaskClick && onTaskClick(task)}
                className="py-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-2 -mx-2 transition cursor-pointer group"
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
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[10px] font-medium border ${
                      isOverdue
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-semibold"
                        : isToday
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 font-semibold"
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
