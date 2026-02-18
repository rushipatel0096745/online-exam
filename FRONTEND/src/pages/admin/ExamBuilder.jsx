// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
// import SubjectSidebar from "../components/SubjectSidebar";
// import SubjectModal from "../components/SubjectModal";
// import SubjectContent from "../components/SubjectContent";

// const ExamBuilder = () => {
//   const url = "http://localhost:5000/api";
//   const { examId } = useParams();

//   const [exam, setExam] = useState(null);
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
//   const [selectedSubject, setSelectedSubject] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const examRes = await fetch(`${url}/exams/${examId}`);
//         if (!examRes.ok) throw new Error("Failed to fetch exam");
//         const examData = await examRes.json();
//         setExam(examData.data);

//         const subjectsRes = await fetch(`${url}/exams/${examId}/subjects`);
//         if (!subjectsRes.ok) throw new Error("Failed to fetch subjects");
//         const subjectsData = await subjectsRes.json();
//         setSubjects(subjectsData.data ?? []);
//       } catch (err) {
//         setError(err.message);
//         console.error("Error fetching data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (examId) {
//       fetchData();
//     }
//   }, [examId]);

//   function handleAddSubject(newSubject) {
//     setSubjects((prev) => [...prev, newSubject]);
//     setSelectedSubject(newSubject);
//   }

//   function handleDeleteSubject(subjectId) {
//     setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
//     if (selectedSubject?.id === subjectId) {
//       setSelectedSubject(null);
//     }
//   }

//   function handleSelectSubject(subject) {
//     setSelectedSubject(subject);
//   }

//   if (loading) {
//     return (
//       <Container
//         className="d-flex justify-content-center align-items-center"
//         style={{ minHeight: "200px" }}
//       >
//         <Spinner animation="border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </Spinner>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="mt-3">
//         <Alert variant="danger">Error: {error}</Alert>
//       </Container>
//     );
//   }

//   return (
//     <Container fluid className="p-0">
//       <Row className="g-0" style={{ minHeight: "100vh" }}>
//         {/* Sidebar */}
//         <Col xs={12} md={4} lg={3} className="border-end bg-light">
//           <SubjectSidebar
//             subjects={subjects}
//             selectedSubject={selectedSubject}
//             onSelectSubject={handleSelectSubject}
//             onAddSubject={() => setShowAddSubjectModal(true)}
//             onDeleteSubject={handleDeleteSubject}
//           />
//         </Col>

//         {/* Main content area */}
//         <Col xs={12} md={8} lg={9} className="p-4 bg-dark text-light">
//           {selectedSubject ? (
//             <SubjectContent
//               subject={selectedSubject}
//               onAddQuestion={(newQuestion) => {
//                 setSubjects((prev) =>
//                   prev.map((sub) =>
//                     sub.id === selectedSubject.id
//                       ? {
//                           ...sub,
//                           questions: [...(sub.questions || []), newQuestion],
//                         }
//                       : sub,
//                   ),
//                 );
//               }}
//             />
//           ) : (
//             <div className="d-flex justify-content-center align-items-center h-100 text-secondary">
//               Select a subject to start adding questions
//             </div>
//           )}
//         </Col>
//       </Row>

//       {/* Add Subject Modal */}
//       <SubjectModal
//         examId={examId}
//         show={showAddSubjectModal}
//         onClose={() => setShowAddSubjectModal(false)}
//         onSuccess={handleAddSubject}
//       />
//     </Container>
//   );
// };

// export default ExamBuilder;



import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import SubjectSidebar from "../../components/SubjectSidebar";
import SubjectModal from "../../components/SubjectModal";
import SubjectContent from "../../components/SubjectContent";

const ExamBuilder = () => {
  const url = "http://localhost:5000/api";
  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [editSubject, setEditSubject] = useState(false);
  const [mode, setMode] = useState();


  const selectedSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${url}/exams/${examId}/questions`);
        if (!res.ok) throw new Error("Failed to fetch exam data");

        const data = await res.json();

        setExam(data.exam);
        setSubjects(data.subjects ?? []);

        if (data.subjects?.length > 0) {
          setSelectedSubjectId(data.subjects[0].id);
        }

      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchData();
    }
  }, [examId]);

  //  Add Subject
  function handleAddSubject(newSubject) {
    setSubjects((prev) => [...prev, { ...newSubject, questions: [] }]);
    setSelectedSubjectId(newSubject.id);
  }

  // Edit subject
  // function handleEditSubject() {
  //   setEditSubject(true)
  // }

  // Delete Subject
  function handleDeleteSubject(subjectId) {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));

    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null);
    }
  }

  // Add Question
  function handleAddQuestion(newQuestion) {
    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === selectedSubjectId
          ? {
              ...sub,
              questions: [...(sub.questions || []), newQuestion],
            }
          : sub
      )
    );
  }

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-3">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      <Row className="g-0" style={{ minHeight: "100vh" }}>

        {/* Sidebar */}
        <Col xs={12} md={4} lg={3} className="border-end bg-light">
          <SubjectSidebar
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelectSubject={(subject) =>
              setSelectedSubjectId(subject.id)
            }
            onEditSubject={() => setEditSubject(true)}
            onAddSubject={() => setShowAddSubjectModal(true)}
            onDeleteSubject={handleDeleteSubject}
          />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={8} lg={9} className="p-4 bg-dark text-light">
          {selectedSubject ? (
            <SubjectContent
              subject={selectedSubject}
              onAddQuestion={handleAddQuestion}
            />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-secondary">
              Select a subject to start adding questions
            </div>
          )}
        </Col>

      </Row>

      {/* Add Subject Modal */}
      <SubjectModal
        examId={examId}
        show={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        onSuccess={handleAddSubject}
        mode={editSubject ? 'edit' : 'create'}
      />
    </Container>
  );
};

export default ExamBuilder;
