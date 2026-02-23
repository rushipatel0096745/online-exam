import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ExamViewLayout = () => {
    const { examId } = useParams();
    const user = JSON.parse(localStorage.getItem("user"));
    const url = `http://localhost:5000/api/exams/${examId}/questions`;

    const [exam, setExam] = useState({ title: "", time_duration: "" });
    const [examType, setExamType] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState();
    const [subjectQuestions, setSubjectQuestions] = useState([]);
    const [selectQuestion, setSelectQuestion] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [questionsStatus, setQuestionsStatus] = useState([{ questionId: 0, status: "" }]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [lockedSubjects, setLockedSubjects] = useState([]);
    const [examTimer, setExamTimer] = useState(null);
    const [subjectTimers, setSubjectTimers] = useState({});

    // refs
    const examTimerRef = useRef(null);
    const subjectTimerRef = useRef(null);
    const subjectTimersRef = useRef({});
    const lockedSubjectsRef = useRef([]);
    const subjectsRef = useRef([]);
    const examTypeRef = useRef(null);
    const userAnswersRef = useRef([]);

    const navigate = useNavigate();

    useEffect(() => {
        subjectTimersRef.current = subjectTimers;
    }, [subjectTimers]);
    useEffect(() => {
        lockedSubjectsRef.current = lockedSubjects;
    }, [lockedSubjects]);
    useEffect(() => {
        subjectsRef.current = subjects;
    }, [subjects]);
    useEffect(() => {
        examTypeRef.current = examType;
    }, [examType]);
    useEffect(() => {
        userAnswersRef.current = userAnswers;
    }, [userAnswers]);

    function formatTime(seconds) {
        if (!seconds || seconds <= 0) return "00:00";
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    async function fetchQuestions() {
        try {
            const res = await fetch(url);
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            const exam = result.exam;
            setExam({ title: exam.title, time_duration: exam.total_duration_minutes });
            setExamType(exam.exam_type);
            examTypeRef.current = exam.exam_type;
            setSubjects(result.subjects);
            subjectsRef.current = result.subjects;

            setActiveSubject(result.subjects[0]);
            setSubjectQuestions(result.subjects[0]?.questions);
            setSelectQuestion(result.subjects[0]?.questions[0]);

            if (exam.exam_type === "FULL_EXAM") {
                startExamTimer(exam.total_duration_minutes);
            } else {
                const timers = {};
                result.subjects.forEach((sub) => {
                    timers[sub.id] = sub.subject_duration_minutes * 60;
                });
                setSubjectTimers(timers);
                subjectTimersRef.current = { ...timers };
                startSubjectTimer(result.subjects[0]?.id);
            }
        } catch (error) {
            console.log("error when fetching questions: ", error.message);
        }
    }

    function startExamTimer(duration) {
        const totalTime = duration * 60;
        setExamTimer(totalTime);
        clearInterval(examTimerRef.current);
        let remainingTime = totalTime;

        examTimerRef.current = setInterval(() => {
            remainingTime -= 1;
            setExamTimer(remainingTime);
            if (remainingTime <= 0) {
                clearInterval(examTimerRef.current);
                submitExam();
            }
        }, 1000);
    }

    function startSubjectTimer(subjectId) {
        clearInterval(subjectTimerRef.current);

        subjectTimerRef.current = setInterval(() => {
            const current = subjectTimersRef.current[subjectId];

            if (current === undefined || current <= 0) {
                clearInterval(subjectTimerRef.current);
                return;
            }

            const next = current - 1;
            subjectTimersRef.current = { ...subjectTimersRef.current, [subjectId]: next };
            setSubjectTimers((prev) => ({ ...prev, [subjectId]: next }));

            if (next <= 0) {
                clearInterval(subjectTimerRef.current);

                // Locked subject with ref
                const newLocked = [...lockedSubjectsRef.current, subjectId];
                lockedSubjectsRef.current = newLocked;
                setLockedSubjects(newLocked);

                if (newLocked.length >= subjectsRef.current.length) {
                    submitExam();
                } else {
                    gotoNextSubject(newLocked);
                }
            }
        }, 1000);
    }

    function pauseSubjectTimer() {
        clearInterval(subjectTimerRef.current);
    }

    function gotoNextSubject(lockedList = lockedSubjectsRef.current) {
        const remainingSubjects = subjectsRef.current.filter((sub) => !lockedList.includes(sub.id));

        if (remainingSubjects.length > 0) {
            handleSubject(remainingSubjects[0].id);
        }
    }

    function handleSubject(subjectId) {
        if (lockedSubjectsRef.current.includes(subjectId)) return;

        if (examTypeRef.current !== "FULL_EXAM") pauseSubjectTimer();

        const subject = subjectsRef.current.find((s) => s.id === subjectId);
        if (subject) {
            setActiveSubject(subject);
            setSubjectQuestions(subject.questions);
            setSelectQuestion(subject.questions[0]);

            loadSavedAnswer(subject.questions[0]?.id);

            if (examTypeRef.current !== "FULL_EXAM") startSubjectTimer(subjectId);
        }
    }

    function loadSavedAnswer(questionId) {
        const savedAnswer = userAnswersRef.current.find((ans) => ans.questionId === questionId);
        setSelectedOption(savedAnswer ? savedAnswer.selectedOptionId : null);
    }

    function handleQuestion(questionId) {
        const question = subjectQuestions.find((q) => q.id === questionId);
        if (question) {
            setSelectQuestion(question);
            loadSavedAnswer(questionId);
        }
    }

    function goToNextQuestion() {
        const currentIndex = subjectQuestions.findIndex((q) => q.id === selectQuestion?.id);
        console.log(currentIndex, subjectQuestions.length - 1);
        if (currentIndex === subjectQuestions.length - 1) {
            const currentSubjectIdIndex = subjects.findIndex((s) => activeSubject.id === s.id);
            const nextSubject = subjects[currentSubjectIdIndex + 1];
            if (nextSubject) {
                handleSubject(nextSubject?.id);
            }
            return;
        }
        if (currentIndex !== -1) {
            setSelectQuestion(subjectQuestions[currentIndex + 1]);
        }
    }

    function handleOptionChange(event) {
        setSelectedOption(Number(event.target.value));
    }

    function clearSelection() {
        setSelectedOption(null);
    }

    function handleQuestionStatus(questionId, status) {
        const question = questionsStatus.find((que) => que.questionId === questionId);
        if (!question) {
            setQuestionsStatus((prev) => [...prev, { questionId, status }]);
        } else {
            setQuestionsStatus((prev) => prev.map((que) => (que.questionId === questionId ? { ...que, status } : que)));
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
        try {
            const res = await fetch(`http://localhost:5000/api/exams/submit-result/${examId}`, {
                method: "POST",
                body: JSON.stringify({ userId: user.id, answers: userAnswers, examId: examId }),
                headers: { "Content-Type": "application/json" },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            console.log(result);
        } catch (error) {
            console.log("Error in submitting answers", error.message);
        }
    }

    async function submitExam() {
        try {
            await submitAnswers();
            const res = await fetch(`http://localhost:5000/api/exams/user/create`, {
                method: "POST",
                body: JSON.stringify({ examId, userId: user.id }),
                headers: { "Content-Type": "application/json" },
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            navigate("/student/result");
        } catch (error) {
            console.log("Error in submitting exam", error.message);
        }
    }

    useEffect(() => {
        fetchQuestions();
        return () => {
            clearInterval(examTimerRef.current);
            clearInterval(subjectTimerRef.current);
        };
    }, []);

    const activeSubjectTime = activeSubject ? (subjectTimers[activeSubject.id] ?? null) : null;

    return (
        <div className='container-fluid vh-100 d-flex flex-column'>
            {
                // console.log('actice subject: ', activeSubject && activeSubject)
                // console.log('subjects: ', subjects)
            }
            <div className='row border py-2'>
                <div className='col-8'>
                    <h4>{exam.title}</h4>

                    <div className='d-flex flex-wrap gap-2 mt-2'>
                        {subjects.map((subject) => {
                            let btn = 'light'
                            if(activeSubject?.id === subject.id) {
                                btn = 'primary'
                            }
                            const isLocked = lockedSubjects.includes(subject.id);
                            return (
                                <button
                                    key={subject.id}
                                    className={`btn ${isLocked ? "btn-secondary" : `btn btn-${btn}`}`}
                                    onClick={() => handleSubject(subject.id)}
                                    disabled={isLocked}>
                                    {subject.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className='col-4 text-end'>
                    <p className='m-0 fs-5 fw-bold'>{user?.full_name}</p>

                    {examType === "FULL_EXAM" ? (
                        <p className='m-0'>Exam Time left: {formatTime(examTimer)}</p>
                    ) : (
                        <p className='m-0'>Subject Time left: {formatTime(activeSubjectTime)}</p>
                    )}
                </div>
            </div>

            <div className='row flex-grow-1 overflow-hidden'>
                <div className='col-8 border d-flex flex-column overflow-auto'>
                    <div className='mt-3'>
                        <h5>{selectQuestion?.question_text}</h5>
                    </div>

                    <div className='mt-3'>
                        {selectQuestion?.options?.map((opt) => (
                            <div key={opt.id} className='mb-2'>
                                <label>
                                    <input
                                        type='radio'
                                        name='option'
                                        checked={selectedOption === opt.id}
                                        onChange={handleOptionChange}
                                        value={opt.id}
                                    />{" "}
                                    {opt.option_text}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className='mt-auto d-flex justify-content-between py-3'>
                        <div>
                            <button
                                className='btn btn-primary me-2'
                                onClick={() => {
                                    handleQuestionStatus(selectQuestion?.id, "marked-for-review");
                                    goToNextQuestion();
                                }}>
                                Mark for review & Save
                            </button>

                            <button
                                className='btn btn-primary'
                                onClick={() => {
                                    handleQuestionStatus(selectQuestion?.id, "not-answered");
                                    clearSelection();
                                }}>
                                Clear response
                            </button>
                        </div>

                        <button
                            className='btn btn-success'
                            onClick={() => {
                                if (!selectedOption) {
                                    handleQuestionStatus(selectQuestion?.id, "not-answered");
                                } else {
                                    saveAnswer(selectQuestion?.id, selectedOption);
                                    handleQuestionStatus(selectQuestion?.id, "answered");
                                }
                                goToNextQuestion();
                            }}>
                            Save & Next
                        </button>
                    </div>
                </div>

                <div className='col-4 border d-flex flex-column'>
                    <div className='text-center mt-3'>
                        <p className='fw-bold'>Question Palette</p>
                    </div>

                    <div className='flex-grow-1 overflow-auto px-2'>
                        <div className='row g-2'>
                            {subjectQuestions?.map((que, index) => {
                                let btn = "primary";

                                questionsStatus.forEach((ques) => {
                                    if (ques.questionId === que.id) {
                                        if (ques.status === "marked-for-review") btn = "info";
                                        else if (ques.status === "answered") btn = "success";
                                        else btn = "danger";
                                    }
                                });

                                return (
                                    <div className='col-4 text-center' key={que.id}>
                                        <button
                                            className={`btn btn-${btn} w-100`}
                                            onClick={() => handleQuestion(que.id)}>
                                            {index + 1}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='p-3 text-center border-top'>
                        <button className='btn btn-danger w-100' onClick={submitExam}>
                            Submit Exam
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamViewLayout;
