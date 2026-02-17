import React from "react";
import { Button, ListGroup, Stack } from "react-bootstrap";

const SubjectSidebar = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  onAddSubject,
  onDeleteSubject,
}) => {

  const handleDeleteSubject = (e, subjectId) => {
    e.stopPropagation();
    onDeleteSubject?.(subjectId);
  };

  return (
    <div
      className="d-flex flex-column h-100 border-end"
      style={{
        backgroundColor: "#1e1e2f",
        color: "#e4e6eb"
      }}
    >

      {/* Header */}
      <Stack
        direction="horizontal"
        className="justify-content-between align-items-center px-3 py-3 border-bottom"
        style={{ borderColor: "#2c2f48" }}
      >
        <div>
          <h6 className="mb-0 fw-semibold text-light">Subjects</h6>
          <small className="text-secondary">
            {subjects?.length || 0} total
          </small>
        </div>

        <Button
          size="sm"
          variant="outline-light"
          onClick={onAddSubject}
        >
          + Add
        </Button>
      </Stack>

      {/* Subject List */}
      <div className="flex-grow-1 overflow-auto">

        {subjects && subjects.length > 0 ? (
          <ListGroup variant="flush">

            {subjects.map((subject) => {
              const isActive = selectedSubject?.id === subject.id;

              return (
                <ListGroup.Item
                  key={subject.id}
                  action
                  onClick={() => onSelectSubject?.(subject)}
                  className="d-flex justify-content-between align-items-center px-3 py-3 border-0"
                  style={{
                    cursor: "pointer",
                    backgroundColor: isActive ? "#2c2f48" : "transparent",
                    color: isActive ? "#ffffff" : "#c7c9d1",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div className="d-flex flex-column">
                    <span className="fw-medium text-truncate">
                      {subject.name}
                    </span>
                    {subject.subject_duration_minutes && (
                      <small className="text-secondary">
                        {subject.subject_duration_minutes} mins
                      </small>
                    )}
                  </div>

                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger"
                    style={{ fontSize: "1.1rem" }}
                    onClick={(e) => handleDeleteSubject(e, subject.id)}
                  >
                    ×
                  </Button>
                </ListGroup.Item>
              );
            })}

          </ListGroup>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center text-secondary text-center py-5 px-3">
            <p className="mb-1">No subjects yet</p>
            <small>Click + Add to create one</small>
          </div>
        )}

      </div>
    </div>
  );
};

export default SubjectSidebar;