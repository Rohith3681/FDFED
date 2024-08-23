import React from 'react';
import './SearchBar.css';

export const SearchBar = () => {
  return (
    <div className="search-bar">
      <div className="input-wrapper">
        <span className="icon">&#128205;</span>
        <textarea 
          className="search-input" 
          placeholder="Location"
        />
      </div>
      <div className="input-wrapper">
        <span className="icon">&#128207;</span>
        <textarea 
          className="search-input" 
          placeholder="Distance"
        />
      </div>
      <div className="input-wrapper">
        <span className="icon">&#128101;</span>
        <textarea 
          className="search-input" 
          placeholder="Max People"
        />
      </div>
      <button className="search-button">Search</button>
    </div>
  );
}
