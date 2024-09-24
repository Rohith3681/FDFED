import React, { useState } from 'react';
import './AddAdmin.css'; // Import CSS for styling

const AddAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8000/adminSignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: username,
          password: password,
        }),
      });

      if (response.ok) {
        setMessage('Admin signed up successfully.');
      } else {
        setMessage('Signup failed.');
      }
    } catch (error) {
      setMessage('An error occurred during signup.');
    }
  };

  return (
    <div className="admin-signup-container">
      <h1>Add Admin</h1> {/* Updated heading */}
      <form onSubmit={handleSignup} className="admin-signup-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
      {message && <p className="signup-message">{message}</p>}
    </div>
  );
};

export default AddAdmin;
