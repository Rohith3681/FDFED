import React, { useEffect, useState } from 'react';
import TourCard from '../../shared/TourCard.jsx';
import { Row, Col } from 'reactstrap';
import styles from './FeaturedTourList.module.css';

const FeaturedTourList = () => {
    const [tours, setTours] = useState([]);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await fetch('http://localhost:8000/tours');
                const data = await response.json();
                const sortedTours = data.sort((a, b) => a.id - b.id).slice(0, 8);
                setTours(sortedTours);
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
