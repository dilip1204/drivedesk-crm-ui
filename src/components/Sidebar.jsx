import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logoIcon from "./../assets/logo/logo_icon_white.png";

export default function Sidebar() {
  const location = useLocation();
  const { role } = useAuth(); // 👈 Fetch user role

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="left-sidebar bg-sidebar">
      <div id="sidebar" className="sidebar sidebar-with-footer">
        <div className="app-brand app-logo">
          <Link to={role === "super_admin" ? "/superadmin" : "/dashboard"} title="Dashboard">
            <img src={logoIcon} alt="drivedesk logo" className="brand-icon" />
            <span className="brand-name">drivedesk</span>
          </Link>
        </div>

        <div data-simplebar style={{ height: "100%" }}>
          <ul className="nav sidebar-inner" id="sidebar-menu">

            {role !== "super_admin" && (
              <>

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
                  <i className="mdi mdi-currency-inr"></i>
                  <span className="nav-text">Tariff</span>
                </Link>
              </li>
            )}
            
              <li className={`has-sub ${isActive("/trainingsession") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/trainingsession">
                  <i className="mdi mdi-school"></i>
                  <span className="nav-text">Training Session</span>
                </Link>
              </li>

              <li className={`has-sub ${isActive("/fleetexpenses") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/fleetexpenses">
                <i className="mdi mdi-cash-multiple"></i>
                  <span className="nav-text">Expenses</span>
                </Link>
              </li>
              </>
            )}

            {role === "super_admin" && (
              <li className={`has-sub ${isActive("/superadmin") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/superadmin">
                  <i className="mdi mdi-shield-account"></i>
                  <span className="nav-text">Super Admin</span>
                </Link>
              </li>
            )}
            

          </ul>
        </div>
      </div>
    </aside>
  );
}
