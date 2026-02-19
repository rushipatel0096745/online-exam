import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";

const SubjectModal = ({ examId, show, onClose, onSuccess, mode }) => {
    const url = "http://localhost:5000/api";

    const [name, setName] = useState("");
    const [duration, setDuration] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleClose = () => {
        // Reset state on close
        setName("");
        setError(null);
        setSubmitting(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        if (mode === "create") {
            e.preventDefault();
            if (!name.trim()) {
                setError("Subject name is required.");
                return;
            }

            setSubmitting(true);
            setError(null);

            try {
                const res = await fetch(`${url}/exams/${examId}/subjects`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        subject_duration_minutes: duration,
                    }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || "Failed to create subject.");
                }

                const data = await res.json();
                onSuccess(data.data);
                handleClose();
            } catch (err) {
                setError(err.message);
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Subject</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant='danger' dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    <Form.Group controlId='subjectName'>
                        {" "}
                        <Form.Label>Subject Name</Form.Label>{" "}
                        <Form.Control
                            type='text'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={submitting}
                            autoFocus
                        />{" "}
                    </Form.Group>
                    <Form.Group controlId='subjectDuration' className='mt-3'>
                        <Form.Label>Duration (minutes)</Form.Label>
                        <Form.Control
                            type='number'
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            disabled={submitting}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant='secondary' onClick={handleClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant='primary' type='submit' disabled={submitting}>
                        {submitting ? (
                            <>
                                <Spinner animation='border' size='sm' className='me-2' />
                                Saving...
                            </>
                        ) : (
                            "Add Subject"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default SubjectModal;
