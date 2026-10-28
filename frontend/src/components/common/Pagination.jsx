function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
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
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-slate-400">
        Page {currentPage} of {lastPage} · {total} task(s)
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={currentPage <= 1 || loading}
          onClick={() => handlePageChange(currentPage - 1)}
          className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={currentPage >= lastPage || loading}
          onClick={() => handlePageChange(currentPage + 1)}
          className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
