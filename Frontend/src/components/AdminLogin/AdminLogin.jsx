import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../features/auth/authSlice'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // Import the CSS file

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/adminLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: username, password }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess('Login successful! Admin ID: ' + result.id);
        setError('');

        // Dispatch login action to Redux
        dispatch(login({ role: '5150', username: result.name }));

        // Clear input fields
        setUsername('');
        setPassword('');

        // Navigate to /Admin route
        navigate(`/Admin/${username}`);
      } else {
        setError(result.message || 'Login failed');
        setSuccess('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="admin-container">
      <form onSubmit={handleLogin} className="admin-form">
      <h1 className="admin-title">Admin Login</h1>
        <div className="form-group">
          <input
            type="text"
            id="username"
            placeholder='Admin UserName'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};

export default Admin;
