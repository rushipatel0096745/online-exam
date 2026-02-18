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

  // TIMER STATES
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [subjectTimers, setSubjectTimers] = useState({});

  // ---------------- FETCH QUESTIONS ----------------
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

      // Initialize total exam timer
      setExamTimeLeft(exam.total_duration_minutes * 60);

      // Initialize subject timers
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
