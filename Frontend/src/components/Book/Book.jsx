import React, { useEffect, useState } from 'react';
import Display from '../../shared/Display'; // Import the Display component

const Book = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await fetch('http://localhost:8000/tours'); // Native fetch API
                if (!response.ok) {
                    throw new Error('Failed to fetch tours');
                }
                const data = await response.json(); // Parse the JSON response
                setTours(data); // Set the fetched tours in the state
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

    // Render the list of tours using the Display component
    return (
        <div className="tours-container">
            {tours.length > 0 ? (
                tours.map((tour) => (
                    <Display key={tour._id} tour={tour} />
                ))
            ) : (
                <p>No tours available</p>
            )}
        </div>
    );
};

export default Book;
