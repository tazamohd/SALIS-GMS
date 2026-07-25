/**
 * Reusable pagination UI — "Showing X to Y of Z", per-page selector, page
 * numbers with ellipsis, prev/next, responsive (collapses to "page / total" on
 * mobile). Pairs with the `usePagination` hook.
 *
 *   <PaginationControls
 *     page={pg.pagination.page}
 *     totalPages={pg.pagination.totalPages}
 *     total={pg.pagination.total}
 *     limit={pg.pagination.limit}
 *     hasNext={pg.pagination.hasNext}
 *     hasPrev={pg.pagination.hasPrev}
 *     onPageChange={pg.setPage}
 *     onLimitChange={pg.setLimit}
 *   />
 *
 * Vetted from the platform audit fix package; Tailwind + dark-mode aware.
 */

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  total,
  limit,
  hasNext,
  hasPrev,
  onPageChange,
  onLimitChange,
}: PaginationControlsProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-pagination-summary">
        Showing <span className="font-medium text-gray-700 dark:text-gray-200">{startItem}</span> to{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">{endItem}</span> of{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">{total}</span> results
      </div>

      <div className="flex items-center gap-2">
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          data-testid="select-page-size"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          data-testid="button-prev-page"
        >
          Previous
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((pageNum, idx) =>
            pageNum === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  pageNum === page
                    ? "bg-blue-600 text-white font-medium"
                    : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                data-testid={`button-page-${pageNum}`}
              >
                {pageNum}
              </button>
            ),
          )}
        </div>

        <span className="sm:hidden text-sm text-gray-500">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          data-testid="button-next-page"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
