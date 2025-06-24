import React, {useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import avatar from "../../assets/img/avatar.png";
import "./Students.css"; // Optional custom styles
import { useDispatch } from "react-redux";
import { getStudentReceiptInfo } from "../../store/students/actions"; // adjust the path if needed
import { ToastContainer, toast } from "react-toastify";

export default function StudentProfileModal({ show, onClose, student }) {

  const paymentTableRef = useRef();
  const dispatch = useDispatch();

  const handlePrintReceipt = (receiptNo) => { 
  if (!receiptNo) { 
     setTimeout(() => {
    toast.error("Receipt number not found.");
  }, 100); // delay to allow modal to remain mounted
  return;
    
  }

  dispatch(getStudentReceiptInfo({ receipt_no: receiptNo }, (response) => {
    if (response) {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${receiptNo}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; }
            </style>
          </head>
          <body>
            ${response}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      alert("Failed to load receipt content.");
    }
  }));
};



  const handlePrintTable = () => {
  const content = paymentTableRef.current?.innerHTML;
  if (!content) return;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Payment History</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h3>Payment History - ${student.name}</h3>
        ${content}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};


  if (!student) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>👤 Student Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        {/* Profile Header */}
        <div className="d-flex align-items-center mb-4 border-bottom pb-3">
          <img
            src={avatar}
            alt="Student Avatar"
            className="rounded-circle me-3"
            style={{ width: 80, height: 80, objectFit: "cover"}}
          />
          <div>
            <h4 className="mb-1">{student.name}</h4>
            <div className="text-muted">Application No: {student.application_number}</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="row">
          {/* Left Column */}
          <div className="col-md-6">
            <ProfileItem label="Name" value={student.name} />
            <ProfileItem label="DOB" value={student.dob} />
            <ProfileItem label="Email" value={student.email} />
            <ProfileItem label="Mobile" value={student.mobile_number} />
            <ProfileItem label="Aadhar Number" value={student.aadhar_number} />
            <ProfileItem label="Plan" value={student.plan} />
            <ProfileItem label="Initial Payment Method" value={student.initial_payment_method} />
            <ProfileItem label="Paid Amount" value={student.paid_amount} />
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <ProfileItem label="Total Amount" value={student.total_amount} />
            <ProfileItem label="Balance" value={student.balance} />
            <ProfileItem label="Full Payment Status" value={student.full_payment_status} />
            <ProfileItem label="Instructor Name" value={student.instructor_name} />
            <ProfileItem label="Instructor Mobile" value={student.instructor_mobile} />
            <ProfileItem label="Courses Enrolled" value={student.courseCount} />
            <ProfileItem label="Classes Completed" value={student.classesCompleted} />
          </div>
        </div>
        {/* Payments Table */}
{Array.isArray(student.payments) && student.payments.length > 0 && (
  <div className="mt-4">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h5 className="mb-0">💳 Payment History</h5>
      <Button variant="outline-primary" size="sm" onClick={handlePrintTable}>
        Print Payment Table
      </Button>
    </div>

    <div className="table-responsive" ref={paymentTableRef}>
      <table className="table table-bordered table-sm">
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
      <td>{payment.receipt_no || "-"}</td>
      <td>{payment.amount}</td>
      <td>{new Date(payment.date).toLocaleString()}</td>
      <td>{payment.payment_method || payment.method || "-"}</td>
      <td>{payment.payment_status || payment.status || "-"}</td>
      <td>{payment.remarks || "-"}</td>
      {/* <td>{payment.payment_received_by || "-"}</td> */}
      <td>
        {payment.receipt_no && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handlePrintReceipt(payment.receipt_no)}
          >
            🖨 Print
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
      <Modal.Footer className="justify-content-end">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Reusable row layout
const ProfileItem = ({ label, value }) => (
  <div className="d-flex justify-content-between border-bottom py-2">
    <span className="fw-semibold text-muted">{label}:</span>
    <span className="text-dark">{value || "N/A"}</span>
  </div>
);
