import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";
import "../Students/Students.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Pagination from "../Students/Pagenation";
import { getStudentsFilterListInformation } from "../../store/students/actions";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";

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

  const printReport = () => {
    const content = reportTableRef.current?.outerHTML || "<p>No data</p>";
    const printWindow = window.open("", "", "width=1100,height=800");
    if (!printWindow) return;
    const [year, month] = appliedMonth.split("-");

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Income Report</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#212529;}
            h2,p{text-align:center;margin:0 0 10px;}
            table{width:100%;border-collapse:collapse;font-size:12px;}
            th,td{border:1px solid #333;padding:7px;text-align:center;}
            thead th{background:#f2f2f2;}
          </style>
        </head>
        <body>
          <h2>Income Report</h2>
          <p>${month}/${year}</p>
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
              <div className="row mb-4">
                <div className="breadcrumb-wrapper col-xl-6">
                  <h1>Income Report</h1>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb p-0">
                      <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                      <li className="breadcrumb-item" aria-current="page">Income Report</li>
                    </ol>
                  </nav>
                </div>
                <div className="col-xl-6 text-right">
                  <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-primary" onClick={printReport} disabled={loading || !!error || students.length === 0}>
                    <i className="bi bi-printer"></i> Print
                  </button>
                  <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <form className="row align-items-end" onSubmit={applyMonth}>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="income-report-month">Month</label>
                      <input id="income-report-month" type="month" className="form-control" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <button type="submit" className="btn btn-primary" disabled={loading}>View Report</button>
                    </div>
                  </form>
                </div>
              </div>

              {!loading && !error && (
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <div className="card border-info h-100"><div className="card-body"><div className="text-muted">Current Month Income</div><h3 className="text-info mb-0">₹{currentPageIncome.toLocaleString("en-IN")}</h3></div></div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card border-primary h-100"><div className="card-body"><div className="text-muted">Total Student Records</div><h3 className="text-primary mb-0">{totalCount}</h3></div></div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-body">
                  {loading ? (
                    <p className="text-center my-5">Loading income report...</p>
                  ) : error ? (
                    <p className="text-center text-danger my-5">{error}</p>
                  ) : (
                    <div className="table-responsive">
                      <table ref={reportTableRef} className="table custom-table text-center align-middle">
                        <thead className="table-light">
                          <tr><th>S.NO</th><th>Date</th><th>Name</th><th>Mobile Number</th><th>Plan</th><th>Paid Amount</th></tr>
                        </thead>
                        <tbody>
                          {students.map((student, index) => (
                            <tr key={student?.id || student?.mobile_number || index}>
                              <td>{(currentPage - 1) * pageSize + index + 1}</td>
                              <td>{formatDateDDMMYYYY(student?.registered_date)}</td>
                              <td>{student?.name || "-"}</td>
                              <td>{student?.mobile_number || "-"}</td>
                              <td>{student?.plan || "-"}</td>
                              <td>₹{getPaymentsTotal(student).toLocaleString("en-IN")}</td>
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

export default IncomeReport;
