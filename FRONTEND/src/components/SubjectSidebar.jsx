import React, { useState } from "react";
import "./SubjectSidebar.css";

const SubjectSidebar = ({ subjects, onSelectSubject, onAddSubject, onDeleteSubject }) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);

    const handleSelectSubject = (subject) => {
        setSelectedSubjectId(subject.id);
        if (onSelectSubject) {
            onSelectSubject(subject);
        }
    };

    const handleDeleteSubject = (e, subjectId) => {
        e.stopPropagation();
        if (onDeleteSubject) {
            onDeleteSubject(subjectId);
        }
    };

    return (
        <div className='sidebar-container'>
            <div className='sidebar-header'>
                <h5 className='mb-0'>Subjects</h5>
                <button className='btn btn-sm btn-primary ms-auto' onClick={onAddSubject}>
                    + Add
                </button>
            </div>

            <div className='subject-list'>
                {subjects && subjects.length > 0 ? (
                    subjects.map((subject) => (
                        <div
                            key={subject.id}
                            className={`subject-item ${selectedSubjectId === subject.id ? "active" : ""}`}
                            onClick={() => handleSelectSubject(subject)}>
                            <div className='subject-content'>
                                <h6 className='subject-name'>{subject.name}</h6>
                            </div>
                            <button
                                className='btn-delete'
                                onClick={(e) => handleDeleteSubject(e, subject.id)}
                                title='Delete subject'>
                                ×
                            </button>
                        </div>
                    ))
                ) : (
                    <div className='empty-state'>
                        <p>No subjects yet</p>
                        <small>Click "Add" to create one</small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectSidebar;
