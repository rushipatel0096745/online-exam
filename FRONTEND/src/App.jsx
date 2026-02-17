import { useState } from "react";
// import './App.css'
import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ExamCreate from "./pages/ExamCreate";
import ExamBuilder from "./pages/ExamBuilder";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <Routes>
                <Route path='/admin/login' element={<AdminLogin />} />
                <Route path='/admin/dashboard' element={<AdminDashboard />} />
                <Route path='/admin/exam/create' element={<ExamCreate />} />
                <Route path="/admin/exam/:examId/create" element={<ExamBuilder/>} />
            </Routes>
        </>
    );
}

export default App;
