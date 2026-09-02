import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTenantLogo } from "../hooks/useTenantLogo";
import logoIcon from "./../assets/logo/logo_icon_white.png";
import "./Sidebar.css";

const closeMobileSidebar = () => {
  if (window.innerWidth >= 768) return;

  const body = document.getElementById("body");
  if (!body) return;

  document
    .querySelectorAll(".mobile-sticky-body-overlay")
    .forEach((overlay) => overlay.remove());
  body.classList.remove("sidebar-mobile-in");
  body.classList.add("sidebar-mobile-out");
  document.body.style.removeProperty("overflow");
};

export default function Sidebar() {
  const location = useLocation();
  const { logoSrc, hasTenantLogo } = useTenantLogo(logoIcon);
  const { role } = useAuth(); // 👈 Fetch user role

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMobileSidebar();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <aside className="left-sidebar bg-sidebar drivedesk-sidebar" aria-label="Primary navigation">
      <div id="sidebar" className="sidebar">
        <div className="app-brand app-logo">
          <Link to={role === "super_admin" ? "/superadmin" : "/dashboard"} title="Dashboard">
            <img
              src={logoSrc}
              alt={hasTenantLogo ? "Organisation logo" : "DriveDesk logo"}
              className={`brand-icon${hasTenantLogo ? " tenant-brand-icon" : ""}`}
            />
            <span className="brand-name">drivedesk</span>
          </Link>
        </div>

        <div className="sidebar-scroll-area" data-simplebar>
          <ul className="nav sidebar-inner" id="sidebar-menu" aria-label="DriveDesk pages">

            {role !== "super_admin" && (
              <>

            {/* Accessible by both admin and instructor */}
            <li className={`has-sub ${isActive("/dashboard") ? "active expand" : ""}`}>
              <Link className="sidenav-item-link" to="/dashboard" title="Dashboard">
                <i className="mdi mdi-view-dashboard-outline"></i>
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>

           

            {/* Shared routes */}
            <li className={`has-sub ${isActive("/students") ? "active expand" : ""}`}>
              <Link className="sidenav-item-link" to="/students" title="Students">
                <i className="mdi mdi-account-convert"></i>
                <span className="nav-text">Students</span>
              </Link>
            </li>

            <li className={`has-sub ${isActive("/instructors") ? "active expand" : ""}`}>
              <Link className="sidenav-item-link" to="/instructors" title="Instructors">
                <i className="mdi mdi-account-multiple"></i>
                <span className="nav-text">Instructors</span>
              </Link>
            </li>

             <li className={`has-sub ${isActive("/enquiries") ? "active expand" : ""}`}>
                  <Link className="sidenav-item-link" to="/enquiries" title="Enquiries">
                    <i className="mdi mdi-account-question"></i>
                    <span className="nav-text">Enquiries</span>
                  </Link>
                </li>

            {role === "admin" && (
              <li className={`has-sub ${isActive("/tariff") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/tariff" title="Tariff">
                  <i className="mdi mdi-currency-inr"></i>
                  <span className="nav-text">Tariff</span>
                </Link>
              </li>
            )}
            
              <li className={`has-sub ${isActive("/trainingsession") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/trainingsession" title="Training Session">
                  <i className="mdi mdi-school"></i>
                  <span className="nav-text">Training Session</span>
                </Link>
              </li>

              <li className={`has-sub ${isActive("/attendance") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/attendance" title="Attendance">
                  <i className="mdi mdi-calendar-check-outline"></i>
                  <span className="nav-text">Attendance</span>
                </Link>
              </li>

              <li className={`has-sub ${isActive("/fleetexpenses") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/fleetexpenses" title="Expenses">
                <i className="mdi mdi-cash-multiple"></i>
                  <span className="nav-text">Expenses</span>
                </Link>
              </li>

              <li className={`has-sub ${isActive("/tutorials") ? "active expand" : ""}`}>
                <Link className="sidenav-item-link" to="/tutorials" title="Tutorials">
                  <i className="mdi mdi-play-circle-outline"></i>
                  <span className="nav-text">Tutorials</span>
                </Link>
              </li>
              </>
            )}

            {role === "super_admin" && (
              <>
                <li className={`has-sub ${location.pathname === "/superadmin" ? "active expand" : ""}`}>
                  <Link className="sidenav-item-link" to="/superadmin" title="Tenant Management">
                    <i className="mdi mdi-shield-account"></i>
                    <span className="nav-text">Tenants</span>
                  </Link>
                </li>
                <li className={`has-sub ${isActive("/super-admin/usage") ? "active expand" : ""}`}>
                  <Link className="sidenav-item-link" to="/super-admin/usage" title="Tenant Usage">
                    <i className="mdi mdi-chart-bar"></i>
                    <span className="nav-text">Tenant Usage</span>
                  </Link>
                </li>
                <li className={`has-sub ${isActive("/superadmin/whatsapp-usage") ? "active expand" : ""}`}>
                  <Link className="sidenav-item-link" to="/superadmin/whatsapp-usage" title="WhatsApp Usage">
                    <i className="mdi mdi-whatsapp"></i>
                    <span className="nav-text">WhatsApp Usage</span>
                  </Link>
                </li>
                <li className={`has-sub ${isActive("/finance-dashboard") ? "active expand" : ""}`}>
                  <Link className="sidenav-item-link" to="/finance-dashboard" title="Finance Dashboard">
                    <i className="mdi mdi-finance"></i>
                    <span className="nav-text">Finance</span>
                  </Link>
                </li>
              </>
            )}
            

          </ul>
        </div>
      </div>
      </aside>
      <button
        type="button"
        className="drivedesk-sidebar-backdrop"
        onClick={closeMobileSidebar}
        aria-label="Close navigation menu"
      />
    </>
  );
}
