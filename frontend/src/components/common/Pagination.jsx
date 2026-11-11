import Icon from "./Icons";

export function Pagination({
  page = 1,
  totalPages = 1,
  loading = false,
  onPageChange,
}) {
  const currentPage = Math.max(1, page);
  const lastPage = Math.max(1, totalPages);

  const handlePageChange = (nextPage) => {
    if (loading || !onPageChange) return;
    if (nextPage < 1 || nextPage > lastPage) return;
    onPageChange(nextPage);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={currentPage <= 1 || loading}
        onClick={() => handlePageChange(currentPage - 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-750 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <Icon name="chevronLeft" className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-14 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
        {currentPage} / {lastPage}
      </span>

      <button
        type="button"
        disabled={currentPage >= lastPage || loading}
        onClick={() => handlePageChange(currentPage + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-750 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <Icon name="chevronRight" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default Pagination;
