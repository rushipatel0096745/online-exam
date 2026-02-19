import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const StudentDashboard = () => {
    const [exams, setExams] = useState([]);
    const [activeExam, setActiveExam] = useState();
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    async function fetchExams() {
        const res = await fetch("http://localhost:5000/api/exams/");
        const result = await res.json();
        console.log(result);
        setExams(result.data);
    }

    function handleModal(exam) {
        handleShow();
        setActiveExam(exam)
    }

    useEffect(() => {
        fetchExams();
    }, []);

    return (
        <div className='container-fluid'>
            <Navbar />
            <div className='container h-50'>
                <h1 className='mb-4 mt-4'>All the exams</h1>
                <div className='row h-75 overflow-y-auto'>
                    {exams.map((exam) => {
                        return (
                            <div className='col-3' key={exam.id}>
                                <div className='card border-dark mb-3' style={{ maxWidth: "18rem" }}>
                                    <div className='card-header'>Exam ID: #{exam.id}</div>
                                    <div className='card-body'>
                                        <h5 className='card-title'>{exam.title}</h5>
                                        <p className='card-text'>Creted On: {exam.created_at}</p>
                                        <div className='d-flex justify-content-between'>
                                            <button className='btn btn-primary' onClick={() => {handleModal(exam)}}>
                                                Start exam
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* modal for start exam */}
            <Modal show={show} onHide={handleClose} backdrop='static' keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{activeExam?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>Start the exam ?</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleClose}>
                        Close
                    </Button>
                    <Link to={`/student/exam/${activeExam?.id}`} className="btn btn-primary" variant='primary'>Start</Link>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default StudentDashboard;
