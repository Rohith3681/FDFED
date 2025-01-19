import React from 'react';
import { Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart } from '../../features/auth/authSlice';

const CartCard = ({ tour }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = async () => {
    try {
      const response = await fetch(`http://localhost:8000/cart/remove/${tour._id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from the cart.');
      }

      // Dispatch Redux action to remove the item locally
      dispatch(removeFromCart(tour._id));
    } catch (error) {
      console.error('Error removing item from cart:', error.message);
    }
  };

  const handleBook = () => {
    navigate('/booking', { state: { tour } });
  };

  const { title, price, image, _id } = tour;

  return (
    <div className="cart-card">
      <img src={`../../../${image}`} alt={title} className="tour-image" />
      <div className="cart-card-details">
        <h5>{title}</h5>
        <p>Price: ${price}</p>
        <Button color="danger" onClick={handleRemove} style={{ marginTop: '10px', width: '100px' }}>
          Remove
        </Button>
        <Button color="primary" onClick={handleBook} style={{ marginTop: '10px', marginLeft: '10px', width: '100px' }}>
          Book
        </Button>
      </div>
    </div>
  );
};

export default CartCard;