import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import Revenue from '../Revenue/Revenue';

const Statistics = () => {
  const [statisticsData, setStatisticsData] = useState(null);
  const chartContainerRef = useRef(null); // Reference to the canvas container
  const chartInstanceRef = useRef(null);  // Reference to the chart instance

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/tour-info', {
          credentials: 'include', // Include credentials in the request (e.g., cookies)
        });
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const jsonData = await response.json();
        setStatisticsData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (statisticsData && chartContainerRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartContainerRef.current.getContext('2d');

      // Create new chart instance
      chartInstanceRef.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Total Tours', 'Total Bookings'],
          datasets: [{
            data: [statisticsData.totalTours, statisticsData.totalBookings],
            backgroundColor: ['#D8BB27', '#2744D8'],
          }],
        },
      });
    }
  }, [statisticsData]);

  return (
    <main className="maincontainer">
      <Revenue />
      <h1>Statistics</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}><h2 style={{ color: '#008080' }}>Statistics</h2></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '90px', height: '80vh', overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
            <div style={{ height: '300px', width: '300px' }}>
              <h3 style={{ color: '#088F8F' }}>Total Tours vs Total Bookings</h3>
              <canvas ref={chartContainerRef} style={{ height: '300px', width: '300px' }} />
              {statisticsData && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ fontWeight: 'bold' }}>Total Tours: {statisticsData.totalTours}</p>
                  <p style={{ fontWeight: 'bold' }}>Total Bookings: {statisticsData.totalBookings}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Statistics;
