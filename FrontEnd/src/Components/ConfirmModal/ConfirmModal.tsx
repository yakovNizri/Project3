import { Modal, Button } from "react-bootstrap";
import "./ConfirmModal.css";

interface ConfirmModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    message: string;
}

const ConfirmModal = ({ show, onConfirm, onCancel, message }: ConfirmModalProps) => {
    return (
        <Modal show={show} onHide={onCancel} backdropClassName="custom-backdrop">
            <Modal.Header closeButton>
                <Modal.Title>Delete vacation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    No
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Yes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
