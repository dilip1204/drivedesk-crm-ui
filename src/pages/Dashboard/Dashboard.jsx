import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";

import "./Dashboard.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../hooks/useAuth";


import { getDashboardSummary } from "../../store/dashboardSummary/actions";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { role } = useAuth();
  const isAdmin = String(role || "").toLowerCase() === "admin";
  
  const summary = useSelector((state) => state.dashboardSummary.dashboardSummary || {});
  const loader = useSelector((state) => state.dashboardSummary.dashboardSummaryLoader);
  const today = new Date();
  const currentYear = String(today.getFullYear());
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

  const [selectedMonth, setSelectedMonth] = useState(`${currentYear}-${currentMonth}`);
  const [selectedDate, setSelectedDate] = useState("");

  const { year, month } = useMemo(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split("-");
      return {
        year: y || currentYear,
        month: m || currentMonth,
      };
    }

    if (selectedMonth) {
      const [y, m] = selectedMonth.split("-");
      return {
        year: y || currentYear,
        month: m || currentMonth,
      };
    }

    return { year: currentYear, month: currentMonth };
  }, [selectedDate, selectedMonth, currentYear, currentMonth]);

  const fetchDashboardSummary = () => {
    const values = {
      year: year,
      month: month,
    };

    dispatch(getDashboardSummary(values));
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, [dispatch, year, month]);

  const formatValue = (value) => (typeof value === "number" ? value : 0);
  const registrationCount = formatValue(summary?.response?.registration_count);
  const processCompletedCount = formatValue(summary?.response?.process_completed_count);
  const processFailedCount = formatValue(summary?.response?.process_failed_count);
  const paymentPendingCount = formatValue(summary?.response?.payment_pending_count);
  const paymentCompletedCount = formatValue(summary?.response?.payment_completed_count);
  const paymentFailedCount = formatValue(summary?.response?.payment_failed_count);
  const total_outstanding_amount = formatValue(summary?.response?.total_outstanding_amount);
  const totalIncome = formatValue(summary?.response?.total_income);
  const totalExpense = formatValue(summary?.response?.total_expense);
  const netIncome = formatValue(summary?.response?.net_income);
  const paymentTotalCount = paymentPendingCount + paymentCompletedCount + paymentFailedCount;
  const processSuccessRate = registrationCount ? Math.round((processCompletedCount / registrationCount) * 100) : 0;
  const paymentSuccessRate = paymentTotalCount ? Math.round((paymentCompletedCount / paymentTotalCount) * 100) : 0;

  const formatReportDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const reportMonth = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}-${reportMonth}-${date.getFullYear()}`;
  };
  const expenseReportFromDate = formatReportDate(new Date(today.getFullYear(), today.getMonth(), 1));
  const expenseReportToDate = formatReportDate(today);

  return (
    <>
      <div
        className="header-fixed sidebar-fixed sidebar-dark header-light"
        id="body"
      >
        <div id="toaster"></div>
        <div className="wrapper">
          <Sidebar />
          <div className="page-wrapper">
            <Header />

            <div className="content-wrapper">
              <div className="content">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="mb-1">Dashboard Snapshot</h4>
                    <p className="text-muted mb-0">
                      Monthly summary for {month}/{year}.
                    </p>
                  </div>
                  <div className="d-flex align-items-center dashboard-filter-wrap">
                    {isAdmin && (
                      <>
                        <input
                          type="month"
                          className="form-control form-control-sm mr-2"
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setSelectedDate("");
                          }}
                          title="Filter by month"
                        />
                        <input
                          type="date"
                          className="form-control form-control-sm mr-2"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          title="Filter by date"
                        />
                      </>
                    )}

                    <div>
                      {loader ? (
                        <span className="badge badge-pill badge-info">Loading...</span>
                      ) : (
                        <span className="badge badge-pill badge-success">
                          Updated for {month}/{year}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-3 col-sm-6">
                    <Link to={`/students?month=${month}&year=${year}`}>
                      <div className="card card-mini mb-4 border-primary">
                        <div className="card-body">
                          <h2 className="mb-1 text-primary">{registrationCount}</h2>
                          <p className="mb-2">Monthly New Registrations</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge badge-primary">Admissions</span>
                            <span className="text-muted small">Current month</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-xl-3 col-sm-6">
                    <div className="card card-mini mb-4 border-success">
                      <div className="card-body">
                        <h2 className="mb-1 text-success">{processCompletedCount}</h2>
                        <p className="mb-2">Process Completed</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge badge-success">Healthy</span>
                          <span className="text-muted small">Compared to registrations</span>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="col-xl-3 col-sm-6">
                    <div className="card card-mini mb-4 border-warning">
                      <div className="card-body">
                        <h2 className="mb-1 text-warning">{paymentPendingCount}</h2>
                        <p className="mb-2">Pending Students</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge badge-warning">Pending</span>
                          <span className="text-muted small">Students with balance due</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-sm-6">
                    <div className="card card-mini mb-4 border-success">
                      <div className="card-body">
                        <h2 className="mb-1 text-success">{paymentCompletedCount}</h2>
                        <p className="mb-2">Payment Completed</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge badge-success">Collected</span>
                          <span className="text-muted small">Revenue secured</span>
                        </div>
                      </div>
                    </div>
                  </div>

                 
                  <div className="col-xl-3 col-sm-6">
                    <Link to={`/outstandingfees`}>
                      <div className="card card-mini mb-4 border-primary">
                        <div className="card-body">
                          <h2 className="mb-1 text-primary">&#8377;{total_outstanding_amount}</h2>
                          <p className="mb-2">Outstanding Amount</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge badge-primary">OUTSTANDING</span>
                            <span className="text-muted small">Overall pending collection</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {isAdmin && (
                    <>
                      <div className="col-xl-3 col-sm-6">
                        <div className="card card-mini mb-4 border-info">
                          <div className="card-body">
                            <h2 className="mb-1 text-info">&#8377;{totalIncome}</h2>
                            <p className="mb-2">Total Income</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="badge badge-info">INCOME</span>
                              <span className="text-muted small">Filtered by month/date</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-sm-6">
                        <Link to={`/expense-report?from_date=${expenseReportFromDate}&to_date=${expenseReportToDate}`}>
                          <div className="card card-mini mb-4 border-danger">
                            <div className="card-body">
                              <h2 className="mb-1 text-danger">&#8377;{totalExpense}</h2>
                              <p className="mb-2">Total Expense</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="badge badge-danger">EXPENSE</span>
                                <span className="text-muted small">View current month report</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>

                      <div className="col-xl-3 col-sm-6">
                        <div className="card card-mini mb-4 border-success">
                          <div className="card-body">
                            <h2 className="mb-1 text-success">&#8377;{netIncome}</h2>
                            <p className="mb-2">Net Income</p>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="badge badge-success">NET</span>
                              <span className="text-muted small">Income - Expense</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                

                <div className="row">
                  <div className="col-12">
                    <div className="card mb-4">
                      <div className="card-body">
                        <h5 className="card-title">Dashboard insights</h5>
                        <p className="card-text text-muted mb-0">
                          The current summary now focuses on business outcomes: admissions,
                          process health, and payment performance. Use this view to identify
                          where action is needed and which areas are tracking well.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
