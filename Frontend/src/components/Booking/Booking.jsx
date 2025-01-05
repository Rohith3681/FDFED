import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Booking.css';
import { useSelector } from 'react-redux';

const Booking = () => {
    const { username } = useSelector((state) => state.auth);
    const location = useLocation();
    const { tour } = location.state || {};

    if (!tour) {
        return <div>No tour data available</div>;
    }

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [errors, setErrors] = useState({});
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const validateFields = () => {
        let formErrors = {};
        const phoneRegex = /^\d{10}$/;

        if (name.trim() === '') {
            formErrors.name = 'Name is required';
        }

        if (!phoneRegex.test(phone)) {
            formErrors.phone = 'Phone number must be exactly 10 digits';
        }

        if (startDate === '') {
            formErrors.startDate = 'Start date is required';
        } else if (new Date(startDate) < new Date(today)) {
            formErrors.startDate = 'Start date cannot be in the past';
        }

        if (endDate === '') {
            formErrors.endDate = 'End date is required';
        } else if (new Date(endDate) <= new Date(startDate)) {
            formErrors.endDate = 'End date must be after the start date';
        }

        return formErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateFields();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const bookingData = {
            username,
            tourId: tour._id,
            name,
            phone,
            startDate,
            endDate,
            adults,
            children,
        };

        try {
            const response = await fetch('http://localhost:8000/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Booking successful:', data);
                setBookingSuccess(true); // Set success state
                // Reset form fields
                setName('');
                setPhone('');
                setStartDate('');
                setEndDate('');
                setAdults(1);
                setChildren(0);
                setErrors({});
            } else {
                console.log('Booking failed:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const { title, city, distance, price, maxGroupSize, desc, reviews, image } = tour;

    return (
        <div className="booking-container">
            <div className="tour-details">
                <div className="tour-info">
                    <h2>{title}</h2>
                    <img
                        src={`../../../${image}`}
                        alt={title}
                        className="tour-image"
                    />
                    <p><strong>City:</strong> {city}</p>
                    <p><strong>Distance:</strong> {distance} km</p>
                    <p><strong>Price:</strong> ${price} per person</p>
                    <p><strong>Max Group Size:</strong> {maxGroupSize}</p>
                    <p>{desc}</p>
                    <div className="reviews">
                        <h3>Reviews:</h3>
                        <ul>
                            {reviews.map((review, index) => (
                                <li key={index}>{review}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="booking-form">
                <h2>Book Your Tour</h2>
                {bookingSuccess ? (
                    <div className="success-message">
                        Booking completed successfully!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label>
                            Name:
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {errors.name && <span className="error">{errors.name}</span>}
                        </label>
                        <label>
                            Phone:
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            {errors.phone && <span className="error">{errors.phone}</span>}
                        </label>
                        <label>
                            Start Date:
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={today}
                                required
                            />
                            {errors.startDate && <span className="error">{errors.startDate}</span>}
                        </label>
                        <label>
                            End Date:
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || today}
                                required
                            />
                            {errors.endDate && <span className="error">{errors.endDate}</span>}
                        </label>
                        <label>
                            Number of Adults:
                            <select
                                value={adults}
                                onChange={(e) => setAdults(parseInt(e.target.value))}
                                required
                            >
                                {[...Array(10).keys()].map((num) => (
                                    <option key={num + 1} value={num + 1}>
                                        {num + 1}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Number of Children:
                            <select
                                value={children}
                                onChange={(e) => setChildren(parseInt(e.target.value))}
                            >
                                {[...Array(10).keys()].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button type="submit">Book Now</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Booking;
