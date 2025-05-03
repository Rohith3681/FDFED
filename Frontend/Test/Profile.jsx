import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Display from './Display';
import "./Profile.css";

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
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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

  const handleCancelBooking = async (bookingId) => {
    if (!bookingId) {
      console.error("Invalid booking ID");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/cancel/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        setUserDetails((prev) => ({
          ...prev,
          upcomingBookings: prev.upcomingBookings.filter(booking => booking._id !== bookingId),
        }));
      } else {
        console.error('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : userDetails ? (
        <div className="bookings-details">
          <h2>Username: {userDetails.user}</h2>

          {["ongoingBookings", "upcomingBookings", "completedBookings"].map((category) => (
            <div key={category}>
              <h3>
                {category === "ongoingBookings" ? "Ongoing Bookings" : 
                 category === "upcomingBookings" ? "Upcoming Bookings" : "Completed Bookings"}
              </h3>

              {userDetails[category]?.length > 0 ? (
                <div className="tour-cards-container">
                  {userDetails[category].map((booking) => (
                    <div key={booking._id} className="booking-card">
                      <Display 
                        tour={booking.tour} 
                        showReviewButton={category !== "upcomingBookings"} 
                        showBookButton={category === "completedBookings"} 
                      />
                      <p className="booking-cost">Cost: ${booking.cost?.toFixed(2)}</p>
                      {category === "upcomingBookings" && ( 
                        <button 
                          className="cancel-button"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No {category.replace("Bookings", "").toLowerCase()} bookings found.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;