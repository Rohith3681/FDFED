import React from 'react';
import { Card, CardBody, Button, CardImg } from 'reactstrap';
import { useSelector } from 'react-redux';
import './Display.css';
import { useNavigate } from 'react-router-dom';

const Display = ({ tour, showReviewButton, showBookButton }) => {
    const { title, city, price, image } = tour;
    const { role } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const handleSubmit = () => {
        navigate('/booking', { state: { tour } });
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
                                    <Button className="review-button" color="primary">
                                        Review
                                    </Button>
                                )}
                                {showBookButton === 1 && (
                                    <Button className="book-button" color="success" onClick={handleSubmit}>
                                        Book
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Display;
