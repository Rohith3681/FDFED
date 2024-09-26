import React from 'react';
import { useLocation } from 'react-router-dom';
import Display from '../../shared/Display';

const SearchResults = () => {
  const location = useLocation();
  const { searchResults } = location.state || {}; // Access search results from the location state

  return (
    <div className="results-container">
      <h3>Search Results:</h3>
      {searchResults && searchResults.length > 0 ? (
        <div className="tour-results">
          {searchResults.map((tour) => (
            <Display
              key={tour._id}
              tour={tour}
              showReviewButton={1}
              showBookButton={1}
              showUpdateButton={1}
              showDeleteButton={1}
            />
          ))}
        </div>
      ) : (
        <p>No tours found for the selected location.</p>
      )}
    </div>
  );
};

export default SearchResults;
