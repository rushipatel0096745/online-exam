import React, { useEffect, useState } from "react";

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
        <div className='container'>
            <div className='result'>
                <h2>Results</h2>
                <h4>Score: {score}</h4>
            </div>
            <div className='row'>
                {examList?.map((exam) => (
                    <button
                        key={exam.exam_id}
                        className='btn btn-primary'
                        onClick={() => handleExam(exam)}>
                        {exam?.title}
                    </button>
                ))}

                <div className='col-4'>
                    <div className='row'>
                        <p>Exam name: {activeExam?.title}</p>
                        <p>Time duration: {activeExam?.total_time}</p>
                    </div>
                    <div className='row'>
                        {result?.map((subject) => (
                            <div key={subject.id}>
                                <div className='row'>
                                    <p>Subject name : {subject?.name}</p>
                                    <p>Time duration : {subject?.subject_duration_minutes}</p>
                                </div>
                                <div className='row'>
                                    <table className='table'>
                                        <thead>
                                            <tr>
                                                <th scope='col'>#q_id</th>
                                                <th scope='col'>Question</th>
                                                <th scope='col'>Correct Answer</th>
                                                <th scope='col'>Marked Answer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subject?.questions?.map((que) => {
                                                const flag = userAnswers?.find(
                                                    (ans) => ans?.question_id === que?.id
                                                );
                                                return (
                                                    <tr key={que?.id}>
                                                        <th scope='row'>{que?.id}</th>
                                                        <td>{que?.question_text}</td>
                                                        
                                                        <td>{que?.options[0]?.option_text}</td>
                                                        <td>{flag ? flag.option_text : "Not Answered"}</td>
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
            </div>
        </div>
    );
};

export default StudentResult;