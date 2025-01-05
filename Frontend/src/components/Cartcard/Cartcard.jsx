import React from 'react';
import { Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart } from '../../features/auth/authSlice';


const CartCard = ({ tour }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = () => {
    dispatch(removeFromCart(tour._id)); // Remove the tour from the cart
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
        <Button color="danger" onClick={handleRemove} style={{ marginTop: '10px',width:'100px' }}>
          Remove
        </Button>
        <Button color="primary" onClick={handleBook} style={{ marginTop: '10px', marginLeft: '10px',width:'100px' }}>
          Book
        </Button>
      </div>
    </div>
  );
};

export default CartCard;
