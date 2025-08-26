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

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push("…");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages - 1) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  const [goto, setGoto] = React.useState("");
  const go = () => {
    const n = Number(goto);
    if (!Number.isNaN(n) && n >= 1 && n <= totalPages) {
      onPageChange(n);
      setGoto("");
    }
  };

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 my-3">
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div className="text-muted small">
          Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{totalCount || 0}</strong>
        </div>

        <div className="d-flex align-items-center gap-2" style={{marginLeft:"20px"}}>
          <label htmlFor="rows-per-page" className="mb-0 small text-muted">Rows per page</label>
          <select
            id="rows-per-page"
            className="form-select form-select-sm"
            style={{ width: 90 }}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <nav aria-label="Students pagination" className="custom-pagination">
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(1)} aria-label="First page">«</button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(Math.max(1, currentPage - 1))} aria-label="Previous page">‹</button>
          </li>
          {getPages().map((p, i) =>
            p === "…" ? (
              <li key={`dots-${i}`} className="page-item disabled"><span className="page-link">…</span></li>
            ) : (
              <li key={p} className={`page-item ${currentPage === p ? "active" : ""}`}>
                <button className="page-link" onClick={() => onPageChange(p)} aria-current={currentPage === p ? "page" : undefined} aria-label={`Page ${p}`}>
                  {p}
                </button>
              </li>
            )
          )}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} aria-label="Next page">›</button>
          </li>
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPageChange(totalPages)} aria-label="Last page">»</button>
          </li>
        </ul>
      </nav>

      {/* <div className="d-flex align-items-center gap-2">
        <label htmlFor="goto-page" className="mb-0 small text-muted">Go to</label>
        <input
          id="goto-page"
          type="number"
          min={1}
          max={totalPages}
          value={goto}
          onChange={(e) => setGoto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          className="form-control form-control-sm"
          style={{ width: 90 }}
          aria-label="Go to page"
        />
        <button className="btn btn-sm btn-outline-secondary" onClick={go}>Go</button>
      </div> */}
    </div>
  );
}
