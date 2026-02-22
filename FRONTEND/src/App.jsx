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

                    <Route path="/" element={<StudentLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute allowedRoles={["student"]}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/student/exam/:examId"
                        element={
                            <ProtectedRoute allowedRoles={["student"]}>
                                <ExamViewLayout />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/student/result"
                        element={
                            <ProtectedRoute allowedRoles={["student"]}>
                                <StudentResult />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/exam/create"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <ExamCreate />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/exam/:examId/create"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <ExamBuilder />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </ExamContextProvider>
        </AuthProvider>
    );
}

export default App;

