import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Pagination from "../Students/Pagenation";
import { getExpenseSummaryService } from "../../services/functional";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import { useAuth } from "../../hooks/useAuth";

const pad = (value) => String(value).padStart(2, "0");

const toApiDate = (inputDate) => {
  const [year, month, day] = (inputDate || "").split("-");
  return year && month && day ? `${day}-${month}-${year}` : "";
};

const toInputDate = (apiDate) => {
  const [day, month, year] = (apiDate || "").split("-");
  return year && month && day ? `${year}-${month}-${day}` : "";
};

const getDefaultRange = () => {
  const today = new Date();
  return {
    fromDate: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`,
    toDate: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
  };
};

const ExpenseReport = () => {
  const { role } = useAuth();
  const isAdmin = String(role || "").toLowerCase() === "admin";
  const reportTableRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = getDefaultRange();
  const [fromDate, setFromDate] = useState(
    toInputDate(searchParams.get("from_date")) || defaults.fromDate
  );
  const [toDate, setToDate] = useState(
    toInputDate(searchParams.get("to_date")) || defaults.toDate
  );
  const [appliedRange, setAppliedRange] = useState({
    fromDate: toInputDate(searchParams.get("from_date")) || defaults.fromDate,
    toDate: toInputDate(searchParams.get("to_date")) || defaults.toDate,
  });
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchReport = useCallback(async () => {
    if (!appliedRange.fromDate || !appliedRange.toDate) {
      setError("From date and To date are required.");
      setRows([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    if (appliedRange.fromDate > appliedRange.toDate) {
      setError("From date cannot be after To date.");
      setRows([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getExpenseSummaryService.getExpenseSummary({
        fromDate: toApiDate(appliedRange.fromDate),
        toDate: toApiDate(appliedRange.toDate),
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      });
      const responseData = response?.data?.response || {};
      const reportRows = Array.isArray(responseData.expenses) ? responseData.expenses : [];
      setRows(reportRows);
      setTotalCount(Number(responseData.total) || 0);
      if (reportRows.length === 0) setError("No expense report data found for this date range.");
    } catch (requestError) {
      setRows([]);
      setTotalCount(0);
      setError(requestError?.response?.data?.detail || "Unable to load the expense report.");
    } finally {
      setLoading(false);
    }
  }, [appliedRange, currentPage, pageSize]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row?.amount) || 0), 0),
    [rows]
  );

  const applyFilters = (event) => {
    event.preventDefault();
    if (!fromDate || !toDate) {
      setError("From date and To date are required.");
      return;
    }
    if (fromDate > toDate) {
      setError("From date cannot be after To date.");
      return;
    }
    setSearchParams({ from_date: toApiDate(fromDate), to_date: toApiDate(toDate) });
    setCurrentPage(1);
    setAppliedRange({ fromDate, toDate });
  };

  const printReport = () => {
    const content = reportTableRef.current?.outerHTML || "<p>No data</p>";
    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Expense Report</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#212529;}
            h2,p{text-align:center;margin:0 0 10px;}
            table{width:100%;border-collapse:collapse;font-size:11px;}
            th,td{border:1px solid #333;padding:6px;text-align:center;}
            thead th{background:#f2f2f2;}
          </style>
        </head>
        <body>
          <h2>Expense Report</h2>
          <p>${formatDateDDMMYYYY(appliedRange.fromDate)} to ${formatDateDDMMYYYY(appliedRange.toDate)}</p>
          ${content}
          <script>window.onload=function(){window.print();window.close();}</script>
        </body>
      </html>`);
    printWindow.document.close();
  };

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />
          <div className="content-wrapper">
            <div className="content">
              <div className="d-flex flex-wrap justify-content-between align-items-start mb-4">
                <div>
                  <h1>Expense Report</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                      <li className="breadcrumb-item" aria-current="page">Expense Report</li>
                    </ol>
                  </nav>
                </div>
                <div className="d-flex gap-2">
                  {isAdmin && (
                    <button type="button" className="btn btn-outline-primary" onClick={printReport} disabled={loading || !!error || rows.length === 0}>
                      <i className="bi bi-printer"></i> Print
                    </button>
                  )}
                  <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <form className="row align-items-end" onSubmit={applyFilters}>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="expense-report-from">From Date</label>
                      <input id="expense-report-from" type="date" className="form-control" value={fromDate} onChange={(event) => setFromDate(event.target.value)} required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="expense-report-to">To Date</label>
                      <input id="expense-report-to" type="date" className="form-control" value={toDate} onChange={(event) => setToDate(event.target.value)} required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <button type="submit" className="btn btn-primary" disabled={loading}>View Report</button>
                    </div>
                  </form>
                </div>
              </div>

              {!loading && !error && (
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <div className="card border-danger h-100"><div className="card-body"><div className="text-muted">Current Page Total</div><h3 className="text-danger mb-0">₹{totalAmount.toLocaleString("en-IN")}</h3></div></div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card border-primary h-100"><div className="card-body"><div className="text-muted">Total Expense Records</div><h3 className="text-primary mb-0">{totalCount}</h3></div></div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-body">
                  {loading ? (
                    <p className="text-center my-5">Loading expense report...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <div className="table-responsive">
                      <table ref={reportTableRef} className="table custom-table text-center align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>S.NO</th><th>Date</th><th>Expense Type</th><th>Category</th>
                            <th>Employee</th><th>Vehicle</th><th>Amount</th><th>Notes</th>
                            <th>Odometer</th><th>Stationary</th><th>Created By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, index) => (
                            <tr key={row?.id || index}>
                              <td>{(currentPage - 1) * pageSize + index + 1}</td>
                              <td>{formatDateDDMMYYYY(row?.date)}</td>
                              <td>{row?.type || "-"}</td>
                              <td>{row?.category || "-"}</td>
                              <td>{row?.employee_name || "-"}</td>
                              <td>{row?.vehicle_id || "-"}</td>
                              <td>₹{Number(row?.amount || 0).toLocaleString("en-IN")}</td>
                              <td>{row?.notes || "-"}</td>
                              <td>{row?.odo_meter || "-"}</td>
                              <td>{row?.stationary || "-"}</td>
                              <td>{row?.created_by || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Pagination
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ExpenseReport;
