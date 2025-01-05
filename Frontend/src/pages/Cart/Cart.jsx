import React from 'react';
import { useSelector } from 'react-redux';
import CartCard from '../../components/CartCard/CartCard';

const Cart = () => {
  const cart = useSelector((state) => state.auth.cart) || []; // Ensure cart is always an array

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cart.map((tour) => (
            <CartCard 
              key={tour._id} 
              tour={tour} // Pass the entire tour object as a prop
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;
