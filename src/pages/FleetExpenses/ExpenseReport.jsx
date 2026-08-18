import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="header-fixed sidebar-fixed sidebar-dark header-light" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />
          <div className="content-wrapper">
            <div className="content">
              <div className="row mb-4 report-page-heading">
                <div className="breadcrumb-wrapper col-xl-6">
                  <h1>Expense Report</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                      <li className="breadcrumb-item" aria-current="page">Expense Report</li>
                    </ol>
                  </nav>
                </div>
                <div className="col-xl-6 text-right report-page-actions">
                  <div className="d-flex justify-content-end gap-2">
                  {isAdmin && (
                    <button type="button" className="btn btn-outline-primary" onClick={printReport} disabled={loading || !!error || rows.length === 0}>
                      <i className="bi bi-printer"></i> Print
                    </button>
                  )}
                  <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <form className="row align-items-end" onSubmit={applyFilters}>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="expense-report-month">Month</label>
                      <input id="expense-report-month" type="month" className="form-control" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <button type="submit" className="btn btn-primary" disabled={loading}>View Report</button>
                    </div>
                  </form>
                </div>
              </div>

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
                            <th>Amount</th><th>Notes</th><th>Created By</th><th className="no-print">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, index) => (
                            <tr key={row?.id || index}>
                              <td>{(currentPage - 1) * pageSize + index + 1}</td>
                              <td>{formatDateDDMMYYYY(row?.date)}</td>
                              <td>{row?.type || "-"}</td>
                              <td>{row?.category || "-"}</td>
                              <td>₹{Number(row?.amount || 0).toLocaleString("en-IN")}</td>
                              <td>{row?.notes || "-"}</td>
                              <td title={row?.created_by || "-"}>{truncateText(row?.created_by)}</td>
                              <td className="no-print text-nowrap">
                                <button className="btn btn-sm btn-warning me-2" onClick={() => openExpenseModal(row, false)}>Edit</button>
                                <button className="btn btn-sm btn-primary me-2" onClick={() => openExpenseModal(row, true)}>View</button>
                                <button className="btn btn-sm btn-danger" onClick={() => { setSelectedExpenseId(row.id); setShowDeleteModal(true); }}>Delete</button>
                              </td>
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
