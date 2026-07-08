import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer mt-auto">
    <div className="copyright bg-white">
      <p>
        Copyright &copy; {year}{" "}
        <a
          className="text-primary"
          href="#"
          target="_blank"
        >
          drivedesk
        </a>
        .
      </p>
    </div>
  </footer>
  );
}
