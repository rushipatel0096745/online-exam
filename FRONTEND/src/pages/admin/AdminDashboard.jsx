import React, { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { Link } from "react-router-dom";
import ExamCreate from "./ExamCreate";

const AdminDashboard = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;

    const [examList, setExamList] = useState([]);

    function handleAddExam(newExam) {
        setExamList((prev) => [...prev, newExam])
    }

    const getExamsUrl = "http://localhost:5000/api/exams/users/" + userId;

    useEffect(() => {
        fetch(getExamsUrl)
            .then((res) => res.json())
            .then((data) => {
                setExamList(data.data)
                console.log(data.data)
            });
    }, [getExamsUrl]);

    return (
        <div className='container'>
            {/* list all exams created */}
            <h1>Admin dashboard</h1>
            <div className='row h-75 overflow-y-auto'>
                {examList.map((exam) => {
                    return (
                        <div className='col-3' key={exam.id}>
                            <div className='card border-dark mb-3' style={{ maxWidth: "18rem" }}>
                                <div className='card-header'>Exam ID: #{exam.id}</div>
                                <div className='card-body'>
                                    <h5 className='card-title'>{exam.title}</h5>
                                    <p className='card-text'>Creted On: {exam.created_at}</p>
                                    <div className='d-flex justify-content-between'>
                                        <button className='btn btn-primary'>
                                            {exam.is_active ? "Activated" : "Active"}
                                        </button>
                                        <Link className='btn btn-primary' to={`/admin/exam/${exam.id}/create`}>
                                            Go to Exam
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className='row'>
                <div className='col-12'>
                    <ExamCreate onAddExam={handleAddExam}/>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
