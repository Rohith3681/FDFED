import React, { useEffect } from 'react';
import { Navbar } from '../../components/Navbar/Navbar'; // Update the path as needed
import { useSelector } from 'react-redux';
import ROLES from '../../roles.js';

const Profile = () => {
  
  const { role, username } = useSelector((state) => state.auth);
  const Role = ROLES[role];
  return (
    <>
      <div className="profile-container">
        <h1>Profile</h1>
        {username ? (
          <div className="profile-details">
            <h2>Username: {username}</h2>
          </div>
        ) : (
          <p>No user logged in</p>
        )}
      </div>
    </>
  );
};

export default Profile;
