import React from "react";
import { Link, useNavigate } from "react-router-dom";

import logo from "./../assets/logo/logo.png";

export default function Sidebar() {
  return (
    <aside className="left-sidebar bg-sidebar">
      <div id="sidebar" className="sidebar sidebar-with-footer">
        <div className="app-brand app-logo">
          <a href="/index.html" title="Dashboard">
            <img src={logo} alt="logo" />
          </a>
        </div>

        <div data-simplebar style={{ height: "100%" }}>
          <ul className="nav sidebar-inner" id="sidebar-menu">
            <li className="has-sub active expand">
              <a
                className="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#dashboard"
                aria-expanded="false"
                aria-controls="dashboard"
              >
                <i className="mdi mdi-view-dashboard-outline"></i>
                <span className="nav-text">Dashboard</span>{" "}
              </a>
            </li>

            <li className="has-sub ">
              <a
                className="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#scheduling"
                aria-expanded="false"
                aria-controls="scheduling"
              >
                <i className="mdi mdi-card-bulleted-outline"></i>
                <span className="nav-text">Scheduling</span>{" "}
              </a>
            </li>

            <li className="has-sub ">
              <a
                className="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#instructors"
                aria-expanded="false"
                aria-controls="instructors"
              >
                <i className="mdi mdi-account-multiple"></i>
                <span className="nav-text">Instructors</span>
              </a>
            </li>

            <li className="has-sub ">
              <Link
                className="sidenav-item-link"
                to="/students"
                data-toggle="collapse"
                data-target="#students"
                aria-expanded="false"
                aria-controls="students"
              >
                <i className="mdi mdi-account-convert"></i>
                <span className="nav-text">Students</span>{" "}
              </Link>
            </li>

            <li className="has-sub ">
              <a
                className="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#branches"
                aria-expanded="false"
                aria-controls="branches"
              >
                <i className="mdi mdi-access-point-network"></i>
                <span className="nav-text">Branches</span>{" "}
              </a>
            </li>

            <li className="has-sub ">
              <a
                className="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#staff"
                aria-expanded="false"
                aria-controls="staff"
              >
                <i className="mdi mdi-account-edit"></i>
                <span className="nav-text">Staff</span>{" "}
              </a>
            </li>

            <li className="has-sub ">
              <a
                className="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#invoices"
                aria-expanded="false"
                aria-controls="invoices"
              >
                <i className="mdi mdi-content-save-outline"></i>
                <span className="nav-text">Invoices</span>{" "}
              </a>
            </li>

            <li className="has-sub ">
              <a
                className="sidenav-item-link"
                href="javascript:void(0)"
                data-toggle="collapse"
                data-target="#fleet"
                aria-expanded="false"
                aria-controls="fleet"
              >
                <i className="mdi mdi-car-connected"></i>
                <span className="nav-text">Fleet</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
