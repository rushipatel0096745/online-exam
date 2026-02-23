import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

const StudentResult = () => {
    const [examList, setExamList] = useState([]);
    const [activeExam, setActiveExam] = useState(null);
    const [result, setResult] = useState([]);
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    const url = "http://localhost:5000/api/exams";

    async function fetchExamList() {
        const res = await fetch(`${url}/user/exams`, {
            method: "POST",
            body: JSON.stringify({ userId: user.id }),
            headers: { "Content-Type": "application/json" },
        });
        const result = await res.json();
        setExamList(result.data);
        setActiveExam(result?.data[result.data.length - 1]);
    }

    async function fetchResultData() {
        const res = await fetch(`${url}/results/result`, {
            method: "POST",
            body: JSON.stringify({
                examId: activeExam?.exam_id,
                userId: user.id,
            }),
            headers: { "Content-Type": "application/json" },
        });
        const result = await res.json();
        setScore(result?.score);
        setResult(result.resultData);
    }

    async function fetchUserAnswers() {
        const res = await fetch(`${url}/user/answers`, {
            method: "POST",
            body: JSON.stringify({ userId: user.id }),
            headers: { "Content-Type": "application/json" },
        });
        const result = await res.json();
        setUserAnswers(result.data);
    }

    function handleExam(exam) {
        setActiveExam(exam);
    }

    useEffect(() => {
        fetchExamList();
        fetchUserAnswers();
    }, []);
    useEffect(() => {
        if (activeExam) fetchResultData();
    }, [activeExam]);
    return (
        <>
            <Navbar />
            <div className='container'>
                <div className='row'>
                    <h1>Results</h1>
                    {examList?.map((exam) => (
                        <div className='exam-list col-2' key={exam?.exam_id}>
                            <button className='btn btn-primary' onClick={() => handleExam(exam)}>
                                {exam?.title}
                            </button>
                        </div>
                    ))}
                </div>
                <div className='row mt-5'>
                    <div className='result-header'>
                        <div className='result-details'>
                            <h3 className='mt-3'>Result details</h3>
                            <p>Exam name: {activeExam?.title}</p>
                            <p>Time duration: {activeExam?.total_time}</p>
                            <p className='fs-2'>
                                <b>Total score: {score}</b>
                            </p>
                        </div>
                    </div>
                </div>
                <div className='row result-table'>
                    {result?.map((subject) => (
                        <div key={subject.id} className="d-flex flex-column">
                            <div className=''>
                                <h5>Subject name : {subject?.name}</h5>
                                {/* <p>Time duration : {subject?.subject_duration_minutes}</p> */}
                            </div>
                            <div className='row'>
                                <table className='table table-bordered mb-5'>
                                    <thead>
                                        <tr>
                                            <th scope='col'>#q_id</th>
                                            <th scope='col'>Question</th>
                                            <th scope='col'>Correct Answer</th>
                                            <th scope='col'>Submitted Answer</th>
                                            <th scope='col'>Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subject?.questions?.map((que) => {
                                            const flag = userAnswers?.find((ans) => ans?.question_id === que?.id);
                                            return (
                                                <tr key={que?.id}>
                                                    <th scope='row'>{que?.id}</th>
                                                    <td>{que?.question_text}</td>
                                                    <td>{que?.options[0]?.option_text}</td>
                                                    <td>{flag ? flag.option_text : "Not Answered"}</td>
                                                    <td>{que?.marks}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default StudentResult;
