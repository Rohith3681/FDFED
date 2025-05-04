import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../src/features/auth/authSlice'; // Updated path
import './Navbar.css';

export const Navbar = () => {
    const { isAuthenticated, role, cart } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart }), // Send cart data in the body
                credentials: 'include',
            });

            if (res.ok) {
                dispatch(logout()); // Clear user data and cart on logout
            } else {
                console.error('Failed to log out');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Get the length of the cart array to display total items in the cart
    const totalCartItems = Array.isArray(cart) ? cart.length : 0;

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
                        <>
                            <NavLink to="/create" activeClassName="active-link">
                                <li>Create Tour</li>
                            </NavLink>
                            <NavLink to="/Dashboard" activeClassName="active-link">
                                <li>Dashboard</li>
                            </NavLink>
                        </>
                    ) : null}
                    {isAuthenticated && role === '2120' ? (
                        <>
                            <NavLink to="/book" activeClassName="active-link">
                                <li>Book Tour</li>
                            </NavLink>
                            <NavLink to="/profile" activeClassName="active-link">
                                <li>Profile</li>
                            </NavLink>
                            {/* Conditionally render Cart button */}
                            <NavLink to="/cart" activeClassName="active-link">
                                <li>Cart ({totalCartItems})</li> {/* Display total items in the cart */}
                            </NavLink>
                        </>
                    ) : null}
                    {isAuthenticated && (role === '8180' || role === '2120') ? (
                        <li>
                            <span onClick={handleLogout} className="span">
                                Logout
                            </span>
                        </li>
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