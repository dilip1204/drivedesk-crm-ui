import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../Students/Students.css";
import "../../assets/css/reportPages.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Pagination from "../Students/Pagenation";
import { getExpenseSummaryService } from "../../services/functional";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import { useAuth } from "../../hooks/useAuth";
import AddFleetExpenses from "./addFleetExpenses";
import DeleteConfirmation from "../../components/deleteConfirmation/deleteConfirmation";
import { deleteExpenses } from "../../store/expenses/actions";

const pad = (value) => String(value).padStart(2, "0");

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
};

const truncateText = (value, maxLength = 15) => {
  const text = (value || "-").toString();
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const ExpenseReport = () => {
  const dispatch = useDispatch();
  const { role } = useAuth();
  const isAdmin = String(role || "").toLowerCase() === "admin";
  const reportTableRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMonth = `${searchParams.get("year") || ""}-${pad(searchParams.get("month") || "")}`;
  const initialMonth = /^\d{4}-\d{2}$/.test(queryMonth) ? queryMonth : getCurrentMonth();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [appliedMonth, setAppliedMonth] = useState(initialMonth);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [year, month] = appliedMonth.split("-");
      const response = await getExpenseSummaryService.getExpenseSummary({
        month,
        year,
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      });
      const responseData = response?.data?.response || {};
      const reportRows = Array.isArray(responseData.expenses) ? responseData.expenses : [];
      setRows(reportRows);
      setTotalCount(Number(responseData.total) || 0);
      if (reportRows.length === 0) setError("No expense report data found for this month.");
    } catch (requestError) {
      setRows([]);
      setTotalCount(0);
      setError(requestError?.response?.data?.detail || "Unable to load the expense report.");
    } finally {
      setLoading(false);
    }
  }, [appliedMonth, currentPage, pageSize]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row?.amount) || 0), 0),
    [rows]
  );

  const applyFilters = (event) => {
    event.preventDefault();
    if (!selectedMonth) return;
    const [year, month] = selectedMonth.split("-");
    setSearchParams({ month, year });
    setCurrentPage(1);
    setAppliedMonth(selectedMonth);
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
            .no-print{display:none;}
          </style>
        </head>
        <body>
          <h2>Expense Report</h2>
          <p>${appliedMonth.split("-").reverse().join("/")}</p>
          ${content}
          <script>window.onload=function(){window.print();window.close();}</script>
        </body>
      </html>`);
    printWindow.document.close();
  };

  const openExpenseModal = (expense, viewOnly) => {
    setSelectedExpense(expense);
    setIsEdit(!viewOnly);
    setIsView(viewOnly);
    setShowExpenseModal(true);
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setSelectedExpense(null);
    setIsEdit(false);
    setIsView(false);
  };

  const handleExpenseUpdated = (response) => {
    if (response?.isError) {
      toast.error("Expense update failed.");
      return;
    }
    toast.success("Expense updated successfully.");
    closeExpenseModal();
    fetchReport();
  };

  const confirmDelete = (id) => {
    dispatch(deleteExpenses({ id }, (response) => {
      setShowDeleteModal(false);
      setSelectedExpenseId(null);
      if (response?.isError) {
        toast.error("Delete failed.");
        return;
      }
      toast.success("Expense deleted successfully.");
      if (rows.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        fetchReport();
      }
    }));
  };

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light students-page report-page expense-report-page" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />
          <div className="content-wrapper">
            <div className="content">
              <div className="row students-page-heading report-page-heading">
                <div className="breadcrumb-wrapper col-xl-6">
                  <h1>Expense Report</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item">
                        <Link to="/dashboard" className="students-breadcrumb-home" aria-label="Dashboard">
                          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                            <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                          </svg>
                        </Link>
                      </li>
                      <li className="breadcrumb-item">Dashboard</li>
                      <li className="breadcrumb-item" aria-current="page">Expense Report</li>
                    </ol>
                  </nav>
                </div>
                <div className="col-xl-6 text-right students-page-actions report-page-actions">
                  {isAdmin && (
                    <button type="button" className="btn btn-outline-primary" onClick={printReport} disabled={loading || !!error || rows.length === 0}>
                      <i className="bi bi-printer" aria-hidden="true" /> Print Report
                    </button>
                  )}
                  <Link to="/dashboard" className="btn btn-secondary">
                    <i className="bi bi-arrow-left" aria-hidden="true" /> Dashboard
                  </Link>
                </div>
              </div>

              <section className="report-filter-card" aria-label="Expense report filters">
                <div className="report-filter-copy">
                  <strong>Report period</strong>
                  <span>Select a month to view expense records.</span>
                </div>
                <form className="report-filter-form" onSubmit={applyFilters}>
                  <div className="report-filter-field">
                    <label htmlFor="expense-report-month">Month</label>
                    <input id="expense-report-month" type="month" className="form-control" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    <i className="bi bi-funnel" aria-hidden="true" /> View Report
                  </button>
                </form>
              </section>

              <div className="report-summary-grid">
                <article className="report-summary-card is-money">
                  <span className="report-summary-icon" aria-hidden="true"><i className="bi bi-currency-rupee" /></span>
                  <div className="report-summary-content">
                    <span>Current page expenses</span>
                    <strong>{"\u20B9"}{totalAmount.toLocaleString("en-IN")}</strong>
                  </div>
                </article>
                <article className="report-summary-card">
                  <span className="report-summary-icon" aria-hidden="true"><i className="bi bi-receipt" /></span>
                  <div className="report-summary-content">
                    <span>Total expense records</span>
                    <strong>{totalCount}</strong>
                  </div>
                </article>
              </div>

              <section className="report-list-card">
                <div className="report-list-header">
                  <div className="report-list-heading">
                    <strong>Expense records</strong>
                    <span>Expenses for {appliedMonth.split("-").reverse().join("/")}</span>
                  </div>
                  <span className="report-result-badge">{totalCount} record{totalCount === 1 ? "" : "s"}</span>
                </div>
                {loading ? (
                  <div className="report-state">
                    <span className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
                    <span>Loading expense report...</span>
                  </div>
                ) : error ? (
                  <div className="report-state">
                    <i className="bi bi-receipt" aria-hidden="true" />
                    <strong>No expense records</strong>
                    <span>{error}</span>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive students-table-wrap report-table-wrap">
                      <table ref={reportTableRef} className="table custom-table align-middle students-table report-table">
                        <thead className="table-light">
                          <tr>
                            <th>S.NO</th><th>Date</th><th>Expense Type</th><th>Category</th>
                            <th>Amount</th><th>Notes</th><th>Created By</th><th className="no-print">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, index) => (
                            <tr key={row?.id || index}>
                              <td data-label="S.No">{(currentPage - 1) * pageSize + index + 1}</td>
                              <td data-label="Date">{formatDateDDMMYYYY(row?.date)}</td>
                              <td data-label="Expense Type">{row?.type || "-"}</td>
                              <td data-label="Category">{row?.category || "-"}</td>
                              <td data-label="Amount" className="report-amount">{"\u20B9"}{Number(row?.amount || 0).toLocaleString("en-IN")}</td>
                              <td data-label="Notes">{row?.notes || "-"}</td>
                              <td data-label="Created By" title={row?.created_by || "-"}>{truncateText(row?.created_by)}</td>
                              <td data-label="Actions" className="no-print students-row-actions report-row-actions">
                                <button type="button" className="btn btn-sm btn-warning students-action-icon" onClick={() => openExpenseModal(row, false)} title="Edit Expense" data-tooltip="Edit Expense" aria-label="Edit Expense"><i className="bi bi-pencil-square" aria-hidden="true" /><span className="students-action-label">Edit</span></button>
                                <button type="button" className="btn btn-sm btn-primary students-action-icon" onClick={() => openExpenseModal(row, true)} title="View Expense" data-tooltip="View Expense" aria-label="View Expense"><i className="bi bi-eye" aria-hidden="true" /><span className="students-action-label">View</span></button>
                                <button type="button" className="btn btn-sm btn-danger students-action-icon" onClick={() => { setSelectedExpenseId(row.id); setShowDeleteModal(true); }} title="Delete Expense" data-tooltip="Delete Expense" aria-label="Delete Expense"><i className="bi bi-trash" aria-hidden="true" /><span className="students-action-label">Delete</span></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="report-pagination">
                      <Pagination
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                      />
                    </div>
                  </>
                )}
              </section>
            </div>
          </div>
          <AddFleetExpenses
            showModal={showExpenseModal}
            hideModal={closeExpenseModal}
            expense={selectedExpense}
            isEdit={isEdit}
            viewOnly={isView}
            onExpensesAdded={() => {}}
            expensesData={handleExpenseUpdated}
          />
          <DeleteConfirmation
            showDeleteModal={showDeleteModal}
            hideDeleteModal={() => { setShowDeleteModal(false); setSelectedExpenseId(null); }}
            confirmModal={confirmDelete}
            id={selectedExpenseId}
            message="Are you sure you want to delete this expense?"
          />
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeButton={false} closeOnClick pauseOnHover />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ExpenseReport;
