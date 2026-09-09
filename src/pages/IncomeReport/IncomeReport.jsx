import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../Students/Students.css";
import "../../assets/css/reportPages.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import Pagination from "../Students/Pagenation";
import { getStudentsFilterListInformation } from "../../store/students/actions";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import {
  getAdminPrintHeader,
  getAdminPrintWatermark,
} from "../../utils/printBranding";
import { ensureTenantLogo } from "../../hooks/useTenantLogo";

const pad = (value) => String(value).padStart(2, "0");

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
};

const getPaymentsTotal = (student) =>
  (Array.isArray(student?.payments) ? student.payments : []).reduce(
    (sum, payment) => sum + (Number(payment?.amount) || 0),
    0
  );

const IncomeReport = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = `${searchParams.get("year") || ""}-${pad(searchParams.get("month") || "")}`;
  const validInitialMonth = /^\d{4}-\d{2}$/.test(initialMonth) ? initialMonth : getCurrentMonth();
  const [selectedMonth, setSelectedMonth] = useState(validInitialMonth);
  const [appliedMonth, setAppliedMonth] = useState(validInitialMonth);
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reportTableRef = useRef(null);

  const fetchIncomeReport = useCallback(() => {
    const [year, month] = appliedMonth.split("-");
    setLoading(true);
    setError("");

    dispatch(getStudentsFilterListInformation({
      month,
      year,
      skip: (currentPage - 1) * pageSize,
      limit: pageSize,
    }, (response) => {
      const responseData = response?.response || {};
      const reportStudents = Array.isArray(responseData.students) ? responseData.students : [];
      setStudents(reportStudents);
      setTotalCount(Number(responseData.total) || 0);
      setLoading(false);
      if (response?.isError || response instanceof Error) {
        setError("Unable to load the income report.");
      } else if (reportStudents.length === 0) {
        setError("No income records found for this month.");
      }
    }));
  }, [appliedMonth, currentPage, dispatch, pageSize]);

  useEffect(() => {
    fetchIncomeReport();
  }, [fetchIncomeReport]);

  const currentPageIncome = useMemo(
    () => students.reduce((sum, student) => sum + getPaymentsTotal(student), 0),
    [students]
  );

  const applyMonth = (event) => {
    event.preventDefault();
    if (!selectedMonth) return;
    const [year, month] = selectedMonth.split("-");
    setSearchParams({ month, year });
    setCurrentPage(1);
    setAppliedMonth(selectedMonth);
  };

  const printReport = async () => {
    const content = reportTableRef.current?.outerHTML || "<p>No data</p>";
    const printWindow = window.open("", "", "width=1100,height=800");
    if (!printWindow) return;
    const [year, month] = appliedMonth.split("-");
    const tenantLogo = await ensureTenantLogo(dispatch);

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Income Report</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#212529;}
            .report{position:relative;z-index:1;}
            .report-header{display:grid;grid-template-columns:112px minmax(0,1fr) 112px;min-height:86px;align-items:center;margin-bottom:14px;border-bottom:2px solid #1f4e78;}
            .report-header-copy{align-self:center;text-align:center;}
            .report-header-spacer{width:112px;}
            h2,p{text-align:center;margin:0 0 10px;}
            table{width:100%;border-collapse:collapse;font-size:12px;}
            th,td{border:1px solid #333;padding:7px;text-align:center;}
            thead th{background:#f2f2f2;}
          </style>
        </head>
        <body>
          ${getAdminPrintWatermark(tenantLogo)}
          <main class="report">
            <header class="report-header">
              ${getAdminPrintHeader(tenantLogo)}
              <div class="report-header-copy">
                <h2>Income Report</h2>
                <p>${month}/${year}</p>
              </div>
              <span class="report-header-spacer" aria-hidden="true"></span>
            </header>
            ${content}
          </main>
          <script>window.onload=function(){window.print();window.close();}</script>
        </body>
      </html>`);
    printWindow.document.close();
  };

  return (
    <div className="header-fixed sidebar-fixed sidebar-dark header-light students-page report-page income-report-page" id="body">
      <div className="wrapper">
        <Sidebar />
        <div className="page-wrapper">
          <Header />
          <div className="content-wrapper">
            <div className="content">
              <div className="row students-page-heading report-page-heading">
                <div className="breadcrumb-wrapper col-xl-6">
                  <h1>Income Report</h1>
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
                      <li className="breadcrumb-item" aria-current="page">Income Report</li>
                    </ol>
                  </nav>
                </div>
                <div className="col-xl-6 text-right students-page-actions report-page-actions">
                  <button type="button" className="btn btn-outline-primary" onClick={printReport} disabled={loading || !!error || students.length === 0}>
                    <i className="bi bi-printer" aria-hidden="true" /> Print Report
                  </button>
                  <Link to="/dashboard" className="btn btn-secondary">
                    <i className="bi bi-arrow-left" aria-hidden="true" /> Dashboard
                  </Link>
                </div>
              </div>

              <section className="report-filter-card" aria-label="Income report filters">
                <div className="report-filter-copy">
                  <strong>Report period</strong>
                  <span>Select a month to view income records.</span>
                </div>
                <form className="report-filter-form" onSubmit={applyMonth}>
                  <div className="report-filter-field">
                    <label htmlFor="income-report-month">Month</label>
                    <input id="income-report-month" type="month" className="form-control" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} required />
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
                    <span>Current page income</span>
                    <strong>{"\u20B9"}{currentPageIncome.toLocaleString("en-IN")}</strong>
                  </div>
                </article>
                <article className="report-summary-card">
                  <span className="report-summary-icon" aria-hidden="true"><i className="bi bi-people" /></span>
                  <div className="report-summary-content">
                    <span>Total student records</span>
                    <strong>{totalCount}</strong>
                  </div>
                </article>
              </div>

              <section className="report-list-card">
                <div className="report-list-header">
                  <div className="report-list-heading">
                    <strong>Income records</strong>
                    <span>Payments for {appliedMonth.split("-").reverse().join("/")}</span>
                  </div>
                  <span className="report-result-badge">{totalCount} record{totalCount === 1 ? "" : "s"}</span>
                </div>
                {loading ? (
                  <LoadingState label="Loading income report" />
                ) : error ? (
                  <EmptyState
                    icon={error.startsWith("Unable") ? "bi bi-exclamation-circle" : "bi bi-receipt"}
                    title={error.startsWith("Unable") ? "Unable to load income report" : "No income records found"}
                    description={error}
                    variant={error.startsWith("Unable") ? "error" : "default"}
                  />
                ) : (
                  <>
                    <div className="table-responsive students-table-wrap report-table-wrap">
                      <table ref={reportTableRef} className="table custom-table align-middle students-table report-table">
                        <thead className="table-light">
                          <tr><th>S.NO</th><th>Date</th><th>Name</th><th>Mobile Number</th><th>Plan</th><th>Paid Amount</th></tr>
                        </thead>
                        <tbody>
                          {students.map((student, index) => (
                            <tr key={student?.id || student?.mobile_number || index}>
                              <td data-label="S.No">{(currentPage - 1) * pageSize + index + 1}</td>
                              <td data-label="Date">{formatDateDDMMYYYY(student?.registered_date)}</td>
                              <td data-label="Name">{student?.name || "-"}</td>
                              <td data-label="Mobile Number">{student?.mobile_number || "-"}</td>
                              <td data-label="Plan">{student?.plan || "-"}</td>
                              <td data-label="Paid Amount" className="report-amount">{"\u20B9"}{getPaymentsTotal(student).toLocaleString("en-IN")}</td>
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
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default IncomeReport;
