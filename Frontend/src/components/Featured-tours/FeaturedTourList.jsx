import React, { useEffect, useState } from 'react';
import TourCard from '../../shared/TourCard.jsx';
import { Row, Col } from 'reactstrap';
import styles from './FeaturedTourList.module.css';

const FeaturedTourList = () => {
    const [tours, setTours] = useState([]);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tours`, {
                    credentials: 'include', // Include credentials in the request
                });

                // Check if the response is valid
                if (!response.ok) {
                    throw new Error('Failed to fetch tours');
                }

                const data = await response.json();

                // Ensure the fetched data is an array
                if (Array.isArray(data)) {
                    const sortedTours = data.sort((a, b) => a.id - b.id).slice(0, 8);
                    setTours(sortedTours);
                } else {
                    console.error('Fetched data is not an array:', data);
                }

            } catch (error) {
                console.error('Error fetching tours:', error);
            }
        };

        fetchTours();
    }, []);

    return (
        <Row className={styles['card-container']}>
            {tours.map(tour => (
                <Col lg='3' md='6' sm='12' className='mb-4' key={tour.id}>
                    <TourCard tour={tour} />
                </Col>
            ))}
        </Row>
    );
};

export default FeaturedTourList;
