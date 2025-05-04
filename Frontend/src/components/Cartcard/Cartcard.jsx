import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart } from '../../features/auth/authSlice';
import styles from './CartCard.module.css';

const CartCard = ({ tour }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cart/remove/${tour._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from the cart.');
      }
      dispatch(removeFromCart(tour._id));
    } catch (error) {
      console.error('Error removing item from cart:', error.message);
    }
  };

  const { title, price, image, city } = tour;

  return (
    <div className={styles['cart-card']}>
      <img src={`../../../${image}`} alt={title} className={styles['tour-image']} />
      <div className={styles['cart-card-details']}>
        <div className={styles['tour-info']}>
          <h3 className={styles['tour-title']}>{title}</h3>
          <p className={styles['tour-location']}>{city}</p>
          <p className={styles['tour-price']}>₹{price}</p>
        </div>
        <div className={styles['button-group']}>
          <button className={styles['btn-remove']} onClick={handleRemove}>
            Remove
          </button>
          <button 
            className={styles['btn-book']} 
            onClick={() => navigate('/booking', { state: { tour } })}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartCard;