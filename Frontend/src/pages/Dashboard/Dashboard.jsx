import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Display from '../../shared/Display';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [tours, setTours] = useState([]);
  const { role, username } = useSelector((state) => state.auth);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const fetchEmployeeTours = async () => {
      try {
        const response = await fetch(`http://localhost:8000/dashboard`, {
          method: 'GET',
          credentials: 'include', // Include credentials (cookies) in the request
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tours');
        }
        const data = await response.json();
        setTours(data.tours);
        setRevenue(data.revenue || 0);
      } catch (error) {
        console.error('Error fetching employee tours:', error);
      }
    };
  
    fetchEmployeeTours();
  }, [username]);
  

  if (role !== '8180') {
    return <div>You do not have access to this dashboard.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Welcome, {username}</h2>
      {tours.length > 0 && <h3>Total Revenue: ${revenue.toFixed(2)}</h3>}
      <h3>Your Created Tours</h3>
      <div>
        {tours.length > 0 ? (
          tours.map((tour) => (
            <div key={tour._id} className={styles.tourItem}>
              <Display
                tour={tour}
                showReviewButton={0}
                showBookButton={0}
                showUpdateButton={1}
                showDeleteButton={1}
              />
              <p>Tour Revenue: ${(tour.price || 0) * (tour.bookedBy?.length || 0).toFixed(2)}</p>
              <p>Booked by Users:</p>
              <ul>
                {tour.bookedBy && tour.bookedBy.length > 0 ? (
                  tour.bookedBy.map((user) => <li key={user._id}>{user.name}</li>)
                ) : (
                  <li>No bookings yet</li>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p>No tours created yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
