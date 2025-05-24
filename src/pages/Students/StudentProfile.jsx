import React from "react";
import { Modal, Button } from "react-bootstrap";
import avatar from "../../assets/img/avatar.png";
import "./Students.css"; // Optional custom styles

export default function StudentProfileModal({ show, onClose, student }) {
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
