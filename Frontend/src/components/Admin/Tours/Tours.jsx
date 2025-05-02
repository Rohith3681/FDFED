import React, { useState, useEffect } from 'react';
import Display from '../../../shared/Display';
import styles from './Tours.module.css';

const Tours = ({role}) => {
  const [toursData, setToursData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchTours = async () => {
      try {
        const response = await fetch('http://localhost:8000/tours', {
          credentials: 'include',
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setToursData(jsonData);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();

    return () => controller.abort(); // Cleanup on unmount
  }, []);

  const handleDelete = async (tourId) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;

    try {
      const response = await fetch(`http://localhost:8000/tours/delete/${tourId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tour');
      }

      setToursData(toursData.filter(tour => tour._id !== tourId));
    } catch (error) {
      alert(error.message);
    }
  };

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
        className={styles.searchInput}
      />
      <div className={styles.toursContainer}>
        {filteredTours.length > 0 ? (
          filteredTours.map((tour) => (
            <div key={tour._id} className={styles.tourItem}>
              <Display 
                tour={tour} 
                showReviewButton={0} 
                showBookButton={0} 
                showUpdateButton={role === 5150 ? 1 : 0}
              />
              {role === 5150 && (
                <button 
                  className={styles.deleteButton} 
                  onClick={() => handleDelete(tour._id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <div>No tours found</div>
        )}
      </div>
    </main>
  );
};

export default Tours;
