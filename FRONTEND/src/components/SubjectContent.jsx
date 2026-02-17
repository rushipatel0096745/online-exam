import { useState } from "react";
import { Button, Card } from "react-bootstrap";
import AddQuestionModal from "./AddQuestionModal";

const SubjectContent = ({ subject, onAddQuestion }) => {

  const [showModal, setShowModal] = useState(false);

  return (
    <div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-light mb-1">{subject.name}</h4>
          <small className="text-secondary">
            Duration: {subject.subject_duration_minutes} mins
          </small>
        </div>

        <Button variant="outline-light" onClick={() => setShowModal(true)}>
          + Add Question
        </Button>
      </div>

      {/* Question List */}
      {subject.questions && subject.questions.length > 0 ? (
        subject.questions.map((q) => (
          <Card
            key={q.id}
            bg="dark"
            text="light"
            className="mb-3 border-secondary"
          >
            <Card.Body>
              <div className="fw-medium">{q.question_text}</div>
              <small className="text-secondary">
                Marks: {q.marks}
              </small>
            </Card.Body>
          </Card>
        ))
      ) : (
        <div className="text-secondary text-center mt-5">
          No questions yet. Click "Add Question".
        </div>
      )}

      {/* Modal */}
      <AddQuestionModal
        subjectId={subject.id}
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={onAddQuestion}
      />
    </div>
  );
};

export default SubjectContent;