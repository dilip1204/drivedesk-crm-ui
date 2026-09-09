import React from "react";
import { Modal, Button } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "./TrainingSessionModals.css";

export default function StudentTrainingSessionModal({ show, onClose, session }) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      dialogClassName="student-session-dialog"
    >
      <Modal.Header closeButton className="session-form-header">
        <Modal.Title>
          <i className="bi bi-person-circle" aria-hidden="true" />
          Training Session
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="student-session-body">
        <div className="row">
          <div className="col-md-6">
            <ProfileItem label="Name" value={session?.student_name || "Student Name"} />
            <ProfileItem label="Date" value={session?.date || "N/A"} />
            <ProfileItem label="Status" value={session?.status || "N/A"} />
          </div>

          <div className="col-md-6">
            <ProfileItem
              label="Instructor Name"
              value={session?.instructor_name || "Instructor Name"}
            />
            <ProfileItem label="No of Class" value={session?.attended_days ?? "N/A"} />
            <ProfileItem label="Remarks" value={session?.remarks || "N/A"} />
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
      <Modal.Footer className="student-session-footer">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const ProfileItem = ({ label, value }) => (
  <div className="student-session-item">
    <span className="student-session-label">{label}</span>
    <span className="student-session-value">
      {value === null || value === undefined || value === "" ? "N/A" : value}
    </span>
  </div>
);
