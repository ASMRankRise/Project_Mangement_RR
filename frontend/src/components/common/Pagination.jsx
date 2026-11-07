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
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={currentPage <= 1 || loading}
        onClick={() => handlePageChange(currentPage - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#070a13] text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <Icon name="chevronLeft" className="h-4 w-4" />
      </button>

      <span className="min-w-16 text-center text-xs font-semibold text-slate-300">
        {currentPage} / {lastPage}
      </span>

      <button
        type="button"
        disabled={currentPage >= lastPage || loading}
        onClick={() => handlePageChange(currentPage + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#070a13] text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <Icon name="chevronRight" className="h-4 w-4" />
      </button>
    </div>
  );
}

export default Pagination;
