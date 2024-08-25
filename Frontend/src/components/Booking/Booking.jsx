import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
    const location = useLocation();
    const { tour } = location.state || {}; // Get tour details from location state

    if (!tour) {
        return <div>No tour data available</div>;
    }

    const { title, city, distance, price, maxGroupSize, desc, photo } = tour;
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log({ name, phone, startDate, endDate, adults, children });
    };

    return (
        <div className="booking-container">
            <div className="tour-details">
                <img src={photo} alt={title} className="tour-image" />
                <div className="tour-info">
                    <h2>{title}</h2>
                    <p><strong>City:</strong> {city}</p>
                    <p><strong>Distance:</strong> {distance} km</p>
                    <p><strong>Price:</strong> ${price} per person</p>
                    <p><strong>Max Group Size:</strong> {maxGroupSize}</p>
                    <p>{desc}</p>
                </div>
            </div>
            <div className="booking-form">
                <h2>Book Your Tour</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Phone:
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Start Date:
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        End Date:
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Number of Adults:
                        <select
                            value={adults}
                            onChange={(e) => setAdults(parseInt(e.target.value))}
                            required
                        >
                            {[...Array(maxGroupSize).keys()].map((num) => (
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
                            {[...Array(maxGroupSize).keys()].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button type="submit">Book Now</button>
                </form>
            </div>
        </div>
    );
};

export default Booking;
