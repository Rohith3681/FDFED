import React, { useState, useEffect } from 'react';
import "./RecentBookings.css";

const RecentBookings = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/recent-bookings`, {
                credentials: 'include', // Include credentials in the request (e.g., cookies)
            });
            const data = await res.json();
            setBookings(data.recentBookings || []); // Ensure bookings is always an array
        } catch (error) {
            console.error('Error fetching recent bookings:', error);
        }
    };

    return (
        <div className="recent-bookings-container">
            <h1>Recent Bookings</h1>
            <table className="recent-bookings-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Tour</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Adults</th>
                        <th>Children</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>{booking.name}</td>
                                <td>{booking.tour ? booking.tour.title : 'N/A'}</td>
                                <td>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{booking.adults}</td>
                                <td>{booking.children}</td>
                                <td>{booking.phone}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No recent bookings available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RecentBookings;
