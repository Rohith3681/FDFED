import React from 'react';
import './SearchBar.css';

export const SearchBar = () => {
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
          />
        </div>
      </div>
      <div className="input-wrapper">
        <span className="icon"><i className="ri-pin-distance-line"></i></span>
        <div className="input-content">
          <label className="input-label">Distance</label>
          <input 
            className="search-input" 
            type="text" 
            placeholder="565" 
          />
        </div>
      </div>
      <div className="input-wrapper">
        <span className="icon"><i className="ri-group-line"></i></span>
        <div className="input-content">
          <label className="input-label">Max People</label>
          <input 
            className="search-input" 
            type="text" 
            placeholder="65656" 
          />
        </div>
      </div>
      <button className="search-button"><i className="ri-search-line"></i></button>
    </div>
  );
}
