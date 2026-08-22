import React from "react";
import "./Footer.css";
import logoIcon from "../assets/logo/logo_icon_white.png";
import { useTenantLogo } from "../hooks/useTenantLogo";

export default function Footer() {
  const year = new Date().getFullYear();
  const { logoSrc, hasTenantLogo } = useTenantLogo(logoIcon);

  return (
    <footer className="footer mt-auto dd-footer" aria-label="Application footer">
      <div className="dd-footer__inner">
        <div className="dd-footer__identity">
          <span className={`dd-footer__logo${hasTenantLogo ? " has-tenant-logo" : ""}`} aria-hidden="true">
            <img src={logoSrc} alt="" />
          </span>
          <span className="dd-footer__product">
            <strong>DriveDesk</strong>
            <small>Driving school management</small>
          </span>
        </div>

        <p className="dd-footer__copyright">
          &copy; {year}{" "}
          <a href="https://asteriqsystech.com/" target="_blank" rel="noopener noreferrer">
            Asteriq Systech
          </a>. All rights reserved.
        </p>

        <div className="dd-footer__meta" aria-label="Application status">
          <span className="dd-footer__status-dot" aria-hidden="true"></span>
          <span>DriveDesk CRM</span>
        </div>
      </div>
    </footer>
  );
}
