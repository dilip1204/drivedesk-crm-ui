import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./deleteConfirmation.css";

const DeleteConfirmation = ({
    showDeleteModal,
    hideDeleteModal,
    confirmModal,
    id,
    message
}) => {
    
    const handleConfirmClick = () => {
        confirmModal(id);
    }

    return(
        <Modal
            show={showDeleteModal}
            onHide={hideDeleteModal}
            centered
            dialogClassName="delete-confirmation-dialog"
        >
            <Modal.Header closeButton className="delete-confirmation-header">
                <Modal.Title>Delete Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body className="delete-confirmation-body">
                <div className="delete-confirmation-content">
                    <span className="delete-confirmation-icon" aria-hidden="true">
                        <i className="bi bi-exclamation-triangle-fill" />
                    </span>
                    <div className="delete-confirmation-copy">
                        <p>{message}</p>
                        <small>This action cannot be undone.</small>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="delete-confirmation-footer">
                <Button variant="secondary" className="delete-confirmation-cancel" onClick={hideDeleteModal}>
                    <i className="mdi mdi-close" aria-hidden="true" />
                    <span>Cancel</span>
                </Button>
                <Button variant="danger" className="delete-confirmation-delete" onClick={handleConfirmClick}>
                    <i className="mdi mdi-delete" aria-hidden="true" />
                    <span>Delete</span>
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteConfirmation;
