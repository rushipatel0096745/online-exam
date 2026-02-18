import { createContext, useContext, useState } from "react";

export const ExamContext = createContext();

export const ExamContextProvide = function ({ children }) {
    const [markForReviewQs, setMarkForReviewQs] = useState([]); //this contains the question ids which marked
    const [userAnswers, setUserAnswers] = useState([]);
    const [notVisitedQs, setNotVisitedQs] = useState([]);

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

    return (
        <ExamContext.Provider
            value={{ markForReviewQs, userAnswers, notVisitedQs, handleMarkForReview, handleSaveNext, handleClearResponse }}>
            {children}
        </ExamContext.Provider>
    );
};

export const useExam = function() {
    const context = useContext(ExamContext);
    return context;
}
