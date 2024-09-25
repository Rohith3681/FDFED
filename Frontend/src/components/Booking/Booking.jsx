import React from 'react';
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

    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [adults, setAdults] = React.useState(1);
    const [children, setChildren] = React.useState(0);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                // Reset form fields
                setName('');
                setPhone('');
                setStartDate('');
                setEndDate('');
                setAdults(1);
                setChildren(0);
            } else {
                console.log('Booking failed:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const { title, city, distance, price, maxGroupSize, desc, reviews } = tour;

    return (
        <div className="booking-container">
            <div className="tour-details">
                <div className="tour-info">
                    <h2>{title}</h2>
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
                            min={today}  // Restrict to dates from today onwards
                            required
                        />
                    </label>
                    <label>
                        End Date:
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || today}  // Ensure end date is after start date
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
            </div>
        </div>
    );
};

export default Booking;
