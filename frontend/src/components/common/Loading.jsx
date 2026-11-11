export function Loading({ message = "Loading..." }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-900 dark:bg-[#0D1117] dark:text-slate-100 transition-colors"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {message}
        </p>
      </div>
    </div>
  );
}

export default Loading;
