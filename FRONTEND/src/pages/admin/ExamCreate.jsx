import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

const ExamCreate = ({ onAddExam }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const user = JSON.parse(localStorage.getItem("user"));

    const [error, setError] = useState("");

    const [examType, setExamType] = useState(null);

    const navigate = useNavigate();

    async function onSubmit(data) {
        try {
            const res = await fetch("http://localhost:5000/api/exams", {
                method: "POST",
                body: JSON.stringify({
                    title: data.title,
                    total_duration_minutes: data.total_duration_minutes || null,
                    exam_type: examType,
                    created_by: user.id,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message);
            }

            onAddExam(result.data);
        } catch (error) {
            setError(error.message);
            console.log(error.message);
        }
    }

    function handleExamType(e) {
        setExamType(e.target.value);
    }

    return (
        <div className='container-fluid mt-3'>
            {error ? <Alert variant='danger'>{error}</Alert> : ""}
            <form className='w-50' onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-3'>
                    <h3 className=''>Create Exam</h3>
                </div>
                <div className='mb-3'>
                    <label htmlFor='title' className='form-label'>
                        Title
                    </label>
                    <input
                        type='title'
                        className='form-control'
                        id='title'
                        {...register("title", { required: "Title is required" })}
                    />
                    {errors.title && <span className='form-error text-danger'>{errors.title.message}</span>}
                </div>
                <div className='mb-3'>
                    <label htmlFor='title' className='form-label'>
                        Select exam type
                    </label>
                    <select
                        class='form-select'
                        onChange={handleExamType}
                        name='exam_type'
                        // {...register("exam_type", { required: true })}>
                        >
                        <option selected></option>
                        <option value='FULL_EXAM'>Full exam</option>
                        <option value='CATEGORY'>Category</option>
                    </select>
                         
                   
                    {/* {errors.exam_type && errors.exam_type.type === "required" && (
                        <span className="text-danger">Select the exam type</span>
                    )} */}
                </div>
                {examType === "FULL_EXAM" && (
                    <div className='mb-3'>
                        <label htmlFor='time_duration' className='form-label'>
                            Time duration in minutes
                        </label>
                        <input
                            type='number'
                            className='form-control'
                            id='time_duration'
                            {...register("total_duration_minutes", { required: "Time duration is required" })}
                        />
                        {errors.total_duration_minutes && (
                            <span className='form-error text-danger'>{errors.total_duration_minutes.message}</span>
                        )}
                    </div>
                )}
                <button type='submit' className='btn btn-primary'>
                    Submit
                </button>
            </form>
        </div>
    );
};

export default ExamCreate;
