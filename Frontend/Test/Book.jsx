import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const Book = ({ book }) => {
  const navigate = useNavigate();

  if (!book) {
    return null;
  }

  const handleDetailsClick = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="book-card">
      <img 
        src={book.imageUrl} 
        alt={`Cover of ${book.title}`}
        className="book-image"
      />
      <div className="book-info">
        <h3 data-testid="book-title">{book.title}</h3>
        <p data-testid="book-author">{book.author}</p>
        <p data-testid="book-genre">{book.genre}</p>
        <p data-testid="book-price">${book.price}</p>
        <button 
          onClick={handleDetailsClick}
          className="details-link"
          role="link"
        >
          Details
        </button>
      </div>
    </div>
  );
};

Book.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    genre: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    imageUrl: PropTypes.string.isRequired
  }).isRequired
};

export default Book;