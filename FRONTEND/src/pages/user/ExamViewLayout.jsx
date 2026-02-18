import React, { useEffect, useState } from "react";

const ExamViewLayout = () => {
    const url = "http://localhost:5000/api/exams/4/questions";

    const [exam, setExam] = useState({ title: "", time_duration: "" });
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState();
    const [subjectQuestions, setSubjectQuestions] = useState([]);
    const [selectQuestion, setSelectQuestion] = useState({});

    async function fetchQuestions() {
        try {
            const res = await fetch(url);
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message);
            }
            console.log(result);
            const exam = result.exam;
            setExam({ title: exam.title, time_duration: exam.total_duration_minutes });
            setSubjects(result.subjects);
            setActiveSubject(result.subjects[0]);
            setSubjectQuestions(result.subjects[0]?.questions);
            setSelectQuestion(result.subjects[0]?.questions[0]);
        } catch (error) {
            console.log("error when fetching questions: ", error.data);
        }
    }

    function handleSubject(subjectId) {
        subjects.map((subject) => {
            if (subject.id === subjectId) {
                setActiveSubject(subject);
                setSubjectQuestions(subject?.questions);
                setSelectQuestion(subject?.questions[0]);
            }
        });
    }

    function handleQuestion(questionId) {
        subjectQuestions.map((que) => {
            if (que.id === questionId) {
                setSelectQuestion(que);
            }
        });
    }

    useEffect(() => {
        fetchQuestions();
    }, []);

    return (
        <div className='container-fluid h-100'>
            <div className='row h-30'>
                <div className='col-8 border'>
                    <div>
                        <h4>{exam.title}</h4>
                    </div>
                    {/* for subjects */}
                    <div className='d-flex flex-end'>
                        {subjects.map((subject) => (
                            <div className='sub-btn' key={subject.id}>
                                <button className='btn btn-primary' onClick={() => handleSubject(subject.id)}>
                                    {subject.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='col-4 border'>
                    {/* for user info and timer */}
                    <div>
                        <p>John smith</p>
                    </div>
                    <div>
                        <p>Total timer: {exam.time_duration}</p>
                        <p>Subject timer: {activeSubject?.subject_duration_minutes}</p>
                    </div>
                </div>
            </div>
            <div className='row h-70'>
                <div className='col-8 border'>
                    <div className='question mt-2'>{selectQuestion.question_text}</div>
                    <div className='options mt-3'>
                        {selectQuestion.options.map((opt) => {
                            return (
                                <div className='option'>
                                    <label htmlFor=''>
                                        <input type='radio' name='option' /> {opt.option_text}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
        
                    <div className='save-response d-flex justify-content-between mt-3 mb-2'>
                        <div className='mark-review'>
                            <button className='btn btn-primary mx-2'> Mark for review & Save</button>
                            <button className='btn btn-primary'>clear response</button>
                        </div>
                        <div className='save'>
                            <button className='btn btn-primary'>Save & next</button>
                        </div>
                    </div>
                </div>
                <div className='col-4 border'>
                    {/* pallete for question */}
                    <div className='question-pallet'>
                        <p className='text-center'>Question pallet</p>
                        <div className='row g-4 text-center'>
                            {subjectQuestions?.map((que, index) => {
                                return (
                                    <div className='pal-btn col-4' key={que.id}>
                                        <button
                                            className='btn btn-primary col-4'
                                            onClick={() => {
                                                handleQuestion(que.id);
                                            }}>
                                            {index + 1}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamViewLayout;
