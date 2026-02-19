import React, { useEffect, useState } from "react";
import { useExam } from "../../context/useExam";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const ExamViewLayout = () => {
    const { examId } = useParams();

    // const { user } = useAuth();

    const user = JSON.parse(localStorage.getItem('user'));

    const url = `http://localhost:5000/api/exams/${examId}/questions`;

    const [exam, setExam] = useState({ title: "", time_duration: "" });
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState();
    const [subjectQuestions, setSubjectQuestions] = useState([]);
    const [selectQuestion, setSelectQuestion] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [questionsStatus, setQuestionsStatus] = useState([{ questionId: 0, status: "" }]);
    const [userAnswers, setUserAnswers] = useState([]);

    const {
        markForReviewQs,
        // userAnswers,
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
            setExam({
                title: exam.title,
                time_duration: exam.total_duration_minutes,
            });
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
        const question = subjectQuestions.find((q) => q.id === questionId);

        if (question) {
            setSelectQuestion(question);

            const savedAnswer = userAnswers.find((ans) => ans.questionId === questionId);

            setSelectedOption(savedAnswer ? savedAnswer.selectedOptionId : null);
        }
    }

    function goToNextQuestion() {
        const currentIndex = subjectQuestions.findIndex((q) => q.id === selectQuestion?.id);

        if (currentIndex !== -1 && currentIndex < subjectQuestions.length - 1) {
            const nextQuestion = subjectQuestions[currentIndex + 1];
            setSelectQuestion(nextQuestion);
            // setSelectedOption(null);
        }
    }

    function handleOptionChange(event) {
        setSelectedOption(Number(event.target.value));
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

    function saveAnswer(questionId, optionId) {
        setUserAnswers((prev) => {
            const existing = prev.find((ans) => ans.questionId === questionId);

            if (existing) {
                return prev.map((ans) =>
                    ans.questionId === questionId ? { ...ans, selectedOptionId: optionId } : ans
                );
            } else {
                return [...prev, { questionId, selectedOptionId: optionId }];
            }
        });
    }

    async function submitAnswers() {
        console.log(userAnswers)
        try {
            const res = await fetch(`http://localhost:5000/api/exams/submit-result/${examId}`, {
                method: "POST",
                body: JSON.stringify({userId: user.id, answers: userAnswers}),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const result = await res.json();

            if(!res.ok) {
                throw new Error(result.message)
            }

            console.log(result)

        } catch (error) {
            console.log("Error in submitting answers", error.message)
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
                        <p>
                            <b className='fs-3'>{user.full_name}</b>
                        </p>
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
                                            checked={selectedOption === opt.id}
                                            onChange={handleOptionChange}
                                            id={`opt-${opt.id}`}
                                            value={opt.id}
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
                                    goToNextQuestion();
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
                                        saveAnswer(selectQuestion?.id, selectedOption);
                                        handleQuestionStatus(selectQuestion?.id, "answered");
                                    }
                                    goToNextQuestion();
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
                    <div className='row mt-5 mb-2'>
                        <div className='col-12 text-center'>
                            <button className='btn btn-primary' onClick={submitAnswers}>Submit</button>
                            {/* <Link className='btn btn-primary' to={'/student/result'}>Submit</Link> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamViewLayout;
