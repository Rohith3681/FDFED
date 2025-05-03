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
    const navigate = useNavigate();

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
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Email input
                            placeholder="Email"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="input-field"
                            required
                        />
                        {passwordError && (
                            <span 
                                className="error-message" 
                                data-testid="password-error"
                            >
                                Password must be at least 6 characters
                            </span>
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
