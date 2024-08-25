import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export const SearchBar = () => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/results/${location}`);
  };

  return (
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
        <i className="ri-search-line"></i>
      </button>
    </div>
  );
}
