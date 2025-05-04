import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Display from './Display';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [tours, setTours] = useState([]);
  const { role, username } = useSelector((state) => state.auth);
  const [revenue, setRevenue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeTours = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }
        const data = await response.json();
        setTours(data.tours);
        
        // Calculate total revenue from all tours including children's bookings
        const totalRevenue = data.tours.reduce((total, tour) => {
          const tourBookings = tour.bookedBy || [];
          const tourRevenue = tourBookings.reduce((bookingTotal, booking) => {
            const adultCost = (booking.adults || 1) * tour.price;
            const childCost = (booking.children || 0) * (tour.price * 0.5);
            return bookingTotal + adultCost + childCost;
          }, 0);
          return total + tourRevenue;
        }, 0);
        
        // Set revenue as 90% of total
        setRevenue(totalRevenue * 0.9);
      } catch (error) {
        console.error('Error fetching employee tours:', error);
      }
    };
  
    fetchEmployeeTours();
  }, [username]);

  if (role !== '8180') {
    return <div className={styles.accessDenied}>You do not have access to this dashboard.</div>;
  }

  const handleCreateTour = () => {
    navigate('/create');
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebarContainer}>
        <h1 className={styles.dashboardTitle}>Employee Dashboard</h1>
        <p className={styles.welcomeText} data-testid="welcome-message">Welcome back, {username}</p>
        <div className={styles.statsCards}>
          <div className={styles.statCard} data-testid="revenue-card">
            <h3>Total Revenue (90%)</h3>
            <p className={styles.statValue}>₹{revenue.toFixed(2)}</p>
          </div>
          <div className={styles.statCard} data-testid="tours-card">
            <h3>Total Tours</h3>
            <p className={styles.statValue}>{tours.length}</p>
          </div>
          <div className={styles.statCard} data-testid="bookings-card">
            <h3>Total Bookings</h3>
            <p className={styles.statValue}>
              {tours.reduce((total, tour) => total + (tour.bookedBy?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.mainContentContainer}>
        <div className={styles.mainContent}>
          <div className={styles.headerActions}>
            <h2>Your Created Tours</h2>
            <button 
              className={styles.createTourBtn} 
              onClick={handleCreateTour}
              data-testid="create-tour-button"
            >
              Create New Tour
            </button>
          </div>
          <div className={styles.toursGrid} data-testid="tours-grid">
            {tours.length > 0 ? (
              tours.map((tour) => (
                <div key={tour._id} className={styles.tourCard}>
                  <Display
                    tour={tour}
                    showReviewButton={0}
                    showBookButton={0}
                    showUpdateButton={1}
                    showDeleteButton={1}
                  />
                  <div className={styles.tourRevenue}>
                    <h4>Tour Revenue</h4>
                    <p>₹{((tour.price || 0) * (tour.bookedBy?.length || 0)).toFixed(2)}</p>
                  </div>
                  <div className={styles.bookings}>
                    <h4>Bookings ({tour.bookedBy?.length || 0})</h4>
                    {tour.bookedBy && tour.bookedBy.length > 0 ? (
                      <ul className={styles.bookingsList}>
                        {tour.bookedBy.map((user) => (
                          <li key={user._id}>{user.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.noBookings}>No bookings yet</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noTours}>
                <p>No tours created yet.</p>
                <button className={styles.createTourBtn} onClick={handleCreateTour}>
                  Create Your First Tour
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
