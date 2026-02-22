import React from "react";
import { useAuth } from "../../context/useAuth";
import { Link } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useAuth();

    // const user = JSON.parse(localStorage.getItem("user"))
    
    return (
        <nav className='navbar navbar-expand-lg bg-body-tertiary'>
            <div className='container-fluid'>
                <a className='navbar-brand' href='#'>
                    Navbar
                </a>
                <button
                    className='navbar-toggler'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#navbarNavAltMarkup'
                    aria-controls='navbarNavAltMarkup'
                    aria-expanded='false'
                    aria-label='Toggle navigation'>
                    <span className='navbar-toggler-icon'></span>
                </button>
                <div className='collapse navbar-collapse' id='navbarNavAltMarkup'>
                    <div className='navbar-nav'>
                        <Link className='nav-link active' aria-current='page' to={'/student'}>
                            Home
                        </Link>
                        <Link className='nav-link active' to={"/student/result"} aria-current='page'>
                            Results
                        </Link>
                    </div>
                </div>
                <div className='d-flex'>
                    <p className='m-0'>{user && user.full_name}</p>
                    <button className="btn btn-outline-danger ms-2" onClick={logout}>Logout</button>
                    </div>
            </div>
        </nav>
    );
};

export default Navbar;
