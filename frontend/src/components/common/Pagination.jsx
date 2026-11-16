import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

function getPageItems(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 10,
  loading = false,
  onPageChange,
}) {
  const currentPage = Math.max(1, page);
  const lastPage = Math.max(1, totalPages);

  const handlePageChange = (nextPage) => {
    if (loading || !onPageChange) return;
    if (nextPage < 1 || nextPage > lastPage || nextPage === currentPage) return;
    onPageChange(nextPage);
  };

  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);
  const summaryText =
    total === 0
      ? "No tasks"
      : `Showing ${start}-${end} of ${total} ${total === 1 ? "task" : "tasks"}`;

  const pageItems = getPageItems(currentPage, lastPage);

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-border sm:flex-row sm:items-center sm:justify-between text-left">
      {/* Summary line */}
      <div className="text-[13px] text-text-secondary font-medium">
        {summaryText}
      </div>

      {/* Pagination controls */}
      <nav
        aria-label="Pagination Navigation"
        className="flex flex-wrap items-center justify-center sm:justify-end gap-1"
      >
        {/* Previous button */}
        <button
          type="button"
          disabled={currentPage <= 1 || loading}
          onClick={() => handlePageChange(currentPage - 1)}
          className="flex h-9 items-center gap-1 rounded-[6px] border border-border bg-surface px-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="hidden xs:inline">Previous</span>
        </button>

        {/* Page numbers */}
        {pageItems.map((item, index) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 min-w-9 select-none items-center justify-center px-1 text-[13px] text-text-tertiary"
              >
                ...
              </span>
            );
          }

          const isCurrent = item === currentPage;

          return (
            <button
              key={item}
              type="button"
              disabled={loading}
              onClick={() => handlePageChange(item)}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-[6px] px-2 text-[13px] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                isCurrent
                  ? "bg-brand text-brand-text font-semibold shadow-subtle"
                  : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          disabled={currentPage >= lastPage || loading}
          onClick={() => handlePageChange(currentPage + 1)}
          className="flex h-9 items-center gap-1 rounded-[6px] border border-border bg-surface px-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Next page"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
