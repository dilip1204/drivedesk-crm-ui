/** @jsxRuntime classic */
import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./ProfileModal.css";

const getStatusClass = (value) => {
  const status = String(value || "").toLowerCase();

  if (status.includes("cancel") || status.includes("inactive") || status.includes("miss")) {
    return "is-danger";
  }

  if (status.includes("contact") || status.includes("complete") || status.includes("active")) {
    return "is-success";
  }

  if (status.includes("pending") || status.includes("follow")) {
    return "is-warning";
  }

  return "is-neutral";
};

const hasValue = (value) => value !== undefined && value !== null && value !== "";

export default function ProfileModal({ show, onClose, title, avatar, data = [], variant = "default" }) {
  const name = data.find((item) => item.label === "Name")?.value || title || "Profile";
  const subtitle =
    data.find((item) => item.label === "Application No")?.value ||
    data.find((item) => item.label === "Mobile Number")?.value ||
    "Profile information";

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      dialogClassName={`profile-modal-dialog profile-modal-${variant}`}
    >
      <Modal.Header closeButton className="profile-modal-header">
        <span className="profile-modal-title-icon" aria-hidden="true">
          <i className="bi bi-person-vcard" />
        </span>
        <Modal.Title>{title || "Profile"}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="profile-modal-body">
        <div className="profile-modal-summary">
          <img src={avatar} alt="Avatar" className="profile-modal-avatar" />
          <div className="profile-modal-summary-copy">
            <span className="profile-modal-eyebrow">Profile details</span>
            <h4>{name}</h4>
            <div>{subtitle}</div>
          </div>
        </div>

        <div className="profile-modal-details">
          {data.length > 0 &&
            data.map((item, index) => {
              const isStatus = item.label.toLowerCase().includes("status");
              const displayValue = hasValue(item.value) ? item.value : "N/A";

              return (
                <div
                  className="profile-modal-item"
                  key={`${item.label}-${index}`}
                >
                  <span className="profile-modal-label">{item.label}</span>
                  {isStatus ? (
                    <span className={`profile-modal-status ${getStatusClass(displayValue)}`}>
                      {displayValue}
                    </span>
                  ) : (
                    <strong>{displayValue}</strong>
                  )}
                </div>
              );
            })}
        </div>
      </Modal.Body>

      <Modal.Footer className="profile-modal-footer">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
