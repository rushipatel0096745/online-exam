import React, { useEffect, useState } from "react";

const ExamViewLayout = () => {
  const url = "http://localhost:5000/api/exams/7/questions";

  const [exam, setExam] = useState({ title: "", time_duration: "" });
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState();
  const [subjectQuestions, setSubjectQuestions] = useState([]);
  const [selectQuestion, setSelectQuestion] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionsStatus, setQuestionsStatus] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);

  // timer states
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [subjectTimers, setSubjectTimers] = useState({});

  async function fetchQuestions() {
    try {
      const res = await fetch(url);
      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      const exam = result.exam;

      setExam({
        title: exam.title,
        time_duration: exam.total_duration_minutes,
      });

      setSubjects(result.subjects);
      setActiveSubject(result.subjects[0]);
      setSubjectQuestions(result.subjects[0]?.questions);
      setSelectQuestion(result.subjects[0]?.questions[0]);

      // initialize total exam timer
      setExamTimeLeft(exam.total_duration_minutes * 60);

      // initialize subject timers
      const timers = {};
      result.subjects.forEach((sub) => {
        timers[sub.id] = sub.subject_duration_minutes * 60;
      });
      setSubjectTimers(timers);

    } catch (error) {
      console.log("error when fetching questions:", error);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  // ---------------- TOTAL EXAM TIMER ----------------
  useEffect(() => {
    if (examTimeLeft <= 0) {
      autoSubmitExam();
      return;
    }

    const interval = setInterval(() => {
      setExamTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [examTimeLeft]);

  // ---------------- SUBJECT TIMER ----------------
  useEffect(() => {
    if (!activeSubject) return;

    const interval = setInterval(() => {
      setSubjectTimers((prev) => {
        const currentTime = prev[activeSubject.id];

        if (currentTime <= 1) {
          clearInterval(interval);
          handleSubjectTimeEnd();
          return { ...prev, [activeSubject.id]: 0 };
        }

        return {
          ...prev,
          [activeSubject.id]: currentTime - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSubject]);

  // ---------------- AUTO SUBMIT ----------------
  function autoSubmitExam() {
    alert("Time is up! Auto submitting exam.");
    console.log("User Answers:", userAnswers);
  }

  // ---------------- SUBJECT TIME END ----------------
  function handleSubjectTimeEnd() {
    const currentIndex = subjects.findIndex(
      (sub) => sub.id === activeSubject.id
    );

    if (currentIndex < subjects.length - 1) {
      const nextSubject = subjects[currentIndex + 1];
      handleSubject(nextSubject.id);
    }
  }

  // ---------------- SUBJECT CHANGE ----------------
  function handleSubject(subjectId) {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    setActiveSubject(subject);
    setSubjectQuestions(subject.questions);
    setSelectQuestion(subject.questions[0]);
    setSelectedOption(null);
  }

  // ---------------- QUESTION NAVIGATION ----------------
  function handleQuestion(questionId) {
    const question = subjectQuestions.find((q) => q.id === questionId);
    if (!question) return;

    setSelectQuestion(question);

    const savedAnswer = userAnswers.find(
      (ans) => ans.questionId === questionId
    );

    setSelectedOption(savedAnswer ? savedAnswer.selectedOptionId : null);
  }

  function goToNextQuestion() {
    const currentIndex = subjectQuestions.findIndex(
      (q) => q.id === selectQuestion?.id
    );

    if (currentIndex !== -1 && currentIndex < subjectQuestions.length - 1) {
      const nextQuestion = subjectQuestions[currentIndex + 1];
      setSelectQuestion(nextQuestion);
      setSelectedOption(null);
    }
  }

  // ---------------- ANSWERS ----------------
  function handleOptionChange(event) {
    setSelectedOption(Number(event.target.value));
  }

  function saveAnswer(questionId, optionId) {
    setUserAnswers((prev) => {
      const existing = prev.find((ans) => ans.questionId === questionId);

      if (existing) {
        return prev.map((ans) =>
          ans.questionId === questionId
            ? { ...ans, selectedOptionId: optionId }
            : ans
        );
      } else {
        return [...prev, { questionId, selectedOptionId: optionId }];
      }
    });
  }

  // ---------------- FORMAT TIME ----------------
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  // ---------------- UI ----------------
  return (
    <div className="container-fluid h-100">
      <div className="row h-30">
        <div className="col-8 border">
          <h4>{exam.title}</h4>

          {subjects.map((subject) => (
            <button
              key={subject.id}
              className="btn btn-primary mx-1"
              onClick={() => handleSubject(subject.id)}
            >
              {subject.name}
            </button>
          ))}
        </div>

        <div className="col-4 border">
          <p>Total Timer: {formatTime(examTimeLeft)}</p>
          <p>
            Subject Timer:{" "}
            {formatTime(subjectTimers[activeSubject?.id] || 0)}
          </p>
        </div>
      </div>

      <div className="row h-70">
        <div className="col-8 border">
          <div className="mt-2">{selectQuestion?.question_text}</div>

          {selectQuestion?.options?.map((opt) => (
            <div key={opt.id}>
              <input
                type="radio"
                name="option"
                value={opt.id}
                checked={selectedOption === opt.id}
                onChange={handleOptionChange}
              />
              {opt.option_text}
            </div>
          ))}

          <button
            className="btn btn-success mt-3"
            onClick={() => {
              if (selectedOption) {
                saveAnswer(selectQuestion.id, selectedOption);
              }
              goToNextQuestion();
            }}
          >
            Save & Next
          </button>
        </div>

        <div className="col-4 border">
          <p className="text-center">Question Palette</p>
          {subjectQuestions.map((que, index) => (
            <button
              key={que.id}
              className="btn btn-secondary m-1"
              onClick={() => handleQuestion(que.id)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamViewLayout;
import React, { useEffect, useState, useRef } from "react";
import { useExam } from "../src/context/useExam";
import { useNavigate, useParams } from "react-router-dom";

function formatTime(seconds) {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

const ExamViewLayout = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const url = `http://localhost:5000/api/exams/${examId}/questions`;

    const [exam, setExam] = useState({ title: "", time_duration: 0 });
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState(null);
    const [subjectQuestions, setSubjectQuestions] = useState([]);
    const [selectQuestion, setSelectQuestion] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [questionsStatus, setQuestionsStatus] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [lockedSubjects, setLockedSubjects] = useState([]);

    // Timer states
    const [totalTimeLeft, setTotalTimeLeft] = useState(0);
    const [subjectTimers, setSubjectTimers] = useState({}); // { subjectId: secondsLeft }

    // Just two simple interval refs
    const totalIntervalRef = useRef(null);
    const subjectIntervalRef = useRef(null);

    const { handleClearResponse } = useExam();

    // -------------------------
    // FETCH
    // -------------------------
    async function fetchQuestions() {
        const res = await fetch(url);
        const result = await res.json();

        setExam({
            title: result.exam.title,
            time_duration: result.exam.total_duration_minutes,
        });
        setSubjects(result.subjects);
        setActiveSubject(result.subjects[0]);
        setSubjectQuestions(result.subjects[0].questions);
        setSelectQuestion(result.subjects[0].questions[0]);

        // Set total timer
        setTotalTimeLeft(result.exam.total_duration_minutes * 60);

        // Set each subject timer
        const timers = {};
        result.subjects.forEach((sub) => {
            timers[sub.id] = sub.subject_duration_minutes * 60;
        });
        setSubjectTimers(timers);
    }

    // -------------------------
    // TOTAL TIMER
    // -------------------------
    useEffect(() => {
        if (totalTimeLeft <= 0) return;

        clearInterval(totalIntervalRef.current);

        totalIntervalRef.current = setInterval(() => {
            setTotalTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(totalIntervalRef.current);
                    clearInterval(subjectIntervalRef.current);
                    alert("Total exam time is up! Auto-submitting.");
                    handleFinalSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(totalIntervalRef.current);
    }, [totalTimeLeft === 0]); // only re-run if it hits 0

    // -------------------------
    // SUBJECT TIMER
    // — restarts whenever activeSubject changes
    // -------------------------
    useEffect(() => {
        if (!activeSubject) return;
        if (lockedSubjects.includes(activeSubject.id)) return;

        clearInterval(subjectIntervalRef.current);

        subjectIntervalRef.current = setInterval(() => {
            setSubjectTimers((prev) => {
                const current = prev[activeSubject.id];

                if (current <= 1) {
                    clearInterval(subjectIntervalRef.current);
                    setLockedSubjects((locked) => [...locked, activeSubject.id]);
                    alert("Subject time is up! This subject is now locked.");
                    return { ...prev, [activeSubject.id]: 0 };
                }

                return { ...prev, [activeSubject.id]: current - 1 };
            });
        }, 1000);

        // Pause when switching away from this subject
        return () => clearInterval(subjectIntervalRef.current);

    }, [activeSubject]); // re-runs on subject switch = pause old, start new

    // -------------------------
    // SUBMIT
    // -------------------------
    async function submitAnswers() {
        await fetch(`http://localhost:5000/api/exams/submit-result/${examId}`, {
            method: "POST",
            body: JSON.stringify({ userId: user.id, answers: userAnswers }),
            headers: { "Content-Type": "application/json" },
        });
    }

    async function submitExam() {
        await fetch(`http://localhost:5000/api/exams/user/create`, {
            method: "POST",
            body: JSON.stringify({ examId, userId: user.id }),
            headers: { "Content-Type": "application/json" },
        });
    }

    async function handleFinalSubmit() {
        clearInterval(totalIntervalRef.current);
        clearInterval(subjectIntervalRef.current);
        await submitAnswers();
        await submitExam();
        navigate("/student/result");
    }

    // -------------------------
    // HANDLERS
    // -------------------------
    function handleSubject(subjectId) {
        if (lockedSubjects.includes(subjectId)) {
            alert("This subject is locked. Time has expired.");
            return;
        }
        const subject = subjects.find((s) => s.id === subjectId);
        setActiveSubject(subject); // this triggers the subject timer useEffect
        setSubjectQuestions(subject.questions);
        setSelectQuestion(subject.questions[0]);
        setSelectedOption(null);
    }

    function handleQuestion(questionId) {
        const question = subjectQuestions.find((q) => q.id === questionId);
        if (question) {
            setSelectQuestion(question);
            const saved = userAnswers.find((ans) => ans.questionId === questionId);
            setSelectedOption(saved ? saved.selectedOptionId : null);
        }
    }

    function goToNextQuestion() {
        const currentIndex = subjectQuestions.findIndex((q) => q.id === selectQuestion?.id);
        if (currentIndex !== -1 && currentIndex < subjectQuestions.length - 1) {
            setSelectQuestion(subjectQuestions[currentIndex + 1]);
        }
    }

    function handleOptionChange(e) {
        setSelectedOption(Number(e.target.value));
    }

    function clearSelection() {
        setSelectedOption(null);
    }

    function handleQuestionStatus(questionId, status) {
        setQuestionsStatus((prev) => {
            const exists = prev.find((q) => q.questionId === questionId);
            if (!exists) return [...prev, { questionId, status }];
            return prev.map((q) => q.questionId === questionId ? { ...q, status } : q);
        });
    }

    function saveAnswer(questionId, optionId) {
        setUserAnswers((prev) => {
            const exists = prev.find((ans) => ans.questionId === questionId);
            if (exists) {
                return prev.map((ans) =>
                    ans.questionId === questionId ? { ...ans, selectedOptionId: optionId } : ans
                );
            }
            return [...prev, { questionId, selectedOptionId: optionId }];
        });
    }

    useEffect(() => {
        fetchQuestions();
        return () => {
            clearInterval(totalIntervalRef.current);
            clearInterval(subjectIntervalRef.current);
        };
    }, []);

    const isSubjectLocked = activeSubject && lockedSubjects.includes(activeSubject.id);
    const activeSubjectTimeLeft = activeSubject ? subjectTimers[activeSubject.id] : 0;

    return (
        <div className='container-fluid h-100'>
            <div className='row h-30'>
                <div className='col-8 border'>
                    <h4>{exam.title}</h4>
                    <div className='d-flex flex-end'>
                        {subjects.map((subject) => (
                            <div className='sub-btn' key={subject.id}>
                                <button
                                    className={`btn ${lockedSubjects.includes(subject.id) ? "btn-danger" : "btn-primary"} mx-1`}
                                    onClick={() => handleSubject(subject.id)}>
                                    {subject.name} {lockedSubjects.includes(subject.id) && "🔒"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='col-4 border'>
                    <p><b className='fs-3'>{user.full_name}</b></p>
                    <p style={{ color: totalTimeLeft <= 300 ? "red" : "inherit", fontWeight: "bold" }}>
                        Total Time Left: {formatTime(totalTimeLeft)}
                    </p>
                    <p style={{ color: activeSubjectTimeLeft <= 120 ? "red" : "inherit", fontWeight: "bold" }}>
                        Subject Time Left: {isSubjectLocked ? "🔒 Locked" : formatTime(activeSubjectTimeLeft)}
                    </p>
                </div>
            </div>

            <div className='row h-70'>
                <div className='col-8 border'>
                    {isSubjectLocked && (
                        <div className='alert alert-danger mt-2'>
                            This subject is locked. Time expired.
                        </div>
                    )}
                    <div className='question mt-2'>{selectQuestion?.question_text}</div>
                    <div className='options mt-3'>
                        {selectQuestion?.options?.map((opt) => (
                            <div className='option' key={opt.id}>
                                <label htmlFor={`opt-${opt.id}`}>
                                    <input
                                        type='radio'
                                        name='option'
                                        checked={selectedOption === opt.id}
                                        onChange={handleOptionChange}
                                        id={`opt-${opt.id}`}
                                        value={opt.id}
                                        disabled={isSubjectLocked}
                                    />{" "}
                                    {opt.option_text}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className='save-response d-flex justify-content-between mt-3 mb-2'>
                        <div className='mark-review'>
                            <button
                                className='btn btn-primary mx-2'
                                disabled={isSubjectLocked}
                                onClick={() => {
                                    handleQuestionStatus(selectQuestion?.id, "marked-for-review");
                                    goToNextQuestion();
                                }}>
                                Mark for review & Save
                            </button>
                            <button
                                className='btn btn-primary'
                                disabled={isSubjectLocked}
                                onClick={() => {
                                    handleClearResponse(selectQuestion?.id);
                                    handleQuestionStatus(selectQuestion?.id, "not-answered");
                                    clearSelection();
                                }}>
                                Clear response
                            </button>
                        </div>
                        <div className='save'>
                            <button
                                className='btn btn-primary'
                                disabled={isSubjectLocked}
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
                </div>

                <div className='col-4 border'>
                    <div className='question-pallet'>
                        <p className='text-center'>Question Palette</p>
                        <div className='row g-4 text-center'>
                            {subjectQuestions?.map((que, index) => {
                                let btn = "primary";
                                const status = questionsStatus.find((q) => q.questionId === que.id);
                                if (status?.status === "marked-for-review") btn = "info";
                                else if (status?.status === "answered") btn = "success";
                                else if (status?.status === "not-answered") btn = "danger";

                                return (
                                    <div className='pal-btn col-4' key={que.id}>
                                        <button
                                            className={`btn btn-${btn} col-4`}
                                            onClick={() => handleQuestion(que.id)}>
                                            {index + 1}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className='row mt-5 mb-2'>
                        <div className='col-12 text-center'>
                            <button className='btn btn-primary' onClick={handleFinalSubmit}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamViewLayout;


// import { useExam } from "../../context/useExam";
// import { useNavigate, useParams } from "react-router-dom";

// const ExamViewLayout = () => {
//   const { examId } = useParams();
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));
//   const url = `http://localhost:5000/api/exams/${examId}/questions`;

//   const [exam, setExam] = useState({ title: "", time_duration: "" });
//   const [subjects, setSubjects] = useState([]);
//   const [activeSubject, setActiveSubject] = useState(null);
//   const [subjectQuestions, setSubjectQuestions] = useState([]);
//   const [selectQuestion, setSelectQuestion] = useState({});
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [questionsStatus, setQuestionsStatus] = useState([]);
//   const [userAnswers, setUserAnswers] = useState([]);
//   const [lockedSubjects, setLockedSubjects] = useState([]);

//   // Timer states
//   const [examTimeLeft, setExamTimeLeft] = useState(0);
//   const [subjectTimeLeft, setSubjectTimeLeft] = useState({});
//   const [timerReady, setTimerReady] = useState(false);
//   const { handleClearResponse } = useExam();

//   function formatTime(seconds) {
//     if (!seconds || seconds <= 0) return "00:00";
//     const m = Math.floor(seconds / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   }

//   async function fetchQuestions() {
//     try {
//       const res = await fetch(url);
//       const result = await res.json();

//       if (!res.ok) throw new Error(result.message);

//       const examData = result.exam;
//       setExam({
//         title: examData.title,
//         time_duration: examData.total_duration_minutes,
//       });
//       setSubjects(result.subjects);
//       setActiveSubject(result.subjects[0]);
//       setSubjectQuestions(result.subjects[0]?.questions);
//       setSelectQuestion(result.subjects[0]?.questions[0]);

//       // Set total exam timer
//       setExamTimeLeft(examData.total_duration_minutes * 60);

//       // Set each subject timer
//       const timers = {};
//       result.subjects.forEach((sub) => {
//         timers[sub.id] = sub.subject_duration_minutes * 60;
//       });
//       setSubjectTimeLeft(timers);

//       setTimerReady(true); // ✅ now start the timer
//     } catch (error) {
//       console.log("Error fetching questions:", error);
//     }
//   }

//   // useEffect(() => {
//   //   if (!timerReady) return;

//   //   const timer = setInterval(() => {
//   //     setExamTimeLeft((prev) => {
//   //       if (prev <= 1) {
//   //         clearInterval(timer);
//   //         alert("Exam time over! Auto submitting.");
//   //         handleFinalSubmit();
//   //         return 0;
//   //       }
//   //       return prev - 1;
//   //     });
//   //   }, 1000);

//   //   return () => clearInterval(timer);
//   // }, [timerReady]);

//   useEffect(() => {
//     if (!timerReady || examTimeLeft <= 0) return;

//     const timer = setInterval(() => {
//       setExamTimeLeft((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timerReady, examTimeLeft]);

//   useEffect(() => {
//     if (!timerReady) return;
//     if (examTimeLeft !== 0) return;

//     alert("Exam time over! Auto submitting.");
//     handleFinalSubmit();
//   }, [examTimeLeft, timerReady]);

//   useEffect(() => {
//     if (!activeSubject) return;
//     if (lockedSubjects.includes(activeSubject.id)) return;

//     const subjectId = activeSubject.id;

//     if (subjectTimeLeft[subjectId] <= 0) return; // ⭐ ADD THIS

//     const timer = setInterval(() => {
//       setSubjectTimeLeft((prev) => {
//         const current = prev[subjectId];

//         if (current <= 1) {
//           clearInterval(timer);

//           setLockedSubjects((prevLocked) => {
//             if (prevLocked.includes(subjectId)) return prevLocked;
//             return [...prevLocked, subjectId];
//           });

//           alert(`${activeSubject.name} time is over! Subject is now locked.`);

//           return { ...prev, [subjectId]: 0 };
//         }

//         return { ...prev, [subjectId]: current - 1 };
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [activeSubject, subjectTimeLeft, lockedSubjects]);

//   async function submitAnswers() {
//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/exams/submit-result/${examId}`,
//         {
//           method: "POST",
//           body: JSON.stringify({ userId: user.id, answers: userAnswers }),
//           headers: { "Content-Type": "application/json" },
//         },
//       );
//       const result = await res.json();
//       if (!res.ok) throw new Error(result.message);
//       console.log("Answers submitted:", result);
//     } catch (error) {
//       console.log("Error submitting answers:", error.message);
//     }
//   }

//   async function submitExam() {
//     try {
//       const res = await fetch(`http://localhost:5000/api/exams/user/create`, {
//         method: "POST",
//         body: JSON.stringify({ examId, userId: user.id }),
//         headers: { "Content-Type": "application/json" },
//       });
//       const result = await res.json();
//       if (!res.ok) throw new Error(result.message);
//       console.log("Exam submitted:", result);
//     } catch (error) {
//       console.log("Error submitting exam:", error.message);
//     }
//   }

//   async function handleFinalSubmit() {
//     await submitAnswers();
//     await submitExam();
//     navigate("/student/result");
//   }

//   function handleSubject(subjectId) {
//     if (lockedSubjects.includes(subjectId)) {
//       alert("This subject is locked. Time has expired.");
//       return;
//     }
//     const subject = subjects.find((s) => s.id === subjectId);
//     if (!subject) return;
//     setActiveSubject(subject);
//     setSubjectQuestions(subject.questions);
//     setSelectQuestion(subject.questions[0]);
//     setSelectedOption(null);
//   }

//   function handleQuestion(questionId) {
//     const question = subjectQuestions.find((q) => q.id === questionId);
//     if (question) {
//       setSelectQuestion(question);
//       const saved = userAnswers.find((ans) => ans.questionId === questionId);
//       setSelectedOption(saved ? saved.selectedOptionId : null);
//     }
//   }

//   function goToNextQuestion() {
//     const currentIndex = subjectQuestions.findIndex(
//       (q) => q.id === selectQuestion?.id,
//     );
//     if (currentIndex !== -1 && currentIndex < subjectQuestions.length - 1) {
//       setSelectQuestion(subjectQuestions[currentIndex + 1]);
//     }
//   }

//   function handleOptionChange(e) {
//     setSelectedOption(Number(e.target.value));
//   }

//   function clearSelection() {
//     setSelectedOption(null);
//   }

//   function handleQuestionStatus(questionId, status) {
//     setQuestionsStatus((prev) => {
//       const exists = prev.find((q) => q.questionId === questionId);
//       if (!exists) return [...prev, { questionId, status }];
//       return prev.map((q) =>
//         q.questionId === questionId ? { ...q, status } : q,
//       );
//     });
//   }

//   function saveAnswer(questionId, optionId) {
//     setUserAnswers((prev) => {
//       const exists = prev.find((ans) => ans.questionId === questionId);
//       if (exists) {
//         return prev.map((ans) =>
//           ans.questionId === questionId
//             ? { ...ans, selectedOptionId: optionId }
//             : ans,
//         );
//       }
//       return [...prev, { questionId, selectedOptionId: optionId }];
//     });
//   }

//   useEffect(() => {
//     fetchQuestions();
//   }, []);

//   const isSubjectLocked =
//     activeSubject && lockedSubjects.includes(activeSubject.id);

//   return (
//     <div className="container-fluid h-100">
//       <div className="row h-30">
//         <div className="col-8 border">
//           <h4>{exam.title}</h4>
//           <div className="d-flex flex-end">
//             {subjects.map((subject) => (
//               <div className="sub-btn" key={subject.id}>
//                 <button
//                   className={`btn mx-1 ${lockedSubjects.includes(subject.id) ? "btn-danger" : "btn-primary"}`}
//                   onClick={() => handleSubject(subject.id)}
//                 >
//                   {subject.name} {lockedSubjects.includes(subject.id) && "🔒"}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="col-4 border">
//           <p>
//             <b className="fs-3">{user.full_name}</b>
//           </p>
//           <p
//             style={{
//               color: examTimeLeft <= 300 ? "red" : "inherit",
//               fontWeight: "bold",
//             }}
//           >
//             Total Time Left: {formatTime(examTimeLeft)}
//           </p>
//           <p
//             style={{
//               color:
//                 activeSubject && subjectTimeLeft[activeSubject.id] <= 120
//                   ? "red"
//                   : "inherit",
//               fontWeight: "bold",
//             }}
//           >
//             Subject Time Left:{" "}
//             {isSubjectLocked
//               ? "🔒 Locked"
//               : formatTime(
//                   activeSubject ? subjectTimeLeft[activeSubject.id] : 0,
//                 )}
//           </p>
//         </div>
//       </div>

//       <div className="row h-70">
//         <div className="col-8 border">
//           {isSubjectLocked && (
//             <div className="alert alert-danger mt-2">
//               This subject is locked. Time expired.
//             </div>
//           )}
//           <div className="question mt-2">{selectQuestion?.question_text}</div>
//           <div className="options mt-3">
//             {selectQuestion?.options?.map((opt) => (
//               <div className="option" key={opt.id}>
//                 <label htmlFor={`opt-${opt.id}`}>
//                   <input
//                     type="radio"
//                     name="option"
//                     checked={selectedOption === opt.id}
//                     onChange={handleOptionChange}
//                     id={`opt-${opt.id}`}
//                     value={opt.id}
//                     disabled={isSubjectLocked}
//                   />{" "}
//                   {opt.option_text}
//                 </label>
//               </div>
//             ))}
//           </div>

//           <div className="save-response d-flex justify-content-between mt-3 mb-2">
//             <div className="mark-review">
//               <button
//                 className="btn btn-primary mx-2"
//                 disabled={isSubjectLocked}
//                 onClick={() => {
//                   handleQuestionStatus(selectQuestion?.id, "marked-for-review");
//                   goToNextQuestion();
//                 }}
//               >
//                 Mark for review & Save
//               </button>
//               <button
//                 className="btn btn-primary"
//                 disabled={isSubjectLocked}
//                 onClick={() => {
//                   handleClearResponse(selectQuestion?.id);
//                   handleQuestionStatus(selectQuestion?.id, "not-answered");
//                   clearSelection();
//                 }}
//               >
//                 Clear response
//               </button>
//             </div>
//             <div className="save">
//               <button
//                 className="btn btn-primary"
//                 disabled={isSubjectLocked}
//                 onClick={() => {
//                   if (!selectedOption) {
//                     handleQuestionStatus(selectQuestion?.id, "not-answered");
//                   } else {
//                     saveAnswer(selectQuestion?.id, selectedOption);
//                     handleQuestionStatus(selectQuestion?.id, "answered");
//                   }
//                   goToNextQuestion();
//                 }}
//               >
//                 Save & Next
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="col-4 border">
//           <div className="question-pallet">
//             <p className="text-center">Question Palette</p>
//             <div className="row g-4 text-center">
//               {subjectQuestions?.map((que, index) => {
//                 let btn = "primary";
//                 const status = questionsStatus.find(
//                   (q) => q.questionId === que.id,
//                 );
//                 if (status?.status === "marked-for-review") btn = "info";
//                 else if (status?.status === "answered") btn = "success";
//                 else if (status?.status === "not-answered") btn = "danger";

//                 return (
//                   <div className="pal-btn col-4" key={que.id}>
//                     <button
//                       className={`btn btn-${btn} col-4`}
//                       onClick={() => handleQuestion(que.id)}
//                     >
//                       {index + 1}
//                     </button>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//           <div className="row mt-5 mb-2">
//             <div className="col-12 text-center">
//               <button className="btn btn-primary" onClick={handleFinalSubmit}>
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExamViewLayout;
