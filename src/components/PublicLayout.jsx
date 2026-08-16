import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import logoIcon from "../assets/logo/logo_icon_white.png";
import "./PublicLayout.css";

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Demo", to: "/demo" },
  { label: "Contact Us", to: "/contact" },
];

export function PublicBrand() {
  return (
    <Link className="public-brand" to="/" aria-label="DriveDesk home">
      <span className="public-brand-mark"><img src={logoIcon} alt="" /></span>
      <span>drivedesk</span>
    </Link>
  );
}

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="public-header">
      <div className="public-container public-header-inner">
        <PublicBrand />

        <button
          type="button"
          className="public-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          aria-label="Toggle navigation"
        >
          <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`} aria-hidden="true" />
        </button>

        <nav id="public-navigation" className={`public-navigation${menuOpen ? " is-open" : ""}`}>
          <div className="public-nav-links">
            {publicLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => (isActive ? "is-active" : "")}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <Link className="public-login-link" to="/login">
            Sign in <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-container public-footer-grid">
        <div>
          <PublicBrand />
          <p>One workspace for driving school students, sessions, instructors, payments, and reports.</p>
        </div>
        <div className="public-footer-links">
          <strong>Product</strong>
          <Link to="/demo">Product demo</Link>
          <Link to="/login">Customer sign in</Link>
        </div>
        <div className="public-footer-links">
          <strong>Company</strong>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
      <div className="public-container public-footer-bottom">
        <span>© {new Date().getFullYear()} DriveDesk. All rights reserved.</span>
        <span>Built for modern driving schools.</span>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  return (
    <div className="public-site">
      <PublicHeader />
      <main className="public-main"><Outlet /></main>
      <PublicFooter />
    </div>
  );
}
