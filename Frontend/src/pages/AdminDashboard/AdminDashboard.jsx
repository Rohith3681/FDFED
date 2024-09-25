import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import './AdminDashboard.css'; // Import the CSS file

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username } = useParams(); // Access the username from the route params

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate('/'); // Navigate to home after logout
  };

  return (
    <div className="navbar">
      <div>
        <div className="companyname">ADMIN Dashboard</div>
        <div className="navsections">
          <button className="navitem" onClick={() => navigate(`/dashboard1`)}>Login Status</button>
          <button className="navitem" onClick={() => navigate(`/statistics/${username}`)}>Statistics</button>
          <button className="navitem" onClick={() => navigate(`/customers`)}>Customers</button>
          <button className="navitem" onClick={() => navigate(`/tours`)}>Tours</button>
          <button className="navitem" onClick={() => navigate(`/AddAdmin`)}>Add Admin</button>
        </div>
      </div>
      <div className="logoutButton" onClick={handleLogout}>
        Logout
      </div>
    </div>
  );
};

export default AdminDashboard;
