import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const AddQuestionModal = ({ subjectId, show, onClose, onSuccess }) => {

  const url = "http://localhost:5000/api/exams";

  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [options, setOptions] = useState([
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ]);
  const [error, setError] = useState(null);

  const handleCorrectSelect = (index) => {
    setOptions(prev =>
      prev.map((opt, i) => ({
        ...opt,
        is_correct: i === index
      }))
    );
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index].text = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const correctCount = options.filter(o => o.is_correct).length;
    if (correctCount !== 1) {
      return setError("Select exactly one correct option.");
    }

    try {
      const res = await fetch(`${url}/subjects/${subjectId}/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: questionText,
          marks,
          negative_marks: negativeMarks,
          options: options.map(o => ({
            option_text: o.text,
            is_correct: o.is_correct
          }))
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create question");
      }

      const data = await res.json();
      onSuccess(data.data);
      onClose();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Question</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Question</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </Form.Group>

          <div className="row mb-3">
            <div className="col">
              <Form.Label>Marks</Form.Label>
              <Form.Control
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </div>

            <div className="col">
              <Form.Label>Negative Marks</Form.Label>
              <Form.Control
                type="number"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(e.target.value)}
              />
            </div>
          </div>

          <Form.Label>Options</Form.Label>

          {options.map((opt, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <Form.Check
                type="radio"
                name="correctOption"
                className="me-2"
                checked={opt.is_correct}
                onChange={() => handleCorrectSelect(index)}
              />
              <Form.Control
                type="text"
                value={opt.text}
                onChange={(e) =>
                  handleOptionChange(index, e.target.value)
                }
              />
            </div>
          ))}

        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Question
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddQuestionModal;