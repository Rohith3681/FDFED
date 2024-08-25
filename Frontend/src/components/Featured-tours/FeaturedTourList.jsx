import React from 'react';
import TourCard from '../../shared/TourCard.jsx';
import tourData from '../../assets/data/tours';
import { Row, Col } from 'reactstrap';
import styles from './FeaturedTourList.module.css'; // Import your CSS module if necessary

const FeaturedTourList = () => {
    return (
        <Row className={styles['card-container']}>
            {tourData?.map(tour => (
                <Col lg='3' md='6' sm='12' className='mb-4' key={tour.id}>
                    <TourCard tour={tour} />
                </Col>
            ))}
        </Row>
    );
};

export default FeaturedTourList;
