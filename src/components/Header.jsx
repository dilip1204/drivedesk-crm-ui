import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import avatar from "../assets/img/avatar.png";
import PWAInstallButton from "./PWAInstallButton";
import "./Header.css";

export default function Header() {
  const [displayName, setDisplayName] = useState("Guest User");
  const [displayRole, setDisplayRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const formatRoleLabel = (role) => {
    if (!role) return "";
    return role.toString().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    const roleInfo = JSON.parse(localStorage.getItem("userRoleInfo") || "{}");
    const tenantInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const role = (roleInfo?.role || "").toLowerCase();

    const fallbackName =
      (roleInfo?.email ? roleInfo.email.split("@")[0] : "") || "Guest User";

    const resolvedName =
      role === "super_admin"
        ? "superadmin"
        : role === "instructor"
        ? roleInfo?.name || roleInfo?.instructor_name || roleInfo?.full_name || fallbackName
        : role === "admin"
        ? tenantInfo?.org_name || tenantInfo?.organization_name || tenantInfo?.name || fallbackName
        : fallbackName;

    setDisplayName(resolvedName);
    setDisplayRole(formatRoleLabel(roleInfo?.role || role));
  }, []);

  useEffect(() => {
    const body = document.getElementById("body");
    if (!body) return undefined;

    const unlockPageScroll = () => {
      body.classList.remove("sidebar-mobile-in");
      document.body.style.removeProperty("overflow");
    };

    // A route change closes the mobile drawer and must never leave the page locked.
    unlockPageScroll();

    const handleResize = () => {
      if (window.innerWidth >= 768) unlockPageScroll();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      unlockPageScroll();
    };
  }, [location.pathname]);

  const handleSidebarToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent?.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }

    const body = document.getElementById("body");
    if (!body) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      body.classList.toggle("sidebar-mobile-in");
      body.classList.remove("sidebar-mobile-out");

      if (body.classList.contains("sidebar-mobile-in")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.removeProperty("overflow");
        body.classList.add("sidebar-mobile-out");
      }
      return;
    }

    if (body.classList.contains("sidebar-fixed") || body.classList.contains("sidebar-static")) {
      if (!body.classList.contains("sidebar-minified")) {
        body.classList.remove("sidebar-collapse", "sidebar-minified-out");
        body.classList.add("sidebar-minified");
      } else {
        body.classList.remove("sidebar-minified");
        body.classList.add("sidebar-minified-out");
      }
      return;
    }

    if (body.classList.contains("sidebar-fixed-offcanvas") || body.classList.contains("sidebar-static-offcanvas")) {
      if (!body.classList.contains("sidebar-collapse")) {
        body.classList.add("sidebar-collapse");
      } else {
        body.classList.remove("sidebar-collapse");
        body.classList.add("sidebar-collapse-out");
        setTimeout(() => body.classList.remove("sidebar-collapse-out"), 300);
      }
    }
  };

  return (
    <header className="main-header " id="header">
      <nav
        className="navbar navbar-static-top navbar-expand-lg"
        style={{ padding: "0" }}
      >
        <button id="sidebar-toggler-react" className="sidebar-toggle" onClick={handleSidebarToggle}>
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

            <li className="pwa-install-nav-item">
              <PWAInstallButton />
            </li>

            <li className="dropdown user-menu">
              <button
                href="#"
                className="dropdown-toggle nav-link"
                data-toggle="dropdown"
              >
                <img src={avatar} className="user-image" alt="User Image" />
                <span className="d-none d-lg-inline-block header-user-display-name" title={displayName}>
                  {displayName}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-right">
                <li className="dropdown-header" style={{margin: 0}}>
                  <img src={avatar} className="img-circle" alt="User Image" />
                  <div className="d-inline-block header-user-dropdown-name" title={displayName}>
                    <div>{displayName}</div>
                    {displayRole && <small className="text-muted">{displayRole}</small>}
                    {/* <small className="pt-1">
                      {user.email || "Email not found"}
                    </small> */}
                  </div>
                </li>

                {/* <li>
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
                </li> */}

                {/* <li className="dropdown-footer"> */}
                 <li>
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
