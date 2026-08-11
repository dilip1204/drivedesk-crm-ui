import driveDeskLogo from "../assets/logo/logo_icon_white.png";
import srdsLogo from "../assets/logo/srds-logo.png";

const getOrganizationName = () => {
  try {
    const tenant = JSON.parse(localStorage.getItem("userInfo") || "{}");
    return (tenant?.org_name || tenant?.organization_name || tenant?.name || "")
      .trim()
      .toLowerCase();
  } catch (error) {
    return "";
  }
};

export const isDriveDeskAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("userRoleInfo") || "{}");
    return (user?.role || "").toLowerCase() === "admin";
  } catch (error) {
    return false;
  }
};

export const isSriRagavendraOrganization = () =>
  getOrganizationName() === "sri ragavendra heavy driving school";

export const getAdminPrintLogoSource = () =>
  isSriRagavendraOrganization() ? srdsLogo : driveDeskLogo;

export const getAdminPrintWatermark = () =>
  isDriveDeskAdmin()
    ? `<img src="${getAdminPrintLogoSource()}" alt="" aria-hidden="true" style="position:fixed;top:50%;left:50%;width:320px;height:320px;object-fit:contain;opacity:0.06;transform:translate(-50%,-50%);pointer-events:none;z-index:0" />`
    : "";

export const addAdminPrintLogo = (html = "") => {
  if (!isDriveDeskAdmin()) return html;

  const watermark = getAdminPrintWatermark();
  const receiptStyles = `
    <style id="drivedesk-receipt-print-styles">
      @page { size: A4 portrait; margin: 14mm; }
      * { box-sizing: border-box; }
      html, body { min-height: 100%; }
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        color: #172033 !important;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 12px !important;
        line-height: 1.45 !important;
      }
      body > table,
      body > div:not([aria-hidden="true"]) {
        position: relative;
        z-index: 1;
      }
      body > table:first-of-type {
        width: 100% !important;
        max-width: 760px !important;
        margin: 18px auto 0 !important;
        border: 1px solid #9aa7b5 !important;
        border-top: 5px solid #1f4e78 !important;
        border-radius: 4px !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        background: rgba(255,255,255,.92) !important;
      }
      table { border-collapse: collapse; }
      th, td { padding: 7px 9px !important; vertical-align: top; }
      h1, h2, h3, h4 { color: #172033 !important; }
      h1 { margin: 4px 0 !important; font-size: 22px !important; line-height: 1.2 !important; }
      h2, h3 { margin: 5px 0 10px !important; color: #1f4e78 !important; }
      hr { margin: 13px 0 !important; border: 0 !important; border-top: 1px solid #9aa7b5 !important; }
      strong, b { color: #172033; }
      u { color: #1f4e78; font-size: 15px; font-weight: 700; text-decoration: none; }
      img[aria-hidden="true"] {
        filter: saturate(.8);
        opacity: .055 !important;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body > table:first-of-type { margin-top: 0 !important; box-shadow: none !important; }
        thead { display: table-header-group; }
        tr, td, th { break-inside: avoid; }
      }
    </style>`;

  let styledHtml = /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${receiptStyles}</head>`)
    : `${receiptStyles}${html}`;

  return /<body[^>]*>/i.test(styledHtml)
    ? styledHtml.replace(/<body([^>]*)>/i, `<body$1>${watermark}`)
    : `${watermark}${styledHtml}`;
};

export { driveDeskLogo, srdsLogo };
