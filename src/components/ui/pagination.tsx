"use client";

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
};

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  function getPageNumbers() {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
      {/* Items count & Per Page Selector */}
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold font-mono-nums text-foreground" style={{ color: "var(--foreground)" }}>{startItem}</span> to{" "}
          <span className="font-semibold font-mono-nums text-foreground" style={{ color: "var(--foreground)" }}>{endItem}</span> of{" "}
          <span className="font-semibold font-mono-nums text-foreground" style={{ color: "var(--foreground)" }}>{totalItems}</span> items
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          <label htmlFor="page-size-select" className="text-xs">
            Rows:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded-md border text-xs outline-none cursor-pointer"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              color: "var(--foreground)",
            }}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-raised"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, idx) => (
            typeof page === "number" ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(page)}
                className="w-8 h-8 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                style={{
                  background: page === currentPage ? "var(--accent)" : "var(--surface)",
                  color: page === currentPage ? "#ffffff" : "var(--foreground)",
                  border: page === currentPage ? "none" : "1px solid var(--border)",
                }}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-1 text-xs opacity-60">
                ...
              </span>
            )
          ))}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-raised"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
