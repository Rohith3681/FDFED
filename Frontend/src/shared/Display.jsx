import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, CardImg } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import './Display.css';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../features/auth/authSlice';

const Display = ({ tour, showReviewButton, showBookButton, showUpdateButton, showDeleteButton }) => {
  const { title, city, price, image, _id } = tour;
  const { role, cart = [] } = useSelector((state) => state.auth); // Default cart as empty array
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tours/${_id}`, {
          method: 'GET',
          credentials: 'include', // Include credentials (cookies)
        });
        const data = await response.json();
        if (response.ok) {
          setReviews(data.reviews);
        } else {
          console.error(`Error fetching reviews: ${data.message}`);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, [_id]);

  const handleSubmit = () => {
    navigate('/booking', { state: { tour } });
  };

  const handleReview = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tours/${_id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials (cookies)
        body: JSON.stringify({ review: reviewText }),
      });
      const data = await response.json();
      if (response.ok) {
        setReviewText('');
        setReviews((prevReviews) => [...prevReviews, reviewText]);
      } else {
        console.error(`Review submission failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleAddToCart = async () => {
    console.log(_id)
    try {
      // Send the tour ID to the backend to add it to the user's cart
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/addToCart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send the credentials (cookies)
        body: JSON.stringify({ tourId: _id }), // Send the current tour's ID
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Dispatch the addToCart action to update the Redux store
        dispatch(addToCart(tour));
        console.log('Tour added to cart:', data.cart);  // Optionally log the updated cart
      } else {
        console.error('Failed to add to cart:', data.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  

  const isTourInCart = cart.some((item) => item._id === _id); // Safe access of cart

  return (
    <div className="tour-card">
      <Card className="card1">
        <CardImg 
          top 
          src={image} // Remove the '../../' prefix since we're using base64
          alt={title} 
          className="tour-image-small" 
        />
        <CardBody>
          <div className="card-top d-flex align-items-center justify-content-between">
            <span className="tour-location d-flex align-items-center gap-1">
              <i className="ri-map-pin-line"></i>{city}
            </span>
          </div>
          <h5 className="tour-title">{title}</h5>
          <div className="card-bottom d-flex align-items-center justify-content-between mt-3">
            <h5>${price}<span>/ per person</span></h5>
            {role === "2120" && (
              <div className="d-flex gap-1">
                {showReviewButton === 1 && (
                  <div>
                    <input
                      type="text"
                      placeholder="Write your review"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                    <Button className="review-button" color="primary" onClick={handleReview}>
                      Submit Review
                    </Button>
                  </div>
                )}
                {showBookButton === 1 && (
                  <Button className="book-button" color="success" onClick={handleSubmit}>
                    Book
                  </Button>
                )}
                <Button
                  className="add-to-cart-button"
                  color={isTourInCart ? 'secondary' : 'info'}
                  onClick={handleAddToCart}
                  disabled={isTourInCart} // Disable if the tour is already in the cart
                >
                  {isTourInCart ? 'Added to Cart' : 'Add to Cart'}
                </Button>
              </div>
            )}
          </div>

          {/* Display reviews */}
          <div className="reviews-section mt-3">
            <h6>Reviews:</h6>
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <p key={index} className="review-text">{review}</p>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Display;
