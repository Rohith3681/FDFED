import React, { useEffect, useState } from 'react';
import Display from '../../shared/Display'; // Import the Display component
import './Book.css';

const Book = () => {
    const [tours, setTours] = useState([]); // All available tours
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tours from the backend
    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await fetch('http://localhost:8000/tours', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include credentials (cookies) in the request
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch tours');
                }

                const data = await response.json();
                setTours(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching tours:', err);
                setError('Failed to fetch tours');
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    // Handle loading and error states
    if (loading) return <p>Loading tours...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="tours-container">
            <div className="section-title">
                <h2>Available Tours</h2>
                <p>Discover amazing destinations and book your next adventure</p>
            </div>
            
            {loading ? (
                <div className="loading">Loading tours...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="tour-list">
                    {tours.length > 0 ? (
                        tours.map((tour) => (
                            <Display 
                                key={tour._id} 
                                tour={tour} 
                                showReviewButton={1} 
                                showBookButton={1} 
                            />
                        ))
                    ) : (
                        <div className="no-tours">
                            <p>No tours available.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Book;
