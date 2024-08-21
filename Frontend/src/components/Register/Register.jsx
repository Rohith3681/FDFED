import React, { useState } from 'react';
import './Register.css'
export const Register = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [signedin, setSignedin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        // Construct the user object for submission
        const newUser = {
            name,
            password,
            role,
            // Include employeeId only if the role is 'employee'
            ...(role === 'employee' && { employeeId: employeeNumber })
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
                setPassword('');
                setRole('user');
                setEmployeeNumber('');
                setSignedin(true);
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
        <div>
            <h1>{signedin ? 'Registered Successfully !!!' : 'Please Register'}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading && <p>Loading...</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="role">Role:</label>
                    <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={handleRoleChange}
                        required
                    >
                        <option value="user">User</option>
                        <option value="employee">Employee</option>
                    </select>
                </div>

                {role === 'employee' && (
                    <div>
                        <label htmlFor="employeeNumber">Employee Number:</label>
                        <input
                            type="number"
                            id="employeeNumber"
                            name="employeeNumber"
                            placeholder="Enter your employee number"
                            value={employeeNumber}
                            onChange={(e) => setEmployeeNumber(e.target.value)}
                            required
                        />
                    </div>
                )}

                <button type="submit" disabled={loading}>Submit</button>
            </form>

            {/* Debugging output to ensure the role and employee number state updates */}
            <p>Selected Role: {role}</p>
            {role === 'employee' && <p>Employee Number: {employeeNumber}</p>}
        </div>
    );
};
