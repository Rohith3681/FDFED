import React from 'react';
import PropTypes from 'prop-types';

const Display = ({ tour, showReviewButton, showBookButton, showUpdateButton, showDeleteButton }) => {
  if (!tour) return null;

  return (
    <div className="tour-card" data-testid={`tour-${tour._id}`}>
      <h3>{tour.title}</h3>
      <div className="tour-details">
        <p>Price: ₹{tour.price}</p>
        {tour.city && <p>City: {tour.city}</p>}
        {showBookButton === 1 && (
          <button className="book-button">Book Now</button>
        )}
        {showReviewButton === 1 && (
          <button className="review-button">Add Review</button>
        )}
        {showUpdateButton === 1 && (
          <button className="update-button">Update</button>
        )}
        {showDeleteButton === 1 && (
          <button className="delete-button">Delete</button>
        )}
      </div>
    </div>
  );
};

Display.propTypes = {
  tour: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    city: PropTypes.string,
  }).isRequired,
  showReviewButton: PropTypes.number,
  showBookButton: PropTypes.number,
  showUpdateButton: PropTypes.number,
  showDeleteButton: PropTypes.number
};

Display.defaultProps = {
  showReviewButton: 0,
  showBookButton: 0,
  showUpdateButton: 0,
  showDeleteButton: 0
};

export default Display;