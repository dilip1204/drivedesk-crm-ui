import driveDeskLogo from "../assets/logo/logo_icon_white.png";
import srdsLogo from "../assets/logo/srds-logo.png";
import {
  getAuthenticatedTenantId,
  getCachedTenantLogo,
} from "../hooks/useTenantLogo";

const readStoredTenant = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  } catch (error) {
    return {};
  }
};

const getOrganizationName = () => {
  const tenant = readStoredTenant();
  return (tenant?.org_name || tenant?.organization_name || tenant?.name || "")
    .trim()
    .toLowerCase();
};

const escapeAttribute = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const hasTenantPrintContext = () =>
  Boolean(getAuthenticatedTenantId() || getOrganizationName()) || isDriveDeskAdmin();

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

export const getAdminPrintLogoSource = (tenantLogo = "") =>
  tenantLogo
  || getCachedTenantLogo()
  || readStoredTenant()?.logo_url
  || readStoredTenant()?.logoUrl
  || readStoredTenant()?.org_logo
  || readStoredTenant()?.logo
  || (isSriRagavendraOrganization() ? srdsLogo : driveDeskLogo);

export const getAdminPrintHeader = (tenantLogo = "") => {
  if (!hasTenantPrintContext()) return "";

  return `<div class="drivedesk-print-brand-header" style="position:relative;z-index:1;display:flex;width:112px;height:72px;align-items:center;justify-content:flex-start;margin:0"><img src="${escapeAttribute(getAdminPrintLogoSource(tenantLogo))}" alt="Organisation logo" style="display:block;width:112px;height:68px;object-fit:contain;object-position:left center" /></div>`;
};

const getReceiptPrintLogo = (tenantLogo = "") =>
  `<div class="drivedesk-receipt-brand-logo"><img src="${escapeAttribute(getAdminPrintLogoSource(tenantLogo))}" alt="Organisation logo" /></div>`;

export const getAdminPrintWatermark = (tenantLogo = "") =>
  hasTenantPrintContext()
    ? `<img src="${escapeAttribute(getAdminPrintLogoSource(tenantLogo))}" alt="" aria-hidden="true" style="position:fixed;top:50%;left:50%;width:320px;height:320px;object-fit:contain;opacity:0.06;transform:translate(-50%,-50%);pointer-events:none;z-index:0" />`
    : "";

export const addAdminPrintLogo = (html = "", tenantLogo = "") => {
  if (!hasTenantPrintContext()) return html;

  const receiptLogo = getReceiptPrintLogo(tenantLogo);
  const watermark = getAdminPrintWatermark(tenantLogo);
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
      body > table:first-of-type tr:first-child > td {
        vertical-align: middle !important;
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
      .drivedesk-print-brand-header {
        position: relative;
        z-index: 1;
        display: flex;
        min-height: 72px;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
      }
      .drivedesk-print-brand-header img {
        display: block;
        width: auto;
        max-width: 150px;
        height: auto;
        max-height: 72px;
        object-fit: contain;
      }
      .drivedesk-receipt-brand-logo {
        display: flex;
        width: 100%;
        min-height: 76px;
        align-items: center;
        justify-content: center;
        margin: 0;
      }
      .drivedesk-receipt-brand-logo img {
        display: block;
        width: 110px;
        height: 76px;
        object-fit: contain;
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

  const watermarkedHtml = /<body[^>]*>/i.test(styledHtml)
    ? styledHtml.replace(/<body([^>]*)>/i, `<body$1>${watermark}`)
    : `${watermark}${styledHtml}`;

  if (/<td\b[^>]*>/i.test(watermarkedHtml)) {
    return watermarkedHtml.replace(/<td\b([^>]*)>/i, `<td$1>${receiptLogo}`);
  }

  const header = getAdminPrintHeader(tenantLogo);
  return /<body[^>]*>/i.test(watermarkedHtml)
    ? watermarkedHtml.replace(/<body([^>]*)>/i, `<body$1>${header}`)
    : `${header}${watermarkedHtml}`;
};

export { driveDeskLogo, srdsLogo };
