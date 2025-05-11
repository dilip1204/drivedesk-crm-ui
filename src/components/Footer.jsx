import React from "react";

export default function Footer() {
  return (
    <footer className="footer mt-auto">
    <div className="copyright bg-white">
      <p>
        Copyright &copy; <span id="copy-year">2025</span>{" "}
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
    <script>
      var d = new Date(); var year = d.getFullYear();
      document.getElementById("copy-year").innerHTML = year;
    </script>
  </footer>
  );
}
