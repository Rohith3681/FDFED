import React from 'react';
import { useParams } from 'react-router-dom';
import TourCard from '../../shared/TourCard.jsx';
import tourData from '../../assets/data/tours';
import { Row, Col } from 'reactstrap';
import './SearchResults.css'; // Import the global CSS file

const SearchResults = () => {
  const { location } = useParams();

  const filteredTours = tourData.filter(tour => 
    tour.city.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div>
      <h2>Search Results</h2>
      <Row className="card-container">
        {filteredTours.length > 0 ? (
          filteredTours.map(tour => (
            <Col lg='3' md='6' sm='12' className='mb-4' key={tour.id}>
              <TourCard tour={tour} />
            </Col>
          ))
        ) : (
          <p>No tours found for the location "{location}".</p>
        )}
      </Row>
    </div>
  );
};

export default SearchResults;
