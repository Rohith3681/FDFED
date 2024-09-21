import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Display from '../../shared/Display';

const Profile = () => {
  const { username } = useSelector((state) => state.auth);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      if (username) {
        try {
          const response = await fetch(`http://localhost:8000/user/profile/${username}`);
          if (response.ok) {
            const data = await response.json();
            setUserDetails(data);
          } else {
            setError('Error fetching user details or bookings.');
          }
        } catch (err) {
          setError('Failed to fetch user profile.');
          console.error('Error:', err);
        }
      }
    };

    fetchUserAndBookings();
  }, [username]);

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : userDetails ? (
        <div className="bookings-details">
          <h2>Username: {userDetails.name}</h2>
          <h3>Booked Tours:</h3>
          {userDetails.bookings.length > 0 ? (
            <div className="tour-cards-container">
              {userDetails.bookings.map((tour) => (
                <Display key={tour._id} tour={tour} />
              ))}
            </div>
          ) : (
            <p>No bookings found.</p>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
