import React from "react";

export default function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
}) {
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 1)));
  const pageSizeId = React.useId();

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const pages = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) pages.push("ellipsis-left");
    for (let page = left; page <= right; page += 1) pages.push(page);
    if (right < totalPages - 1) pages.push("ellipsis-right");
    pages.push(totalPages);

    return pages;
  };

  const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between students-pagination-bar">
      <div className="d-flex flex-wrap align-items-center students-pagination-summary">
        <div className="students-results-count">
          Showing <strong>{start}–{end}</strong> of <strong>{totalCount || 0}</strong>
        </div>

        <div className="d-flex align-items-center students-page-size-control">
          <label htmlFor={pageSizeId}>Rows per page</label>
          <select
            id={pageSizeId}
            className="form-select form-select-sm students-page-size-select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <nav aria-label="Results pagination" className="custom-pagination">
        <ul className="pagination mb-0">
          <li className={`page-item ${isFirstPage ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(1)}
              aria-label="First page"
              disabled={isFirstPage}
            >
              <span className="mdi mdi-page-first" aria-hidden="true"></span>
            </button>
          </li>
          <li className={`page-item ${isFirstPage ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              aria-label="Previous page"
              disabled={isFirstPage}
            >
              <span className="mdi mdi-chevron-left" aria-hidden="true"></span>
            </button>
          </li>

          {getPages().map((page) =>
            typeof page === "string" ? (
              <li key={page} className="page-item disabled" aria-hidden="true">
                <span className="page-link students-pagination-ellipsis">…</span>
              </li>
            ) : (
              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                <button
                  type="button"
                  className="page-link"
                  onClick={() => onPageChange(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              </li>
            )
          )}

          <li className={`page-item ${isLastPage ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              aria-label="Next page"
              disabled={isLastPage}
            >
              <span className="mdi mdi-chevron-right" aria-hidden="true"></span>
            </button>
          </li>
          <li className={`page-item ${isLastPage ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onPageChange(totalPages)}
              aria-label="Last page"
              disabled={isLastPage}
            >
              <span className="mdi mdi-page-last" aria-hidden="true"></span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
