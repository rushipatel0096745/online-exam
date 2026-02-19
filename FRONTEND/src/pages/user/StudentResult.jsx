import React, { useEffect, useState } from "react";

const StudentResult = () => {
    const [examList, seetExamList] = useState();
    const [activeExam, setActiveExam] = useState();
    const [result, setResult] = useState();
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);

    const user = localStorage.getItem("user");

    const url = "http://localhost:5000/api/exams";

    async function fetchExamList() {
        const res = await fetch(`${url}/user/exams`, {
            method: "POST",
            body: JSON.stringify({
                userId: user.id,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await res.json();
        console.log("exam list: ", result);
        seetExamList(result.data);
        setActiveExam(result?.data[result.data.length - 1]);
    }

    async function fetchResultData() {
        const res = await fetch(`${url}/results/result`, {
            method: "POST",
            body: JSON.stringify({
                examId: activeExam?.exam_id,
                userId: user.id,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = await res.json();
        console.log(result);
        setScore(result?.score);
        setResult(result.resultData);
    }

    async function fetchUserAnswers() {
        const res = await fetch(`${url}/user/answers`, {
            method: "POST",
            body: JSON.stringify({
                userId: user.id,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = await res.json();
        console.log(result);
        setUserAnswers(result.data);
    }

    function handleExam(exam) {
        setActiveExam(exam);
    }

    useEffect(() => {
        fetchExamList();
        fetchUserAnswers();
        activeExam && fetchResultData();
    }, [activeExam]);

    return (
        <div className='container'>
            <div className='result'>
                <h2>Results</h2>
            </div>
            <div className='row'>
                {examList?.map((exam) => {
                    return (
                        <button
                            className='btn btn-primary'
                            onClick={() => {
                                handleExam(exam);
                            }}>
                            {exam?.title}
                        </button>
                    );
                })}
                <div className='col-4'>
                    <div className='row'>
                        <p>Exam name: {activeExam?.title}</p>
                        <p>Time duration: {activeExam?.total_time}</p>
                    </div>
                    <div className='row'>
                        {result?.map((res) => {
                            return (
                                <>
                                    <div className='row'>
                                        <p>Subject name : {res?.name}</p>
                                        <p>Time duration : {res?.subject_duration_minutes}</p>
                                    </div>
                                    <div className='row'>
                                        <table class='table'>
                                            <thead>
                                                <tr>
                                                    <th scope='col'>#q_id</th>
                                                    <th scope='col'>Question</th>
                                                    <th scope='col'>Answer</th>
                                                    <th scope='col'>Marked Answer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {res?.map((que) => {
                                                    const flag = userAnswers?.find(
                                                        (ans) => ans?.question_id === que?.id
                                                    );
                                                    return (
                                                        <>
                                                            <tr>
                                                                <th scope='row'>{que?.id}</th>
                                                                <td>{que?.question_text}</td>
                                                                <td>{que?.options[0]?.option_text}</td>
                                                                <td>{flag ? flag.option_text : "not answered"}</td>
                                                            </tr>
                                                        </>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentResult;
