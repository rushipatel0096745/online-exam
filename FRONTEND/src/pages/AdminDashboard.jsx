import React, { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;

    const [examList, setExamList] = useState([]);

    const getExamsUrl = "http://localhost:5000/api/exams/users/" + userId;

    // const { data, loading, error } = useFetch(getExamsUrl);

    // console.log(data);

    useEffect(() => {
        fetch(getExamsUrl)
            .then((res) => res.json())
            .then((data) => setExamList(data.data));
    }, [getExamsUrl]);

    return (
        <div className='container'>
            {/* list all exams created */}
            <h1>Admin dashboard</h1>
            <div className='row'>
                {examList.map((exam) => {
                    return (
                        <div className='col-3' key={exam.id}>
                            <div className='card border-dark mb-3' style={{ maxWidth: "18rem" }} >
                                <div className='card-header'>Exam ID: #{exam.id}</div>
                                <div className='card-body'>
                                    <h5 className='card-title'>{exam.title}</h5>
                                    <p className='card-text'>Creted On: {exam.created_at}</p>
                                    <button className='btn btn-primary'>
                                        {exam.is_active ? "Activated" : "Active"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* create exam form  */}
            <div className='container'>
                <Link to='/admin/exam/create'>
                <button className="btn btn-primary">Add exam</button>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
