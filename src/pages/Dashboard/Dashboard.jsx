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
  const processFailedCount = formatValue(summary?.response?.process_failed_count);
  const paymentPendingCount = formatValue(summary?.response?.payment_pending_count);
  const paymentCompletedCount = formatValue(summary?.response?.payment_completed_count);
  const paymentFailedCount = formatValue(summary?.response?.payment_failed_count);
  const total_outstanding_amount = formatValue(summary?.response?.total_outstanding_amount);
  const totalIncome = formatValue(summary?.response?.total_income);
  const totalExpense = formatValue(summary?.response?.total_expense);
  const netIncome = formatValue(summary?.response?.net_income);
  const paymentTotalCount = paymentPendingCount + paymentCompletedCount + paymentFailedCount;
  const paymentSuccessRate = paymentTotalCount ? Math.round((paymentCompletedCount / paymentTotalCount) * 100) : 0;
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
  const clampPercentage = (value) => Math.min(100, Math.max(0, value));

  const dashboardCards = [
    {
      key: "registrations",
      label: "New registrations",
      value: registrationCount,
      icon: "mdi-account-plus-outline",
      tone: "primary",
      status: "This month",
      detail: "View students",
      to: `/students?month=${month}&year=${year}`,
    },
    {
      key: "process-completed",
      label: "Process completed",
      value: processCompletedCount,
      icon: "mdi-check-circle-outline",
      tone: "success",
      status: `${processSuccessRate}% completion rate`,
      detail: "View students",
      to: "/students",
    },
    {
      key: "pending-students",
      label: "Pending students",
      value: paymentPendingCount,
      icon: "mdi-clock-outline",
      tone: "warning",
      status: "Balance requires attention",
      detail: "Review outstanding",
      to: "/outstandingfees",
    },
    {
      key: "payments-completed",
      label: "Payments completed",
      value: paymentCompletedCount,
      icon: "mdi-cash-multiple",
      tone: "success",
      status: `${paymentSuccessRate}% collection rate`,
      detail: "View students",
      to: "/students",
    },
    {
      key: "outstanding",
      label: "Outstanding amount",
      value: formatCurrency(total_outstanding_amount),
      icon: "mdi-cash-refund",
      tone: "warning",
      status: "Overall pending collection",
      detail: "View outstanding fees",
      to: "/outstandingfees",
    },
    ...(isAdmin
      ? [
          {
            key: "income",
            label: "Total income",
            value: formatCurrency(totalIncome),
            icon: "mdi-trending-up",
            tone: "primary",
            status: "For selected period",
            detail: "Income summary",
          },
          {
            key: "expense",
            label: "Total expense",
            value: formatCurrency(totalExpense),
            icon: "mdi-trending-down",
            tone: "danger",
            status: "For selected period",
            detail: "View expenses",
            to: "/fleetexpenses",
          },
          {
            key: "net-income",
            label: "Net income",
            value: formatCurrency(netIncome),
            icon: "mdi-chart-line",
            tone: netIncome < 0 ? "danger" : "success",
            status: "Income minus expenses",
            detail: "Current result",
          },
        ]
      : []),
  ];

  return (
    <>
      <div
        className="header-fixed sidebar-fixed sidebar-dark header-light dashboard-page"
        id="body"
      >
        <div id="toaster"></div>
        <div className="wrapper">
          <Sidebar />
          <div className="page-wrapper">
            <Header />

            <div className="content-wrapper">
              <div className="content" aria-busy={loader}>
                <div className="dashboard-heading">
                  <div className="dashboard-heading-copy">
                    <h1>Dashboard</h1>
                    <nav aria-label="breadcrumb">
                      <ol className="breadcrumb p-0">
                        <li className="breadcrumb-item">
                          <span className="dashboard-breadcrumb-home" aria-hidden="true">
                            <svg viewBox="0 0 16 16" focusable="false">
                              <path d="M8 1.25 1.5 6.7v8.05h4.2V9.9h4.6v4.85h4.2V6.7L8 1.25Z" />
                            </svg>
                          </span>
                        </li>
                        <li className="breadcrumb-item">Dashboard</li>
                        <li className="breadcrumb-item" aria-current="page">Overview</li>
                      </ol>
                    </nav>
                  </div>

                  <div className={`dashboard-update-status ${loader ? "is-loading" : ""}`}>
                    <span className="dashboard-update-dot" aria-hidden="true" />
                    {loader ? "Updating dashboard..." : `Updated for ${month}/${year}`}
                  </div>
                </div>

                <section className="dashboard-period-panel" aria-label="Dashboard period">
                  <div>
                    <strong>Monthly snapshot</strong>
                    <span>Business performance for {month}/{year}</span>
                  </div>
                  {isAdmin && (
                    <div className="dashboard-filter-wrap">
                      <label>
                        <span>Month</span>
                        <input
                          type="month"
                          className="form-control"
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setSelectedDate("");
                          }}
                          title="Filter by month"
                        />
                      </label>
                      <label>
                        <span>Date</span>
                        <input
                          type="date"
                          className="form-control"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          title="Filter by date"
                        />
                      </label>
                    </div>
                  )}
                </section>

                <section className="dashboard-kpi-grid" aria-label="Dashboard summary">
                  {dashboardCards.map((card) => (
                    <article className={`dashboard-kpi-card tone-${card.tone}`} key={card.key}>
                      <div className="dashboard-kpi-topline">
                        <span className="dashboard-kpi-label">{card.label}</span>
                        <span className="dashboard-kpi-icon" aria-hidden="true">
                          <i className={`mdi ${card.icon}`} />
                        </span>
                      </div>
                      <strong className="dashboard-kpi-value">{card.value}</strong>
                      <span className="dashboard-kpi-status">{card.status}</span>
                      <div className="dashboard-kpi-footer">
                        {card.to ? (
                          <Link to={card.to}>
                            {card.detail}
                            <i className="mdi mdi-arrow-right" aria-hidden="true" />
                          </Link>
                        ) : (
                          <span>{card.detail}</span>
                        )}
                      </div>
                    </article>
                  ))}
                </section>

                <div className="dashboard-detail-grid">
                  <section className="dashboard-panel" aria-labelledby="dashboard-health-title">
                    <div className="dashboard-panel-header">
                      <div>
                        <h2 id="dashboard-health-title">Operational health</h2>
                        <p>Completion and collection performance for this period.</p>
                      </div>
                    </div>

                    <div className="dashboard-health-list">
                      <div className="dashboard-health-item">
                        <div className="dashboard-health-heading">
                          <span>Process completion</span>
                          <strong>{processSuccessRate}%</strong>
                        </div>
                        <div className="dashboard-progress" aria-label={`Process completion ${processSuccessRate}%`}>
                          <span style={{ width: `${clampPercentage(processSuccessRate)}%` }} />
                        </div>
                        <small>{processCompletedCount} completed from {registrationCount} registrations</small>
                      </div>

                      <div className="dashboard-health-item">
                        <div className="dashboard-health-heading">
                          <span>Payment collection</span>
                          <strong>{paymentSuccessRate}%</strong>
                        </div>
                        <div className="dashboard-progress is-success" aria-label={`Payment collection ${paymentSuccessRate}%`}>
                          <span style={{ width: `${clampPercentage(paymentSuccessRate)}%` }} />
                        </div>
                        <small>{paymentCompletedCount} completed from {paymentTotalCount} payment records</small>
                      </div>
                    </div>

                    <div className="dashboard-health-stats">
                      <div>
                        <span>Process failed</span>
                        <strong>{processFailedCount}</strong>
                      </div>
                      <div>
                        <span>Payment failed</span>
                        <strong>{paymentFailedCount}</strong>
                      </div>
                      <div>
                        <span>Payment pending</span>
                        <strong>{paymentPendingCount}</strong>
                      </div>
                    </div>
                  </section>

                  <section className="dashboard-panel dashboard-quick-panel" aria-labelledby="dashboard-quick-title">
                    <div className="dashboard-panel-header">
                      <div>
                        <h2 id="dashboard-quick-title">Quick access</h2>
                        <p>Open frequently used DriveDesk sections.</p>
                      </div>
                    </div>
                    <div className="dashboard-quick-links">
                      <Link to="/students"><i className="mdi mdi-account-convert" /><span>Students</span><i className="mdi mdi-chevron-right" /></Link>
                      <Link to="/trainingsession"><i className="mdi mdi-school" /><span>Training sessions</span><i className="mdi mdi-chevron-right" /></Link>
                      <Link to="/enquiries"><i className="mdi mdi-account-question" /><span>Enquiries</span><i className="mdi mdi-chevron-right" /></Link>
                      <Link to="/fleetexpenses"><i className="mdi mdi-cash-multiple" /><span>Expenses</span><i className="mdi mdi-chevron-right" /></Link>
                    </div>
                  </section>
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
