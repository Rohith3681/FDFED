import React, { useState, useEffect } from 'react';

const Revenue = () => {
  const [revenue, setRevenue] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await fetch('http://localhost:8000/adminRevenue', {
          credentials: 'include', // Include credentials in the request (cookies, etc.)
        });
        if (!response.ok) {
          throw new Error('Failed to fetch revenue');
        }
        const data = await response.json();
        setRevenue(data.revenue); // Assuming the response structure includes revenue
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <div>
      <h1>Revenue</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Total Revenue: ${revenue}</p>
    </div>
  );
};

export default Revenue;
