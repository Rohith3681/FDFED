import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import styles from "./TourCard.module.css";
import classNames from 'classnames';

const TourCard = ({ tour }) => {
    const { id, title, city, photo, price, featured, reviews } = tour;

    const totalRating = reviews?.reduce((acc, item) => acc + item.rating, 0);
    const avgRating = reviews?.length === 0 ? "" : (totalRating / reviews.length).toFixed(1);

    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate(`/booking/${id}`, { state: { tour } });
    };

    return (
        <div className={styles.tour_card}>
            <Card>
                <div className={styles.tour_img}>
                    <img src={photo} alt="tour" />
                    {featured && <span>Featured</span>}
                </div>
                <CardBody>
                    <div className={classNames(
                        styles.card_top,
                        styles['d-flex'],
                        styles['align-items-center'],
                        styles['justify-content-between']
                    )}>
                        <span className={classNames(
                            styles.tour_location,
                            styles['d-flex'],
                            styles['align-items-center'],
                            styles['gap-1']
                        )}>
                            <i className="ri-map-pin-line"></i>{city}
                        </span>
                        <span className={classNames(
                            styles.tour_rating,
                            styles['d-flex'],
                            styles['align-items-center'],
                            styles['gap-1']
                        )}>
                            <i className="ri-star-fill"></i>{avgRating ? avgRating : "Not Rated"}
                            {totalRating > 0 && (<span>({reviews.length})</span>)}
                        </span>
                    </div>

                    <h5 
                        className={styles.tour_title} 
                        onClick={handleNavigation} 
                    >
                        {title}
                    </h5>

                    <div className={classNames(
                        styles.card_bottom,
                        styles['d-flex'],
                        styles['align-items-center'],
                        styles['justify-content-between'],
                        styles['mt-3']
                    )}>
                        <h5>${price}<span>/per person</span></h5>
                        <button 
                            className={classNames(styles.btn, styles.booking_btn)}
                            onClick={handleNavigation}
                        >
                            Book Now
                        </button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default TourCard;
