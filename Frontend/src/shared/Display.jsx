import React from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import './Display.css'; // Regular CSS file import
import { useNavigate } from 'react-router-dom';

const Display = ({ tour }) => {
    const { title, city, price } = tour;

    // Get the logged-in user's role from the state
    const { role } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const handleSubmit = () => {
        navigate('/booking', { state: { tour } }); // Navigate to the Booking page (update path if needed)
    };
    // Render the card with conditional buttons
    return (
        <div className="tour-card">
            <Card className="card">
                <CardBody>
                    <div className="card-top d-flex align-items-center justify-content-between">
                        <span className="tour-location d-flex align-items-center gap-1">
                            <i className="ri-map-pin-line"></i>{city}
                        </span>
                    </div>

                    <h5 className="tour-title">
                        {title}
                    </h5>

                    <div className="card-bottom d-flex align-items-center justify-content-between mt-3">
                        <h5>${price}<span>/ per person</span></h5>

                        {/* Show both Review and Book buttons if the role is 'user' */}
                        {role === "2120" && (
                            <div className="d-flex gap-2">
                                <Button className="review-button" color="primary">
                                    Review
                                </Button>
                                <Button className="book-button" color="success" onClick = {handleSubmit}>
                                    Book
                                </Button>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Display;
