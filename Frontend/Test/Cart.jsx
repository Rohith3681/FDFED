import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartCard from './CartCard'; // Updated import path
import styles from './Cart.module.css';

const Cart = () => {
  const cart = useSelector((state) => state.auth.cart) || [];
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles['cart-container']}>
        <h1 className={styles['cart-header']}>Your Cart</h1>
        {cart.length === 0 ? (
          <div className={styles['empty-cart']}>
            <p>Your cart is empty. Start exploring amazing tours!</p>
            <button 
              className={styles['btn-book']} 
              onClick={() => navigate('/')}
            >
              Browse Tours
            </button>
          </div>
        ) : (
          <div className={styles['cart-list']}>
            {cart.map((tour) => (
              <CartCard key={tour._id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;