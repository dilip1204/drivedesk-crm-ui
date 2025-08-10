import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "./../assets/logo/logo.png";

export default function Sidebar() {
  const location = useLocation();
  const { role } = useAuth(); // 👈 Fetch user role

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="left-sidebar bg-sidebar">
      <div id="sidebar" className="sidebar sidebar-with-footer">
        <div className="app-brand app-logo">
          <Link to="/dashboard" title="Dashboard">
            <img src={logo} alt="logo" />
          </Link>
        </div>

        <div data-simplebar style={{ height: "100%" }}>
          <ul className="nav sidebar-inner" id="sidebar-menu">

            {/* Accessible by both admin and instructor */}
            <li className={`has-sub ${isActive("/dashboard") ? "active expand" : ""}`}>
              <Link className="sidenav-item-link" to="/dashboard">
                <i className="mdi mdi-view-dashboard-outline"></i>
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>

           

            {/* Shared routes */}
            <li className={`has-sub ${isActive("/students") ? "active expand" : ""}`}>
              <Link className="sidenav-item-link" to="/students">
                <i className="mdi mdi-account-convert"></i>
                <span className="nav-text">Students</span>
              </Link>
            </li>

            <li className={`has-sub ${isActive("/instructors") ? "active expand" : ""}`}>
              <Link className="sidenav-item-link" to="/instructors">
                <i className="mdi mdi-account-multiple"></i>
                <span className="nav-text">Instructors</span>
              </Link>
            </li>

             <li className={`has-sub ${isActive("/enquiries") ? "active expand" : ""}`}>
                  <Link className="sidenav-item-link" to="/enquiries">
                    <i className="mdi mdi-account-question"></i>
                    <span className="nav-text">Enquiries</span>
                  </Link>
                </li>

            {role === "admin" && (
              <li className={`has-sub ${isActive("/tariff") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/tariff">
                  <i className="mdi mdi-chart-multiline"></i>
                  <span className="nav-text">Tariff</span>
                </Link>
              </li>
            )}
            {role === "admin" && (
              <li className={`has-sub ${isActive("/trainingsession") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/trainingsession">
                  <i className="mdi mdi-chart-multiline"></i>
                  <span className="nav-text">Training Session</span>
                </Link>
              </li>
            )}

          </ul>
        </div>
      </div>
    </aside>
  );
}
