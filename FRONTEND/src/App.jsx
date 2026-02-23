import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ExamCreate from "./pages/admin/ExamCreate";
import ExamBuilder from "./pages/admin/ExamBuilder";
import ExamViewLayout from "./pages/user/ExamViewLayout";
import { ExamContextProvider } from "./context/useExam";
import StudentLogin from "./pages/user/StudentLogin";
import { AuthProvider } from "./context/useAuth";
import StudentDashboard from "./pages/user/StudentDashboard";
import StudentResult from "./pages/user/StudentResult";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <ExamContextProvider>
                <Routes>
                    <Route path='/' element={<StudentLogin />} />
                    <Route path='/admin/login' element={<AdminLogin />} />

                    <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                        <Route path='/student' element={<StudentDashboard />} />
                        <Route path='/student/exam/:examId' element={<ExamViewLayout />} />
                        <Route path='/student/result' element={<StudentResult />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                        <Route path='/admin/dashboard' element={<AdminDashboard />} />
                        <Route path='/admin/exam/create' element={<ExamCreate />} />
                        <Route path='/admin/exam/:examId/create' element={<ExamBuilder />} />
                    </Route>
                </Routes>
            </ExamContextProvider>
        </AuthProvider>
    );
}

export default App;
