import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

const ExamCreate = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    function onSubmit(data) {
        fetch("http://localhost:5000/api/exams", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                credentials: "include",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("respones data: ", data);
                if (data.statusCode === 200) {
                    navigate(`/admin/exam/${data.data.id}/create`);
                }
            })
            .catch((error) => console.log("error for posting data", JSON.stringify(error)));
    }

    return (
        <div className='container'>
            <form className='w-50' onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-3'>
                    <h3 className=''>New Exam</h3>
                </div>
                <div className='mb-3'>
                    <label htmlFor='title' classNameName='form-label'>
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
                    <label htmlFor='time_duration' className='form-label'>
                        Time duration in minutes
                    </label>
                    <input
                        type='text'
                        className='form-control'
                        id='time_duration'
                        {...register("total_duration_minutes", { required: "Time duration is required" })}
                    />
                    {errors.total_duration_minutes && (
                        <span className='form-error text-danger'>{errors.total_duration_minutes.message}</span>
                    )}
                </div>
                    <button type='submit' className='btn btn-primary'>
                        Submit
                    </button>
     
            </form>
        </div>
    );
};

export default ExamCreate;
