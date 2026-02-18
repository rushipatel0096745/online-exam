import React, { useEffect, useState } from "react";
import { useExam } from "../../context/useExam";

const ExamViewLayout = () => {
    const url = "http://localhost:5000/api/exams/4/questions";

    const [exam, setExam] = useState({ title: "", time_duration: "" });
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState();
    const [subjectQuestions, setSubjectQuestions] = useState([]);
    const [selectQuestion, setSelectQuestion] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [questionsStatus, setQuestionsStatus] = useState([{ questionId: 0, status: "" }]);

    const {
        markForReviewQs,
        userAnswers,
        notAnsweredQs,
        handleMarkForReview,
        handleSaveNext,
        handleClearResponse,
        handleNotAnswered,
    } = useExam();

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

    function handleOptionChange(event) {
        setSelectedOption(event.target.value);
    }

    function clearSelection() {
        setSelectedOption(null);
    }

    function handleQuestionStatus(questionId, status) {
        let question = questionsStatus.find((que) => que.questionId === questionId);

        if (!question) {
            setQuestionsStatus((prev) => [...prev, { questionId: questionId, status: status }]);
        } else {
            setQuestionsStatus(
                questionsStatus.map((que) => {
                    if (que.questionId === questionId) {
                        return { ...que, status: status };
                    } else {
                        return que;
                    }
                })
            );
        }
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
                    <div className='question mt-2'>{selectQuestion?.question_text}</div>
                    <div className='options mt-3'>
                        {selectQuestion?.options?.map((opt) => {
                            return (
                                <div className='option' key={opt.id}>
                                    <label htmlFor={`opt-${opt.id}`}>
                                        <input
                                            type='radio'
                                            name='option'
                                            checked={selectedOption === opt.option_text}
                                            onChange={handleOptionChange}
                                            id={`opt-${opt.id}`}
                                            value={opt.option_text}
                                        />{" "}
                                        {opt.option_text}
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className='save-response d-flex justify-content-between mt-3 mb-2'>
                        <div className='mark-review'>
                            <button
                                className='btn btn-primary mx-2'
                                onClick={() => {
                                    handleQuestionStatus(selectQuestion?.id, "marked-for-review");
                                    // handleMarkForReview(selectQuestion?.id);

                                    // let nextQuestionId = 0;

                                    // subjectQuestions.map((que, index) => {
                                    //     if (que.id === selectQuestion?.id) {
                                    //         nextQuestionId = selectQuestion[index + 1]?.id;
                                    //     }
                                    // });
                                    // handleQuestion(nextQuestionId);
                                }}>
                                {" "}
                                Mark for review & Save
                            </button>
                            <button
                                className='btn btn-primary'
                                onClick={() => {
                                    handleClearResponse(selectQuestion?.id);
                                    handleQuestionStatus(selectQuestion?.id, "not-answered");
                                    clearSelection();
                                }}>
                                clear response
                            </button>
                        </div>
                        <div className='save'>
                            <button
                                className='btn btn-primary'
                                onClick={() => {
                                    if (!selectedOption) {
                                        handleQuestionStatus(selectQuestion?.id, "not-answered");
                                    } else {
                                        handleQuestionStatus(selectQuestion?.id, "answered");
                                    }
                                }}>
                                Save & next
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-4 border'>
                    {/* pallete for question */}
                    <div className='question-pallet'>
                        <p className='text-center'>Question pallet</p>
                        <div className='row g-4 text-center'>
                            {/* {subjectQuestions?.map((que, index) => {
                                let btn = "primary";
                                if (markForReviewQs.includes(que.id)) {
                                    btn = "info";
                                }
                                if (userAnswers.some((ans) => ans.question_id === que.id)) {
                                    btn = "success";
                                }
                                if (notAnsweredQs.includes(que.id)) {
                                    btn = "danger";
                                }

                                return (
                                    <div className='pal-btn col-4' key={que.id}>
                                        <button
                                            className={`btn btn-${btn} col-4`}
                                            onClick={() => {
                                                handleQuestion(que.id);
                                            }}>
                                            {index + 1}
                                        </button>
                                    </div>
                                );
                            })} */}
                            {subjectQuestions?.map((que, index) => {
                                let btn = "primary";

                                questionsStatus.map((ques) => {
                                    if (ques.questionId === que.id) {
                                        if (ques.status === "marked-for-review") {
                                            btn = "info";
                                        } else if (ques.status === "answered") {
                                            btn = "success";
                                        } else {
                                            btn = "danger";
                                        }
                                    }
                                });

                                return (
                                    <div className='pal-btn col-4' key={que.id}>
                                        <button
                                            className={`btn btn-${btn} col-4`}
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
