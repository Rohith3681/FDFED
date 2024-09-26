import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, CardImg } from 'reactstrap';
import { useSelector } from 'react-redux';
import './Display.css';
import { useNavigate } from 'react-router-dom';

const Display = ({ tour, showReviewButton, showBookButton, showUpdateButton, showDeleteButton }) => {
    const { title, city, price, image, _id } = tour;
    const { role } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [reviewText, setReviewText] = useState("");
    const [reviews, setReviews] = useState([]); // State to store reviews

    // Fetch reviews when the component mounts
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`http://localhost:8000/tours/${_id}`);
                const data = await response.json();
                if (response.ok) {
                    setReviews(data.reviews); // Set reviews from the fetched data
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
            const response = await fetch(`http://localhost:8000/tours/${_id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review: reviewText,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setReviewText(""); // Clear the input field after successful submission
                setReviews((prevReviews) => [...prevReviews, reviewText]); // Add new review to the list
            } else {
                console.error(`Review submission failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    return (
        <div className="tour-card">
            <Card className="card1">
                <CardImg top src={`../../${image}`} alt={title} className="tour-image-small" />
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
