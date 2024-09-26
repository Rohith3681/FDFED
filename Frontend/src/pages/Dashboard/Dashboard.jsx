import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Display from '../../shared/Display';

const Dashboard = () => {
    const [tours, setTours] = useState([]);
    const [names, setNames] = useState([]);
    const { role, username } = useSelector((state) => state.auth);
    const [revenue, setRevenue] = useState(0);

    useEffect(() => {
        const fetchEmployeeTours = async () => {
            if (role === '8180') {
                try {
                    console.log(`Fetching tours for username: ${username}`);
                    const response = await fetch(`http://localhost:8000/dashboard/${username}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch tours');
                    }
                    const data = await response.json();
                    console.log('Fetched tours:', data.tours);
                    setTours(data.tours);
                    setNames(data.names)
                    setRevenue(data.revenue); // Revenue fetched from the server
                } catch (error) {
                    console.error('Error fetching employee tours:', error);
                }
            }
        };

        fetchEmployeeTours();
    }, [role, username]);

    if (role !== '8180') {
        return <div>You do not have access to this dashboard.</div>;
    }

    return (
        <div>
            <h2>Welcome, {username}</h2>
            {tours.length > 0 && (
                <h3>Total Revenue: ${revenue.toFixed(2)}</h3> 
            )}
            <h3>Your Created Tours</h3>
            <div>
                {tours.length > 0 ? (
                    tours.map((tour) => (
                        <div key={tour._id}>
                            <Display 
                                tour={tour} 
                                showReviewButton={0} 
                                showBookButton={0} 
                                showUpdateButton={1} 
                                showDeleteButton={1}
                            />
                            <p>Tour Revenue: ${(tour.price * tour.count).toFixed(2)}</p>
                            <p>Booked by Users:</p>
                            <ul>
                                {tour.bookedBy.length > 0 ? (
                                    tour.bookedBy.map((user) => (
                                        <li key={user._id}>{user.name}</li> // Display the user's name
                                    ))
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
