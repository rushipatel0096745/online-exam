import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/useAuth";

const AdminLogin = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const { user, login, error } = useAuth();

    useEffect(() => {}, []);

    const onSubmit = async(data) => {
        const success = await login(data.email, data.password);
        if (success) {
            navigate("/admin/dashboard");
        }
    };

    return (
        <div className='container d-flex align-items-center justify-content-center min-vh-100'>
            <form className='w-50' onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-3'>
                    <h3 className=''>Admin Login</h3>
                </div>
                <div className='mb-3'>
                    <label htmlFor='email' classNameName='form-label'>
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
                <div className='mt-3'>
                    <span className='text-danger'>{error}</span>
                </div>
            </form>
        </div>
    );
};

export default AdminLogin;
