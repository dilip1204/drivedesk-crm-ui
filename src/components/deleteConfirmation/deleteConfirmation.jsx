import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const DeleteConfirmation = ({
    showDeleteModal,
    hideDeleteModal,
    confirmModal,
    id,
    message
}) => {
    
    const handleConfirmClick = () => { console.info('id......', id)
        confirmModal(id);
    }

    return(
        <Modal show={showDeleteModal} onHide={hideDeleteModal}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="alert alert-danger">{message}</div>
               
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={hideDeleteModal}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirmClick}>
                    Yes
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteConfirmation;
