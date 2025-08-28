import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./../Students/Students.css"; // Optional custom styles
import { ToastContainer, toast } from "react-toastify";

export default function StudentTrainingSessionModal({ show, onClose, session }) {


  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>👤 Training Session</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        {/* Two Column Layout */}
        <div className="row">
          {/* Left Column */}
          <div className="col-md-6">
            <ProfileItem label="Name" value={session?.student_name || "Student Name"} />
            <ProfileItem label="Date" value={session?.date || "N/A"} />
            <ProfileItem label="Status" value={session?.status || "N/A"} />
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <ProfileItem label="Instructor Name" value={session?.instructor_name || "Instructor Name"} />
            <ProfileItem label="No of Class" value={session?.num_classes || "N/A"} />
          </div>
        </div>

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
