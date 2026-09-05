import React from "react";
import { Modal, Button } from "react-bootstrap";
import avatar from "../../assets/img/avatar.png";
import "./Students.css"; // Optional custom styles
import { useDispatch } from "react-redux";
import { getStudentReceiptInfo } from "../../store/students/actions"; // adjust the path if needed
import { ToastContainer, toast } from "react-toastify";
import { formatDateDDMMYYYY } from "../../utils/dateFormat";
import {
  addAdminPrintLogo,
  getAdminPrintHeader,
  getAdminPrintWatermark,
} from "../../utils/printBranding";
import { ensureTenantLogo } from "../../hooks/useTenantLogo";
import "./studentPayments.css";

const getPaymentStatusClass = (value) => {
  const status = String(value || "").toLowerCase();

  if (status.includes("complete") || status.includes("paid") || status.includes("success")) {
    return "is-completed";
  }

  if (status.includes("pending") || status.includes("partial")) {
    return "is-pending";
  }

  if (status.includes("fail") || status.includes("cancel")) {
    return "is-failed";
  }

  return "is-neutral";
};

export default function StudentProfileModal({ show, onClose, student }) {

  const dispatch = useDispatch();

  const handlePrintReceipt = (receiptNo) => { 
  if (!receiptNo) { 
     setTimeout(() => {
    toast.error("Receipt number not found.");
  }, 100); // delay to allow modal to remain mounted
  return;
    
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow pop-ups to print the receipt.");
    return;
  }
  const tenantLogoPromise = ensureTenantLogo(dispatch);

  dispatch(getStudentReceiptInfo({ receipt_no: receiptNo }, async (response) => {
    if (response) {
      const tenantLogo = await tenantLogoPromise;
      printWindow.document.write(addAdminPrintLogo(response, tenantLogo));
      printWindow.document.close();
      const printReceipt = () => {
        printWindow.focus();
        printWindow.print();
      };
      if (printWindow.document.readyState === "complete") {
        window.setTimeout(printReceipt, 0);
      } else {
        printWindow.onload = printReceipt;
      }
    } else {
      printWindow.close();
      alert("Failed to load receipt content.");
    }
  }));
};



  const handlePrintTable = async () => {
    if (!Array.isArray(student?.payments) || student.payments.length === 0) return;

    const escapeHtml = (value) =>
      String(value ?? "-")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    let organizationName = "";
    try {
      const tenant = JSON.parse(localStorage.getItem("userInfo") || "{}");
      organizationName =
        tenant?.org_name || tenant?.organization_name || tenant?.name || "";
    } catch (error) {
      organizationName = "";
    }

    const totalPaid = student.payments.reduce(
      (sum, payment) => sum + (Number(payment?.amount) || 0),
      0
    );
    const rows = student.payments
      .map(
        (payment, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(payment?.receipt_no)}</td>
            <td class="amount">&#8377;${escapeHtml(payment?.amount ?? 0)}</td>
            <td>${escapeHtml(formatDateDDMMYYYY(payment?.date))}</td>
            <td>${escapeHtml(payment?.payment_method || payment?.method)}</td>
            <td><span class="status">${escapeHtml(payment?.payment_status || payment?.status)}</span></td>
            <td class="remarks">${escapeHtml(payment?.remarks)}</td>
          </tr>`
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the payment history.");
      return;
    }
    const tenantLogo = await ensureTenantLogo(dispatch);
    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Payment History - ${escapeHtml(student.name)}</title>
          <style>
            @page { size: A4 portrait; margin: 16mm; }
            * { box-sizing: border-box; }
            body { margin: 0; color: #172033; font: 12px Arial, Helvetica, sans-serif; }
            .report { position: relative; z-index: 1; min-height: 250mm; }
            .header { display: grid; grid-template-columns: 112px minmax(0, 1fr) 112px; min-height: 86px; align-items: center; padding-bottom: 14px; border-bottom: 2px solid #1f4e78; }
            .header-copy { align-self: center; text-align: center; }
            .header-spacer { width: 112px; }
            .org { margin: 0 0 5px; font-size: 21px; }
            .title { margin: 0; color: #1f4e78; font-size: 17px; letter-spacing: .8px; text-transform: uppercase; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 28px; margin: 18px 0; padding: 12px 14px; border: 1px solid #d5dce5; border-radius: 4px; background: #f7f9fc; }
            .detail { display: flex; gap: 8px; }
            .label { min-width: 100px; color: #566273; font-weight: 700; }
            .value { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 9px 7px; border: 1px solid #9aa7b5; text-align: center; vertical-align: middle; }
            th { background: #1f4e78 !important; color: #fff !important; font-size: 10px; letter-spacing: .2px; text-transform: uppercase; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            tbody tr:nth-child(even) { background: #f4f7fa; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .amount { text-align: right; font-weight: 700; }
            .remarks { text-align: left; }
            .status { color: #18733c; font-weight: 700; }
            .total { display: flex; justify-content: flex-end; margin-top: 12px; }
            .total-box { min-width: 230px; padding: 10px 14px; border: 1px solid #9aa7b5; background: #f7f9fc; font-size: 14px; text-align: right; }
            .signatures { display: flex; justify-content: flex-end; margin-top: 72px; }
            .signature { width: 220px; padding-top: 7px; border-top: 1px solid #172033; text-align: center; font-weight: 700; }
            .footer { position: absolute; right: 0; bottom: 0; left: 0; padding-top: 8px; border-top: 1px solid #d5dce5; color: #7a8491; font-size: 10px; text-align: center; }
          </style>
        </head>
        <body>
          ${getAdminPrintWatermark(tenantLogo)}
          <main class="report">
            <header class="header">
              ${getAdminPrintHeader(tenantLogo)}
              <div class="header-copy">
                ${organizationName ? `<h1 class="org">${escapeHtml(organizationName)}</h1>` : ""}
                <h2 class="title">Student Payment History</h2>
              </div>
              <span class="header-spacer" aria-hidden="true"></span>
            </header>
            <section class="details">
              <div class="detail"><span class="label">Student:</span><span class="value">${escapeHtml(student.name)}</span></div>
              <div class="detail"><span class="label">Application No:</span><span class="value">${escapeHtml(student.application_number)}</span></div>
              <div class="detail"><span class="label">Mobile:</span><span class="value">${escapeHtml(student.mobile_number)}</span></div>
              <div class="detail"><span class="label">Generated:</span><span class="value">${escapeHtml(formatDateDDMMYYYY(new Date().toISOString()))}</span></div>
            </section>
            <table>
              <thead><tr><th>#</th><th>Receipt No</th><th>Amount</th><th>Date</th><th>Method</th><th>Status</th><th>Remarks</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="total"><div class="total-box">Total Paid: <strong>&#8377;${escapeHtml(totalPaid.toFixed(2))}</strong></div></div>
            <section class="signatures"><div class="signature">Authorized Signature</div></section>
            <footer class="footer">This payment history was generated through DriveDesk.</footer>
          </main>
          <script>window.onload=function(){window.print();window.close();}</script>
        </body>
      </html>`);
    printWindow.document.close();
  };


  if (!student) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered dialogClassName="student-profile-dialog">
      <Modal.Header closeButton className="student-profile-header">
        <div className="student-profile-title-icon" aria-hidden="true">
          <i className="bi bi-person" />
        </div>
        <Modal.Title>Student Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body className="student-profile-body">
        {/* Profile Header */}
        <div className="student-profile-summary">
          <img
            src={avatar}
            alt="Student Avatar"
            className="student-profile-avatar"
          />
          <div className="student-profile-summary-copy">
            <h4>{student.name}</h4>
            <div>
              Application No: {student.application_number}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="row student-profile-details">
          {/* Left Column */}
          <div className="col-md-6">
            <ProfileItem label="Name" value={student.name} />
            <ProfileItem
              label="Application Number"
              value={student.application_number}
            />
            <ProfileItem label="DOB" value={student.dob} />
            <ProfileItem label="Mobile" value={student.mobile_number} />
            <ProfileItem label="Aadhar Number" value={student.aadhar_number} />
            <ProfileItem label="Plan" value={student.plan} />
            {/* <ProfileItem
              label="Initial Payment Method"
              value={student.initial_payment_method}
            /> */}
            <ProfileItem label="Test Date" value={student.test_date} />
            <ProfileItem
              label="Training Start Date"
              value={formatDateDDMMYYYY(student.training_start_date)}
            />
            <ProfileItem label="Training Time" value={student.training_time} />
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <ProfileItem label="Total Amount" value={student.total_amount} />
            <ProfileItem label="Paid Amount" value={student.paid_amount} />
            {student.discount > 0 && (
              <ProfileItem label="Discount" value={student.discount} />
            )}
            <ProfileItem label="Balance" value={student.balance} />
            <ProfileItem
              label="Full Payment Status"
              value={student.full_payment_status}
            />
            <ProfileItem
              label="Instructor Name"
              value={student.instructor_name}
            />
            <ProfileItem
              label="Instructor Mobile"
              value={student.instructor_mobile}
            />
            <ProfileItem label="Courses Enrolled" value={student.plan} />
            <ProfileItem
              label="No. of Training Days"
              value={student.training_days}
            />
            <ProfileItem
              label="Classes Completed"
              value={student.classesCompleted}
            />
          </div>
        </div>
        <section className="student-profile-licence" aria-labelledby="student-profile-licence-title">
          <div className="student-payment-history-header">
            <h5 id="student-profile-licence-title">
              <i className="bi bi-card-checklist" aria-hidden="true" /> Test &amp; Licence Details
            </h5>
          </div>
          <div className="row student-profile-details">
            <div className="col-md-6">
              <ProfileItem label="Test Status" value={String(student.test_status || "NOT_ATTEMPTED").replace(/_/g, " ")} />
              <ProfileItem label="Licence Number" value={student.license_details?.license_number} />
              <ProfileItem
                label="Licence Classes"
                value={Array.isArray(student.license_details?.license_classes)
                  ? student.license_details.license_classes.join(", ")
                  : student.license_details?.license_classes}
              />
              <ProfileItem label="RTO" value={student.license_details?.rto} />
            </div>
            <div className="col-md-6">
              <ProfileItem label="Issue Date" value={formatDateDDMMYYYY(student.license_details?.issue_date)} />
              <ProfileItem label="Expiry Date" value={formatDateDDMMYYYY(student.license_details?.expiry_date)} />
              <ProfileItem label="Enrollment Number" value={student.license_details?.enrollment_number} />
            </div>
          </div>
        </section>
        {/* Payments Table */}
        {Array.isArray(student.payments) && student.payments.length > 0 && (
          <div className="student-payment-history">
            <div className="student-payment-history-header">
              <h5><i className="bi bi-credit-card" aria-hidden="true" /> Payment History</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handlePrintTable}
              >
                <i className="bi bi-printer" aria-hidden="true" /> Print Payments
              </Button>
            </div>

            <div className="table-responsive student-payment-history-table-wrap">
              <table className="table table-bordered table-sm student-payment-history-table">
                <thead className="table-light">
                  <tr>
                    <th>Receipt No</th>
                    <th>Amount (₹)</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    {/* <th>Received By</th> */}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {student.payments.map((payment, index) => (
                    <tr key={index}>
                      <td data-label="Receipt No">{payment.receipt_no || "-"}</td>
                      <td data-label="Amount" className="student-payment-amount">₹{Number(payment.amount || 0).toLocaleString("en-IN")}</td>
                      <td data-label="Date">{formatDateDDMMYYYY(payment.date)}</td>
                      <td data-label="Method">{payment.payment_method || payment.method || "-"}</td>
                      <td data-label="Status">
                        <span className={`student-payment-status ${getPaymentStatusClass(payment.payment_status || payment.status)}`}>
                          {payment.payment_status || payment.status || "-"}
                        </span>
                      </td>
                      <td data-label="Remarks">{payment.remarks || "-"}</td>
                      {/* <td>{payment.payment_received_by || "-"}</td> */}
                      <td data-label="Action" className="student-payment-row-action">
                        {payment.receipt_no && (
                          <Button
                           
                            size="sm"
                            onClick={() =>
                              handlePrintReceipt(payment.receipt_no)
                            }
                          >
                            <i className="bi bi-printer" aria-hidden="true" /> Print
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeButton={false}
          closeOnClick
          pauseOnHover
        />
      </Modal.Body>
      <Modal.Footer className="student-profile-footer">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Reusable row layout
const ProfileItem = ({ label, value }) => (
  <div className="student-profile-item">
    <span>{label}</span>
    <strong>{value === undefined || value === null || value === "" ? "N/A" : value}</strong>
  </div>
);
