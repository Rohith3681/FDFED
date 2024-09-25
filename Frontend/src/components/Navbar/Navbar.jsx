import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice.js';
import './Navbar.css';

export const Navbar = () => {
    const { isAuthenticated, role } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            const res = await fetch('http://localhost:8000/logout', {
                method: 'POST',
                credentials: 'include',
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
                <h2 className="logo1">Pack Your Bags</h2>
                <div className="nav-links">
                    <NavLink exact to="/" activeClassName="active-link">
                        <li>Home</li>
                    </NavLink>
                    <NavLink to="/about" activeClassName="active-link">
                        <li>About</li>
                    </NavLink>
                    {!isAuthenticated ? (
                        <NavLink to="/adminLogin" activeClassName="active-link">
                            <li>Admin</li>
                        </NavLink>
                    ) : null}
                    {isAuthenticated && role === '8180' ? (
                        <NavLink to="/create" activeClassName="active-link">
                            <li>Create Tour</li>
                        </NavLink>
                    ) : null}
                    {isAuthenticated && role === '2120' ? (
                        <>
                            <NavLink to="/book" activeClassName="active-link">
                                <li>Book Tour</li>
                            </NavLink>
                            <NavLink to="/profile" activeClassName="active-link">
                                <li>Profile</li>
                            </NavLink>
                        </>
                    ) : null}
                    {isAuthenticated && role === '8180' ? (
                        <>
                            <NavLink to="/Dashboard" activeClassName="active-link">
                                <li>Dashboard</li>
                            </NavLink>
                        </>
                    ) : null}
                    {isAuthenticated ? (
                        <>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" activeClassName="active-link">
                                <li>Login</li>
                            </NavLink>
                            <NavLink to="/register" activeClassName="active-link">
                                <li>Register</li>
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};
