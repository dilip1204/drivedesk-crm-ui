import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "../../assets/plugins/simplebar/simplebar.css";
import "../../assets/plugins/nprogress/nprogress.css";
import "../../assets/plugins/jvectormap/jquery-jvectormap-2.0.3.css";

import "./Dashboard.css";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { getDashboardSummary } from "../../store/dashboardSummary/actions";

const Dashboard = () => {
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.dashboardSummary.dashboardSummary || {});
  console.log("Dashboard summary:", summary);
  const loader = useSelector((state) => state.dashboardSummary.dashboardSummaryLoader);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  const fetchDashboardSummary = () => {
    const values = {
      year: year,
      month: month,
    };

    dispatch(getDashboardSummary(values));
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, [dispatch]);

  const formatValue = (value) => (typeof value === "number" ? value : 0);
  const registrationCount = formatValue(summary?.response?.registration_count);
  const processCompletedCount = formatValue(summary?.response?.process_completed_count);
  const processFailedCount = formatValue(summary?.response?.process_failed_count);
  const paymentPendingCount = formatValue(summary?.response?.payment_pending_count);
  const paymentCompletedCount = formatValue(summary?.response?.payment_completed_count);
  const paymentFailedCount = formatValue(summary?.response?.payment_failed_count);
  const total_outstanding_amount = formatValue(summary?.response?.total_outstanding_amount);
  const paymentTotalCount = paymentPendingCount + paymentCompletedCount + paymentFailedCount;
  const processSuccessRate = registrationCount ? Math.round((processCompletedCount / registrationCount) * 100) : 0;
  const paymentSuccessRate = paymentTotalCount ? Math.round((paymentCompletedCount / paymentTotalCount) * 100) : 0;

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
                        <p className="mb-2">Payment Pending</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge badge-warning">Pending</span>
                          <span className="text-muted small">Follow-up required</span>
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
                    <Link to={`/students?month=${month}&year=${year}`}>
                      <div className="card card-mini mb-4 border-primary">
                        <div className="card-body">
                          <h2 className="mb-1 text-primary">&#8377;{total_outstanding_amount}</h2>
                          <p className="mb-2">Total Payment</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="badge badge-primary">Net Payment</span>
                            <span className="text-muted small">Current month</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
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
