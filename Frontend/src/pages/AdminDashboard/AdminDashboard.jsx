import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import './AdminDashboard.css'; // Import the CSS file

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/'); // Navigate to home after logout
  };

  return (
    <div className="navbar">
      <div>
        <div className="companyname">ADMIN Dashboard</div>
        <div className="navsections">
          <button className="navitem" onClick={() => navigate('/statistics')}>Statistics</button>
          <button className="navitem" onClick={() => navigate('/customers')}>Customers</button>
          <button className="navitem" onClick={() => navigate('/tours')}>Tours</button>
          <button className="navitem" onClick={() => navigate('/AddAdmin')}>Add Admin</button>
        </div>
      </div>
      <div className="logoutButton" onClick={handleLogout}>
        Logout
      </div>
    </div>
  );
};

export default AdminDashboard;
