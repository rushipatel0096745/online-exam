import { createContext, useContext, useState } from "react";

export const ExamContext = createContext();

export const ExamContextProvider = function ({ children }) {
    const [markForReviewQs, setMarkForReviewQs] = useState([]); //this contains the question ids which marked
    const [userAnswers, setUserAnswers] = useState([]);
    const [notAnsweredQs, setNotAnsweredQs] = useState([]);

    const [questionsStatus, setQuestionsStatus] = useState();

    // mark for review, answered, not answered
    function handleQuestionStatus() {
        setQuestionStatus((prev) => [])
    }

    function handleMarkForReview(questionId) {
        setMarkForReviewQs((prev) => [...prev, questionId]);
    }

    function handleSaveNext(questionId, answer) {
        setUserAnswers((prev) => [...prev, { question_id: questionId, answer: answer }]);
    }

    function handleClearResponse(questionId) {
        setUserAnswers(userAnswers.filter((ans) => ans.question_id !== questionId));
        if(markForReviewQs.includes(questionId)) {
            setMarkForReviewQs(markForReviewQs.filter(qid => qid !== questionId))
        }
    }

    function handleNotAnswered(questionId) {
        setNotAnsweredQs(prev => [...prev, questionId])
    }

    return (
        <ExamContext.Provider
            value={{ markForReviewQs, userAnswers, notAnsweredQs, handleMarkForReview, handleSaveNext, handleClearResponse, handleNotAnswered }}>
            {children}
        </ExamContext.Provider>
    );
};

export const useExam = function() {
    const context = useContext(ExamContext);
    return context;
}
