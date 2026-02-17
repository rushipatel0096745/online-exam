import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SubjectSidebar from "../components/SubjectSidebar";
import SubjectModal from "../components/SubjectModal";

const ExamBuilder = () => {
    const url = "http://localhost:5000/api";
    const { examId } = useParams();

    const [exam, setExam] = useState(null);
    const [subjects, setSubjects] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch exam
                const examRes = await fetch(`${url}/exams/${examId}`);
                const examData = await examRes.json();
                setExam(examData.data);

                // Fetch subjects
                const subjectsRes = await fetch(`${url}/exams/${examId}/subjects`);
                const subjectsData = await subjectsRes.json();
                setSubjects(subjectsData.data);
            } catch (err) {
                setError(err.message);
                console.log("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchData();
        }
    }, [examId]);

    function handleAddSubject(newSubject) {
        setSubjects((prev) => [...prev, newSubject]);
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='row'>
            <div className='col-4'>
                <SubjectSidebar subjects={subjects} onAddSubject={() => setShowAddSubjectModal((prev) => !prev)} />
            </div>
            <div className='col-8'></div>
            {/* add subject modal */}
            {showAddSubjectModal && (
                <SubjectModal examId={examId} onClose={() => showAddSubjectModal(false)} onSuccess={handleAddSubject} />
            )}
        </div>
    );
};

export default ExamBuilder;
