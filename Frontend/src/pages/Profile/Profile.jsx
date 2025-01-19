import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Display from '../../shared/Display';
import "./Profile.css"

const Profile = () => {
  const { username } = useSelector((state) => state.auth);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      if (username) {
        try {
          const response = await fetch('http://localhost:8000/user/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Include credentials (cookies) in the request
          });

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
          <h2>Username: {userDetails.user}</h2>

          <h3>Ongoing Bookings:</h3>
          {userDetails.ongoingBookings && userDetails.ongoingBookings.length > 0 ? (
            <div className="tour-cards-container">
              {userDetails.ongoingBookings.map((booking) => (
                <Display 
                  key={booking._id} 
                  tour={booking.tour} // Access the tour details
                  showReviewButton={1} 
                  showBookButton={0} 
                  showUpdateButton={0}
                  showDeleteButton={0}
                />
              ))}
            </div>
          ) : (
            <p>No ongoing bookings found.</p>
          )}

          <h3>Upcoming Bookings:</h3>
          {userDetails.upcomingBookings && userDetails.upcomingBookings.length > 0 ? (
            <div className="tour-cards-container">
              {userDetails.upcomingBookings.map((booking) => (
                <Display 
                  key={booking._id} 
                  tour={booking.tour} // Access the tour details
                  showReviewButton={0} 
                  showBookButton={0} 
                />
              ))}
            </div>
          ) : (
            <p>No upcoming bookings found.</p>
          )}

          <h3>Completed Bookings:</h3>
          {userDetails.completedBookings && userDetails.completedBookings.length > 0 ? (
            <div className="tour-cards-container">
              {userDetails.completedBookings.map((booking) => (
                <Display 
                  key={booking._id} 
                  tour={booking.tour} // Access the tour details
                  showReviewButton={1} 
                  showBookButton={1} 
                />
              ))}
            </div>
          ) : (
            <p>No completed bookings found.</p>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;