import React from "react";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer mt-auto dd-footer">
      <div className="dd-footer__inner">
        <p className="dd-footer__text mb-0">
          <span className="dd-footer__muted">Copyright &copy; {year}</span>{" "}
          <span className="dd-footer__brand">Asteriq Systech</span>
          <span className="dd-footer__muted">. All rights reserved.</span>
        </p>
      </div>
    </footer>
  );
}
