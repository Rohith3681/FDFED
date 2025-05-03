import React from 'react';
import PropTypes from 'prop-types';

const CartCard = ({ tour }) => {
  return (
    <div className="cart-card" data-testid="cart-card">
      <h3>{tour.title}</h3>
      <p>${tour.price}</p>
    </div>
  );
};

CartCard.propTypes = {
  tour: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired
  }).isRequired
};

export default CartCard;