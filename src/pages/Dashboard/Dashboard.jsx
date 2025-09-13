import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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
  const [summary, setSummary] = useState([]);
  const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");

  const getDashboardSummaryInfo = () => {
    
    const values = {
      year: year,
      month: month,
    };

    dispatch(
      getDashboardSummary(values, (res) => {
        //console.info('res......', res)
        setSummary(res);
      })
    );
  };

  useEffect(() => {
    getDashboardSummaryInfo();
  }, [dispatch]);
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
                <div className="row">
                  <div className="col-xl-3 col-sm-6">
                    <Link to={`/students?month=${month}&year=${year}`}>
                    <div className="card card-mini mb-4">
                      <div className="card-body">
                        <h2 className="mb-1">{summary?.registration_count}</h2>
                        <p>Monthly Total Students</p>
                        <div className="chartjs-wrapper">
                          <canvas id="barChart"></canvas>
                        </div>
                      </div>
                    </div>
                    </Link>
                  </div>
                  <div className="col-xl-3 col-sm-6">
                    <div className="card card-mini  mb-4">
                      <div className="card-body">
                        <h2 className="mb-1">{summary?.process_completed_count}</h2>
                        <p>Monthly Process completed</p>
                        <div className="chartjs-wrapper">
                          <canvas id="dual-line"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-sm-6">
                    <div className="card card-mini mb-4">
                      <div className="card-body">
                        <h2 className="mb-1">{summary?.process_failed_count}</h2>
                        <p>Monthly Process Failed</p>
                        <div className="chartjs-wrapper">
                          <canvas id="area-chart"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-sm-6">
                    <div className="card card-mini mb-4">
                      <div className="card-body">
                        <h2 className="mb-1">{summary?.payment_pending_count}</h2>
                        <p>Monthly Payment Pending</p>
                        <div className="chartjs-wrapper">
                          <canvas id="line"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-sm-6">
                    <div className="card card-mini mb-4">
                      <div className="card-body">
                        <h2 className="mb-1">{summary?.payment_completed_count}</h2>
                        <p>Monthly Payment Completed</p>
                        <div className="chartjs-wrapper">
                          <canvas id="line"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-sm-6">
                    <div className="card card-mini mb-4">
                      <div className="card-body">
                        <h2 className="mb-1">{summary?.payment_failed_count}</h2>
                        <p>Monthly Payment Failed</p>
                        <div className="chartjs-wrapper">
                          <canvas id="line"></canvas>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-8 col-md-12">
                    <div className="card card-default">
                      <div className="card-header">
                        <h2>Sales Of The Year</h2>
                      </div>
                      <div className="card-body">
                        <canvas id="linechart" className="chartjs"></canvas>
                      </div>
                      {/* <div className="card-footer d-flex flex-wrap bg-white p-0">
                        <div className="col-6 px-0">
                          <div className="text-center p-4">
                            <h4>6,308</h4>
                            <p className="mt-2">Total orders of this year</p>
                          </div>
                        </div>
                        <div className="col-6 px-0">
                          <div className="text-center p-4 border-left">
                            <h4>70,506</h4>
                            <p className="mt-2">Total revenue of this year</p>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  <div className="col-xl-4 col-md-12">
                    <div className="card card-default">
                      <div className="card-header justify-content-center">
                        <h2>Orders Overview</h2>
                      </div>
                      <div className="card-body">
                        <canvas id="doChart"></canvas>
                      </div>
                      <a
                        href="#"
                        className="pb-5 d-block text-center text-muted"
                      >
                        <i className="mdi mdi-download mr-2"></i> Download
                        overall report
                      </a>
                      {/* <div className="card-footer d-flex flex-wrap bg-white p-0">
                        <div className="col-6">
                          <div className="py-4 px-4">
                            <ul className="d-flex flex-column justify-content-between">
                              <li className="mb-2">
                                <i
                                  className="mdi mdi-checkbox-blank-circle-outline mr-2"
                                  style={{ color: "#4c84ff" }}
                                ></i>
                                Order Completed
                              </li>
                              <li>
                                <i
                                  className="mdi mdi-checkbox-blank-circle-outline mr-2"
                                  style={{ color: "#80e1c1" }}
                                ></i>
                                Order Unpaid
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-6 border-left">
                          <div className="py-4 px-4 ">
                            <ul className="d-flex flex-column justify-content-between">
                              <li className="mb-2">
                                <i
                                  className="mdi mdi-checkbox-blank-circle-outline mr-2"
                                  style={{ color: "#8061ef" }}
                                ></i>
                                Order Pending
                              </li>
                              <li>
                                <i
                                  className="mdi mdi-checkbox-blank-circle-outline mr-2"
                                  style={{ color: "#ffa128" }}
                                ></i>
                                Order Canceled
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div> */}
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
