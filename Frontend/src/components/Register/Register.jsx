import React, { useState } from 'react';
import './Register.css';
import hello from '../../assets/images/hero-video.mp4'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';

export const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState(''); // Add email state
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [employeeId, setEmployeeId] = useState('');
    const [signedin, setSignedin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const navigate = useNavigate();

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = () => {
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            setLoading(false);
            return;
        } else {
            setPasswordError('');
        }

        const newUser = {
            name,
            email, // Include email in the user object
            password,
            role,
            ...(role === 'employee' && { employeeId })
        };

        try {
            const res = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (res.ok) {
                setName('');
                setEmail(''); // Reset email field
                setPassword('');
                setRole('user');
                setEmployeeId('');
                setSignedin(true);
                navigate('/login');
            } else {
                const errorMessage = await res.text();
                setError(`Error during signup: ${res.status} ${errorMessage}`);
            }
        } catch (error) {
            setError(`Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <form onSubmit={handleSubmit} className="form-container">
                    <h2 id='text' className="text-2xl mb-4 font-bold text-center">
                        {signedin ? 'Registered Successfully !!!' : 'Create Account'}
                    </h2>

                    {error && <p className="text-red-500">{error}</p>}
                    {loading && <p>Loading...</p>}

                    <div className="mb-4">
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <input
                            className="input-field"
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={validateEmail}
                            required
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1" data-testid="email-error">
                                Please enter a valid email address
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setShowPasswordRequirements(true)}
                            onBlur={(e) => {
                                validatePassword();
                                setShowPasswordRequirements(false);
                            }}
                            placeholder="Password"
                            className="input-field"
                            required
                        />
                        {showPasswordRequirements && (
                            <p className="text-gray-600 text-sm mt-1" data-testid="password-requirements">
                                Password must be at least 6 characters long
                            </p>
                        )}
                        {passwordError && (
                            <p 
                                className="text-red-500 text-sm mt-1" 
                                data-testid="password-error"
                            >
                                {passwordError}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <select
                            id="role"
                            value={role}
                            onChange={handleRoleChange}
                            className="input-field"
                            required
                        >
                            <option value="user">User</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>

                    {role === 'employee' && (
                        <div className="mb-4">
                            <input
                                type="number"
                                id="employeeId"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="Employee Number"
                                className="input-field"
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>Submit</button>
                </form>

                <div className="video-container">
                    <video className="register-video" autoPlay loop muted>
                        <source src={hello} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="video-text-overlay">
                        <h1>Hello, Friend!</h1>
                        <p>Enter your personal details and start journey with us</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
