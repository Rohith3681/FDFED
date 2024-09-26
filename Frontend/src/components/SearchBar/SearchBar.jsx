import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';
import yourImage from '../../assets/images/search2.jpg'; // Adjust the path as needed

export const SearchBar = () => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:8000/tours/search/${location.trim()}`);
      const data = await response.json();
      if (response.ok) {
        navigate('/results', { state: { searchResults: data } });
      } else {
        console.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  };

  return (
    <div className="search-bar-container">
      <div className="text-section">
        <h2 className="search-heading">Find Your Next Adventure</h2>
        <p className="search-subheading">
          <b>"Unleash Your Wanderlust"</b><br />
          Searching for your next adventure is more than just finding a destination; it’s about discovering new experiences that will stay with you forever.
        </p>
        <div className="search-bar">
          <div className="input-wrapper">
            <span className="icon"><i className="ri-map-pin-range-line"></i></span>
            <div className="input-content">
              <label className="input-label">Location</label>
              <input
                className="search-input"
                type="text"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <button className="search-button" onClick={handleSearch}>
            <i className="ri-search-line"></i> Search
          </button>
        </div>
      </div>
      <div className="image-section">
        <img src={yourImage} alt="Adventure" className="adventure-image" />
      </div>
    </div>
  );
};
