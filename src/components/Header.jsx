import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import avatar from "../assets/img/avatar.png";

export default function Header() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {


    const user = JSON.parse(localStorage.getItem('userRoleInfo'));
    const userInfo = user.role === "admin" ? localStorage.getItem("userInfo"):localStorage.getItem('userRoleInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  return (
    <header className="main-header " id="header">
      <nav
        className="navbar navbar-static-top navbar-expand-lg"
        style={{ padding: "0" }}
      >
        <button id="sidebar-toggler" className="sidebar-toggle">
          <span className="sr-only">Toggle navigation</span>
        </button>

        <div className="search-form d-none d-lg-inline-block">
          {/* <div className="input-group">
            <button
              type="button"
              name="search"
              id="search-btn"
              className="btn btn-flat"
            >
              <i className="mdi mdi-magnify"></i>
            </button>
            <input
              type="text"
              name="query"
              id="search-input"
              className="form-control"
              placeholder="Search..."
              autoFocus
              autoComplete="off"
            />
          </div> */}
          <div id="search-results-container">
            <ul id="search-results"></ul>
          </div>
        </div>

        <div className="navbar-right ">
          <ul className="nav navbar-nav">
            {/* <li className="dropdown notifications-menu custom-dropdown">
              <button className="dropdown-toggle notify-toggler custom-dropdown-toggler">
                <i className="mdi mdi-bell-outline"></i>
              </button>
            </li> */}

            <li className="dropdown user-menu">
              <button
                href="#"
                className="dropdown-toggle nav-link"
                data-toggle="dropdown"
              >
                <img src={avatar} className="user-image" alt="User Image" />
                <span className="d-none d-lg-inline-block">
                  {user.email ? user.email.split("@")[0] : "" || "Guest User"}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-right">
                <li className="dropdown-header">
                  <img src={avatar} className="img-circle" alt="User Image" />
                  <div className="d-inline-block">
                    {user.email ? user.email.split("@")[0] : "" || "Guest User"}{" "}
                    <small className="pt-1">
                      {user.email || "Email not found"}
                    </small>
                  </div>
                </li>

                <li>
                  <Link to="#">
                    <i className="mdi mdi-account"></i> My Profile
                  </Link>
                </li>
                <li>
                  <Link to="#">
                    <i className="mdi mdi-email"></i> Message
                  </Link>
                </li>
                <li>
                  <Link to="#">
                    {" "}
                    <i className="mdi mdi-diamond-stone"></i> Projects{" "}
                  </Link>
                </li>
                <li className="right-sidebar-in">
                  <Link to="#">
                    {" "}
                    <i className="mdi mdi-settings"></i> Setting{" "}
                  </Link>
                </li>

                <li className="dropdown-footer">
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.clear();
                      navigate("/login");
                    }}
                  >
                    {" "}
                    <i className="mdi mdi-logout"></i> Log Out{" "}
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
