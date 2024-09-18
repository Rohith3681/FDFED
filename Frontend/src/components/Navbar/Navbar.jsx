import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Logo from '../../assets/WhatsApp Image 2024-08-22 at 21.52.32_dc9cf41a.jpg';
import { logout } from '../../features/auth/authSlice.js';
import './Navbar.css';

export const Navbar = () => {
    const { isAuthenticated, role } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            const res = await fetch('http://localhost:8000/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                dispatch(logout());
            } else {
                console.error('Failed to log out');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div>
            <nav>
                <div className="logo">
                    <img src={Logo} alt="Logo" />
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Search..." />
                </div>
                <div className="nav-links">
                    <NavLink className={(e) => e.isActive ? "orange" : ""} to="/"><li>Home</li></NavLink>
                    <NavLink className={(e) => e.isActive ? "orange" : ""} to="/about"><li>About</li></NavLink>
                    {isAuthenticated && role == '8180' ? (
                        <NavLink className={(e) => e.isActive ? "orange" : ""} to="/create"><li>Create Tour</li></NavLink>
                    ) : null}
                    {isAuthenticated ? (
                        <>
                            <NavLink className={(e) => e.isActive ? "orange" : ""} to="/profile"><li>Profile</li></NavLink>
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink className={(e) => e.isActive ? "orange" : ""} to="/login"><li>Login</li></NavLink>
                            <NavLink className={(e) => e.isActive ? "orange" : ""} to="/register"><li>Register</li></NavLink>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};
