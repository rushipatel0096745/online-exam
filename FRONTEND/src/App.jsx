import { useState } from "react";
// import './App.css'
import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ExamCreate from "./pages/admin/ExamCreate";
import ExamBuilder from "./pages/admin/ExamBuilder";
import ExamView from "./pages/ExamView";
import ExamViewLayout from "./pages/user/ExamViewLayout";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <Routes>
                <Route path='/' element={<ExamView />} />
                <Route path='/user' element={<ExamViewLayout />} />
                <Route path='/admin/login' element={<AdminLogin />} />
                <Route path='/admin/dashboard' element={<AdminDashboard />} />
                <Route path='/admin/exam/create' element={<ExamCreate />} />
                <Route path="/admin/exam/:examId/create" element={<ExamBuilder/>} />
            </Routes>
        </>
    );
}

export default App;
