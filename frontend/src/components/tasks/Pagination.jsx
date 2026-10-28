function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  loading = false,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return <p className="mt-4 text-sm text-slate-400">Total tasks: {total}</p>;
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-400">
        Page {page} of {totalPages} · Total tasks: {total}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || page <= 1}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || page >= totalPages}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
