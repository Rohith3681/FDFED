import React from 'react';
import { useLocation } from 'react-router-dom';
import TourCard from '../../shared/TourCard.jsx';
import tourData from '../../assets/data/tours';
import { Row, Col } from 'reactstrap';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const searchLocation = query.get('location')?.trim(); // Trim whitespace

  const filteredTours = tourData.filter(tour => 
    tour.city.toLowerCase().includes(searchLocation ? searchLocation.toLowerCase() : '')
  );

  return (
    <div className="total">
      <h2>Search Results</h2>
      <Row className="card-container">
        {filteredTours.length > 0 ? (
          filteredTours.map(tour => (
            <Col lg='3' md='6' sm='12' className='mb-4' key={tour.id}>
              <TourCard tour={tour} />
            </Col>
          ))
        ) : (
          <p className="no-results">No tours found for the location "{searchLocation}".</p>
        )}
      </Row>
    </div>
  );
};

export default SearchResults;
