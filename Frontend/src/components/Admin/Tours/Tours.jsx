import React, { useState, useEffect } from 'react';
import Display from '../../../shared/Display';
import styles from './Tours.module.css'; // Create this CSS file for styling

const Tours = ({role}) => {
  const [toursData, setToursData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch('http://localhost:8000/tours', {
          credentials: 'include', // Include credentials in the request
        });
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setToursData(jsonData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const filteredTours = toursData.filter(tour =>
    tour.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <main className="maincontainer">
      <h1>Tours</h1>
      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput} // Optional: Create a CSS class for styling
      />
      <div className={styles.toursContainer}>
        {filteredTours.length > 0 ? (
          filteredTours.map((tour) => (
            <Display 
              key={tour._id} 
              tour={tour} 
              showReviewButton={0} 
              showBookButton={0} 
              showUpdateButton={role === 5150 ? 1 : 0} // Show update button based on role
            />
          ))
        ) : (
          <div>No tours found</div>
        )}
      </div>
    </main>
  );
};

export default Tours;
