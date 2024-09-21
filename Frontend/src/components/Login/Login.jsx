import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import './Login.css';
import hello from '../../assets/images/hero-video.mp4';

export const Login = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Import and use useNavigate hook

    const handleSubmit = async (event) => {
        event.preventDefault();

        const credentials = { name, password };

        try {
            const res = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                credentials: 'include', // Include cookies with the request
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Login successful');
                setName('');
                setPassword('');
                dispatch(login({ role: data.role, username: name }));
                setError('');

                // Check if the session cookie is present
                const cookies = document.cookie;
                console.log('Cookies:', cookies); // Log cookies to verify session cookie

                // Navigate to /home after successful login
                navigate('/');
            } else if (res.status === 401) {
                setError('Invalid credentials. Please try again.');
            } else {
                const errorMessage = await res.text();
                setError(`Login failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred during login. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <form onSubmit={handleSubmit} className="form-container">
                    <h2 className="text-2xl mb-4 font-bold text-center" id='text'>Sign in</h2>

                    <div aria-live="assertive" className="error-message">
                        {error && <p className="text-red-500">{error}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700"></label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700"></label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>

                    <p className="mb-4 text-center">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Sign up
                        </Link>
                    </p>

                    <button type="submit" className="submit-btn" id='signin'>SIGN IN</button>
                </form>

                <div className="video-container">
                    <video className="login-video" autoPlay loop muted>
                        <source src={hello} type="video/mp4" />
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
