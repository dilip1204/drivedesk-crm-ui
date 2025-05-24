import React from "react";
import { Modal, Button } from "react-bootstrap";
//import "./ProfileModal.css";

export default function ProfileModal({ show, onClose, title, avatar, data = [] }) {
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || "Profile"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        {/* Avatar + Header */}
        <div className="d-flex align-items-center mb-4 border-bottom pb-3">
          <img
            src={avatar}
            alt="Avatar"
            className="rounded-circle me-3"
            style={{ width: 80, height: 80, objectFit: "cover" }}
          />
          <div>
            <h4 className="mb-1">{data.find(item => item.label === "Name")?.value || title}</h4>
            <div className="text-muted">{data.find(item => item.label === "Application No")?.value || ""}</div>
          </div>
        </div>

        {/* Two Column Fields */}
        <div className="row">
          {data.length > 0 &&
            [0, 1].map(col => (
              <div className="col-md-6" key={col}>
                {data
                  .filter((_, index) => index % 2 === col)
                  .map((item, idx) => (
                    <div className="d-flex justify-content-between border-bottom py-2" key={idx}>
                      <span className="fw-semibold text-muted">{item.label}:</span>
                      <span className="text-dark">{item.value || "N/A"}</span>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
