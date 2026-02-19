import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const StudentLogin = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const {user, login } = useAuth();

    const navigate = useNavigate();

    const onSubmit = (data) => {
        console.log(data);
        if(login(data.email, data.password)) {
            navigate("/student")
        }
        // post data json to url
        // fetch("http://localhost:5000/api/student/login", {
        //     method: "POST",
        //     body: JSON.stringify(data),
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // })
        //     .then((res) => res.json())
        //     .then((data) => {
        //         console.log(data);
        //         const user = data.data.user;
        //         localStorage.setItem("user", JSON.stringify(user));
        //         if (data.statusCode === 200) {
        //            console.log(data)
        //         }
        //     })
        //     .catch((error) => console.log("error for posting data", error));
    };

    return (
        <div className='container d-flex align-items-center justify-content-center min-vh-100'>
            <form className='w-50' onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-3'>
                    <h3 className=''>Student Login</h3>
                </div>
                <div className='mb-3'>
                    <label htmlFor='email' className='form-label'>
                        Email
                    </label>
                    <input
                        type='email'
                        className='form-control'
                        id='email'
                        {...register("email", { required: "Email is required" })}
                    />
                    {errors.email && <span className='form-error'>{errors.email.message}</span>}
                </div>
                <div className='mb-3'>
                    <label htmlFor='password' className='form-label'>
                        Password
                    </label>
                    <input
                        type='password'
                        className='form-control'
                        id='password'
                        {...register("password", { required: "Password is required" })}
                    />
                    {errors.email && <span className='form-error'>{errors.password.message}</span>}
                </div>
                <button type='submit' className='btn btn-primary'>
                    Submit
                </button>
            </form>

            {
                user ? user.full_name : "username"
            }
        </div>
    );
};

export default StudentLogin;
