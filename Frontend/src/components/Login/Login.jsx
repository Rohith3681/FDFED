import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, setCart } from "../../features/auth/authSlice"; 
import "./Login.css";
import hello from "../../assets/images/hero-video.mp4";

export const Login = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (loading) return;
        
        if (!name.trim() || !password.trim()) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, password }),
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                setName("");
                setPassword("");
                dispatch(login({ role: data.role, username: name }));
                
                if (data.cart && Array.isArray(data.cart)) {
                    dispatch(setCart(data.cart));
                }
                
                navigate("/");
            } else {
                setError(data.message || "Invalid credentials. Please try again.");
            }
        } catch (error) {
            setError("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const videoSource = typeof hello === 'string' ? hello : '';

    return (
        <div className="login-container">
            <div className="login-box">
                <form onSubmit={handleSubmit} className="form-container" aria-label="Login form">
                    <h2 className="text-2xl mb-4 font-bold text-center" id="text">Sign in</h2>

                    {error && <p className="text-red-500" role="alert">{error}</p>}

                    <div className="form-group">
                        <label htmlFor="name" className="sr-only">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            required
                            disabled={loading}
                            aria-label="Name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            required
                            disabled={loading}
                            aria-label="Password"
                        />
                    </div>

                    <p className="mb-4 text-center">
                        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
                    </p>

                    <button 
                        type="submit" 
                        className="submit-btn" 
                        id="signin"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'SIGN IN'}
                    </button>
                </form>

                <div className="video-container">
                    <video className="login-video" autoPlay loop muted>
                        <source src={videoSource} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="video-text-overlay">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
