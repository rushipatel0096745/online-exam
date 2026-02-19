import React, { useEffect, useState } from "react";
import { useExam } from "../../context/useExam";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const ExamViewLayout = () => {
  const { examId } = useParams();

  // const { user } = useAuth();

  const user = JSON.parse(localStorage.getItem("user"));

  const url = `http://localhost:5000/api/exams/${examId}/questions`;

  const [exam, setExam] = useState({ title: "", time_duration: "" });
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState();
  const [subjectQuestions, setSubjectQuestions] = useState([]);
  const [selectQuestion, setSelectQuestion] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionsStatus, setQuestionsStatus] = useState([
    { questionId: 0, status: "" },
  ]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [subjectTimeLeft, setSubjectTimeLeft] = useState({});
  const [lockedSubjects, setLockedSubjects] = useState([]);
  const [timerReady, setTimerReady] = useState(false);

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

      // total exam timer in seconds
      setExamTimeLeft(exam.total_duration_minutes * 60);
      setTimerReady(true);

      setSubjects(result.subjects);
      setActiveSubject(result.subjects[0]);
      setSubjectQuestions(result.subjects[0]?.questions);
      setSelectQuestion(result.subjects[0]?.questions[0]);

      // initialize subject timers
      const subjectTimers = {};
      result.subjects.forEach((sub) => {
        subjectTimers[sub.id] = sub.subject_duration_minutes * 60;
      });
      setSubjectTimeLeft(subjectTimers);
    } catch (error) {
      console.log("error when fetching questions: ", error.data);
    }
  }

  // function handleSubject(subjectId) {
  //   subjects.map((subject) => {
  //     if (subject.id === subjectId) {
  //       setActiveSubject(subject);
  //       setSubjectQuestions(subject?.questions);
  //       setSelectQuestion(subject?.questions[0]);
  //     }
  //   });
  // }

  function handleSubject(subjectId) {
    if (lockedSubjects.includes(subjectId)) {
      alert("This subject is locked");
      return;
    }

    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    setActiveSubject(subject);
    setSubjectQuestions(subject.questions);
    setSelectQuestion(subject.questions[0]);
  }

  function handleQuestion(questionId) {
    const question = subjectQuestions.find((q) => q.id === questionId);

    if (question) {
      setSelectQuestion(question);

      const savedAnswer = userAnswers.find(
        (ans) => ans.questionId === questionId,
      );

      setSelectedOption(savedAnswer ? savedAnswer.selectedOptionId : null);
    }
  }

  function goToNextQuestion() {
    const currentIndex = subjectQuestions.findIndex(
      (q) => q.id === selectQuestion?.id,
    );

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

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleQuestionStatus(questionId, status) {
    let question = questionsStatus.find((que) => que.questionId === questionId);

    if (!question) {
      setQuestionsStatus((prev) => [
        ...prev,
        { questionId: questionId, status: status },
      ]);
    } else {
      setQuestionsStatus(
        questionsStatus.map((que) => {
          if (que.questionId === questionId) {
            return { ...que, status: status };
          } else {
            return que;
          }
        }),
      );
    }
  }

  function saveAnswer(questionId, optionId) {
    setUserAnswers((prev) => {
      const existing = prev.find((ans) => ans.questionId === questionId);

      if (existing) {
        return prev.map((ans) =>
          ans.questionId === questionId
            ? { ...ans, selectedOptionId: optionId }
            : ans,
        );
      } else {
        return [...prev, { questionId, selectedOptionId: optionId }];
      }
    });
  }

  async function submitAnswers() {
    console.log(userAnswers);
    try {
      const res = await fetch(
        `http://localhost:5000/api/exams/submit-result/${examId}`,
        {
          method: "POST",
          body: JSON.stringify({ userId: user.id, answers: userAnswers }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      console.log(result);
    } catch (error) {
      console.log("Error in submitting answers", error.message);
    }
  }

  async function submitExam() {
    try {
      const res = await fetch(`http://localhost:5000/api/exams/user/create`, {
        method: "POST",
        body: JSON.stringify({ examId, userId: user.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      console.log(result);
    } catch (error) {
      console.log("Error in submitting answers", error.message);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!examTimeLeft) return;

    const timer = setInterval(() => {
      setExamTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitAnswers();
          submitExam();
          alert("Exam time over. Auto submitted.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerReady]);

  useEffect(() => {
    if (!activeSubject) return;

    const subjectId = activeSubject.id;

    const timer = setInterval(() => {
      setSubjectTimeLeft((prev) => {
        const currentTime = prev[subjectId];

        if (currentTime <= 1) {
          clearInterval(timer);

          // 🔒 lock subject
          setLockedSubjects((prevLocked) => [...prevLocked, subjectId]);

          alert(`${activeSubject.name} time over`);

          return {
            ...prev,
            [subjectId]: 0,
          };
        }

        return {
          ...prev,
          [subjectId]: currentTime - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSubject]);

  return (
    <div className="container-fluid h-100">
      <div className="row h-30">
        <div className="col-8 border">
          <div>
            <h4>{exam.title}</h4>
          </div>
          {/* for subjects */}
          <div className="d-flex flex-end">
            {subjects.map((subject) => (
              <div className="sub-btn" key={subject.id}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSubject(subject.id)}
                >
                  {subject.name}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="col-4 border">
          {/* for user info and timer */}
          <div>
            <p>
              <b className="fs-3">{user.full_name}</b>
            </p>
          </div>
          <div>
            <p>Total timer: {formatTime(examTimeLeft)}</p>
            <p>
              Subject timer:{" "}
              {activeSubject
                ? formatTime(subjectTimeLeft[activeSubject.id] || 0)
                : "0:00"}
            </p>
          </div>
        </div>
      </div>
      <div className="row h-70">
        <div className="col-8 border">
          <div className="question mt-2">{selectQuestion?.question_text}</div>
          <div className="options mt-3">
            {selectQuestion?.options?.map((opt) => {
              return (
                <div className="option" key={opt.id}>
                  <label htmlFor={`opt-${opt.id}`}>
                    <input
                      type="radio"
                      name="option"
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

          <div className="save-response d-flex justify-content-between mt-3 mb-2">
            <div className="mark-review">
              <button
                className="btn btn-primary mx-2"
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
                }}
              >
                {" "}
                Mark for review & Save
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleClearResponse(selectQuestion?.id);
                  handleQuestionStatus(selectQuestion?.id, "not-answered");
                  clearSelection();
                }}
              >
                clear response
              </button>
            </div>
            <div className="save">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!selectedOption) {
                    handleQuestionStatus(selectQuestion?.id, "not-answered");
                  } else {
                    saveAnswer(selectQuestion?.id, selectedOption);
                    handleQuestionStatus(selectQuestion?.id, "answered");
                  }
                  goToNextQuestion();
                }}
              >
                Save & next
              </button>
            </div>
          </div>
        </div>
        <div className="col-4 border">
          {/* pallete for question */}
          <div className="question-pallet">
            <p className="text-center">Question pallet</p>
            <div className="row g-4 text-center">
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
                  <div className="pal-btn col-4" key={que.id}>
                    <button
                      className={`btn btn-${btn} col-4`}
                      onClick={() => {
                        handleQuestion(que.id);
                      }}
                    >
                      {index + 1}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="row mt-5 mb-2">
            <div className="col-12 text-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  submitAnswers();
                  submitExam();
                }}
              >
                Submit
              </button>
              {/* <Link className='btn btn-primary' to={'/student/result'}>Submit</Link> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamViewLayout;

// import React, { useEffect, useState } from "react";
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
