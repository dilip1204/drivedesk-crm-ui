import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import avatar from "../assets/img/avatar.png";
import logoIcon from "../assets/logo/logo_icon_white.png";
import { useTenantLogo } from "../hooks/useTenantLogo";
import PWAInstallButton from "./PWAInstallButton";
import "./Header.css";

const SEARCHABLE_PAGES = [
  { label: "Dashboard", path: "/dashboard", icon: "mdi-view-dashboard-outline", roles: ["admin", "instructor"] },
  { label: "Students", path: "/students", icon: "mdi-account-convert", roles: ["admin", "instructor"] },
  { label: "Instructors", path: "/instructors", icon: "mdi-account-multiple", roles: ["admin", "instructor"] },
  { label: "Enquiries", path: "/enquiries", icon: "mdi-account-question", roles: ["admin", "instructor"] },
  { label: "Tariff", path: "/tariff", icon: "mdi-currency-inr", roles: ["admin"] },
  { label: "Training Session", path: "/trainingsession", icon: "mdi-school", roles: ["admin", "instructor"] },
  { label: "Attendance", path: "/attendance", icon: "mdi-calendar-check-outline", roles: ["admin", "instructor"] },
  { label: "Outstanding Fees", path: "/outstandingfees", icon: "mdi-cash-clock", roles: ["admin", "instructor"] },
  { label: "Expenses", path: "/fleetexpenses", icon: "mdi-cash-multiple", roles: ["admin", "instructor"] },
  { label: "Finance Dashboard", path: "/finance-dashboard", icon: "mdi-finance", roles: ["super_admin"] },
  { label: "Tutorials", path: "/tutorials", icon: "mdi-play-circle-outline", roles: ["admin", "instructor"] },
  { label: "Super Admin", path: "/superadmin", icon: "mdi-shield-account", roles: ["super_admin"] },
  { label: "Tenant Usage", path: "/super-admin/usage", icon: "mdi-chart-bar", roles: ["super_admin"] },
  { label: "WhatsApp Usage", path: "/superadmin/whatsapp-usage", icon: "mdi-whatsapp", roles: ["super_admin"] },
];

export default function Header() {
  const [displayName, setDisplayName] = useState("Guest User");
  const [displayRole, setDisplayRole] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [serverError, setServerError] = useState(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logoSrc, hasTenantLogo } = useTenantLogo(logoIcon);

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
    setCurrentRole(role);
  }, []);

  const visiblePages = useMemo(
    () => SEARCHABLE_PAGES.filter((page) => page.roles.includes(currentRole)),
    [currentRole]
  );

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return visiblePages.slice(0, 6);
    return visiblePages.filter((page) => page.label.toLowerCase().includes(query)).slice(0, 6);
  }, [searchQuery, visiblePages]);

  useEffect(() => {
    const handleServerError = (event) => {
      setServerError(event?.detail || { statusCode: 500 });
    };

    window.addEventListener("drivedesk:server-error", handleServerError);
    return () => window.removeEventListener("drivedesk:server-error", handleServerError);
  }, []);

  useEffect(() => {
    const body = document.getElementById("body");
    if (!body) return undefined;

    const unlockPageScroll = () => {
      document
        .querySelectorAll(".mobile-sticky-body-overlay")
        .forEach((overlay) => overlay.remove());
      body.classList.remove("sidebar-mobile-in");
      document.body.style.removeProperty("overflow");
    };

    // A route change closes the mobile drawer and must never leave the page locked.
    unlockPageScroll();
    setSearchQuery("");
    setSearchOpen(false);
    setProfileMenuOpen(false);

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

  useEffect(() => {
    if (!profileMenuOpen) return undefined;

    const closeOnOutsideInteraction = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("touchstart", closeOnOutsideInteraction, { passive: true });
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("touchstart", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen]);

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
      document
        .querySelectorAll(".mobile-sticky-body-overlay")
        .forEach((overlay) => overlay.remove());
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

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!searchResults.length) return;
    navigate(searchResults[0].path);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const handleSignInAgain = () => {
    setServerError(null);
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="main-header drivedesk-header" id="header">
      <nav className="navbar navbar-static-top navbar-expand-lg" aria-label="Application header">
        <button
          type="button"
          id="sidebar-toggler-react"
          className="sidebar-toggle"
          onClick={handleSidebarToggle}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <span className="sr-only">Toggle navigation</span>
        </button>

        <Link
          to={currentRole === "super_admin" ? "/superadmin" : "/dashboard"}
          className="header-mobile-brand"
          aria-label="Go to DriveDesk home"
        >
          <span className={`header-mobile-brand-icon${hasTenantLogo ? " has-tenant-logo" : ""}`} aria-hidden="true">
            <img src={logoSrc} alt="" />
          </span>
          <span>DriveDesk</span>
        </Link>

        <div className="header-search d-none d-md-flex">
          <form onSubmit={handleSearchSubmit} role="search">
            <i className="mdi mdi-magnify header-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
              placeholder="Go to a page..."
              autoComplete="off"
              aria-label="Search application pages"
            />
            {searchQuery && (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(true);
                }}
                aria-label="Clear search"
              >
                <i className="mdi mdi-close" aria-hidden="true" />
              </button>
            )}

            {searchOpen && (
              <div className="header-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((page) => (
                    <Link key={page.path} to={page.path} onClick={() => setSearchOpen(false)}>
                      <i className={`mdi ${page.icon}`} aria-hidden="true" />
                      <span>{page.label}</span>
                      <i className="mdi mdi-arrow-right" aria-hidden="true" />
                    </Link>
                  ))
                ) : (
                  <span className="header-search-empty">No matching page</span>
                )}
              </div>
            )}
          </form>
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

            <li
              ref={profileMenuRef}
              className={`dropdown user-menu${profileMenuOpen ? " show" : ""}`}
            >
              <button
                type="button"
                className="dropdown-toggle nav-link"
                onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
                aria-label={`Open ${displayName} account menu`}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <span className="header-avatar-wrap">
                  <img src={avatar} className="user-image" alt="" />
                  <span className="header-avatar-status" aria-hidden="true" />
                </span>
                <span className="d-none d-lg-flex header-user-copy" title={displayName}>
                  <strong className="header-user-display-name">{displayName}</strong>
                  {displayRole && <small>{displayRole}</small>}
                </span>
                <i className="mdi mdi-chevron-down header-user-chevron" aria-hidden="true" />
              </button>
              <ul
                className={`dropdown-menu dropdown-menu-right header-user-menu${profileMenuOpen ? " show" : ""}`}
                role="menu"
              >
                <li className="dropdown-header">
                  <img src={avatar} className="img-circle" alt={displayName} />
                  <div className="d-inline-block header-user-dropdown-name" title={displayName}>
                    <div>{displayName}</div>
                    {displayRole && <small className="text-muted">{displayRole}</small>}
                    {/* <small className="pt-1">
                      {user.email || "Email not found"}
                    </small> */}
                  </div>
                </li>

                 <li className="header-logout-item">
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setProfileMenuOpen(false);
                      localStorage.clear();
                      navigate("/login");
                    }}
                  >
                    <i className="mdi mdi-logout" aria-hidden="true" />
                    <span>
                      <strong>Log out</strong>
                      <small>Sign out of DriveDesk</small>
                    </span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
      </header>
      {serverError && (
        <section className="api-error-banner" role="alert" aria-live="assertive">
        <span className="api-error-banner__icon" aria-hidden="true">
          <i className="bi bi-exclamation-triangle" />
        </span>
        <div className="api-error-banner__copy">
          <strong>Unable to load DriveDesk data</strong>
          <span>
            The server or your current session did not respond correctly. Try again, or sign in again if the issue continues.
          </span>
        </div>
        <div className="api-error-banner__actions">
          <button type="button" className="btn btn-light btn-sm" onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise" aria-hidden="true" />
            <span>Retry</span>
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={handleSignInAgain}>
            <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
            <span>Sign in again</span>
          </button>
        </div>
        <button
          type="button"
          className="api-error-banner__close"
          onClick={() => setServerError(null)}
          aria-label="Dismiss server error"
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
        </section>
      )}
    </>
  );
}
