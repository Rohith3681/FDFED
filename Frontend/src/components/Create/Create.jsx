import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import "./Create.module.css"

const Create = () => {
  const { username } = useSelector((state) => state.auth);

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    const newErrors = {};

    // Check if all fields are filled
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!city.trim()) newErrors.city = 'City is required.';
    if (!address.trim()) newErrors.address = 'Address is required.';
    if (!distance.trim()) newErrors.distance = 'Distance is required.';
    if (!price.trim()) newErrors.price = 'Price is required.';
    if (!desc.trim()) newErrors.desc = 'Description is required.';
    if (!image) newErrors.image = 'Image is required.';

    // If all fields are filled, perform additional validation
    if (Object.keys(newErrors).length === 0) {
      if (title.length < 3) newErrors.title = 'Title must be at least 3 characters long.';
      if (city.length < 2) newErrors.city = 'City must be at least 2 characters long.';
      if (address.length < 5) newErrors.address = 'Address must be at least 5 characters long.';
      if (isNaN(distance) || distance <= 0) newErrors.distance = 'Distance must be a positive number.';
      if (isNaN(price) || price <= 0) newErrors.price = 'Price must be a positive number.';
      if (desc.length < 10) newErrors.desc = 'Description must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'distance':
        setDistance(value);
        break;
      case 'price':
        setPrice(value);
        break;
      case 'desc':
        setDesc(value);
        break;
      case 'image':
        setImage(e.target.files[0]);
        break;
      default:
        break;
    }
    // Clear errors for the current field
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateInputs()) return;
  
    setLoading(true);
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('city', city);
    formData.append('address', address);
    formData.append('distance', distance);
    formData.append('price', price);
    formData.append('desc', desc);
    formData.append('username', username); // Keep username in formData
    if (image) {
      formData.append('image', image);
    }
  
    try {
      const response = await fetch('http://localhost:8000/create', {
        method: 'POST',
        body: formData, // Do not set Content-Type manually when using FormData
        credentials: 'include', // Include credentials (cookies) in the request
      });
  
      const result = await response.json();
      if (response.ok) {
        setStatusMessage('Tour created successfully!');
        // Reset form fields
        setTitle('');
        setCity('');
        setAddress('');
        setDistance('');
        setPrice('');
        setDesc('');
        setImage(null);
        setErrors({});
      } else {
        setStatusMessage(`Failed to create tour: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setStatusMessage('Error creating tour.');
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div >
      <h1>Create New Entry</h1>
      {statusMessage && <p>{statusMessage}</p>}
      <form onSubmit={handleSubmit} className='Container'>
        <div>
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" name="title" value={title} onChange={handleChange} />
          {errors.title && <p style={{ color: 'red' }}>{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="city">City:</label>
          <input type="text" id="city" name="city" value={city} onChange={handleChange} />
          {errors.city && <p style={{ color: 'red' }}>{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input type="text" id="address" name="address" value={address} onChange={handleChange} />
          {errors.address && <p style={{ color: 'red' }}>{errors.address}</p>}
        </div>
        <div>
          <label htmlFor="distance">Distance:</label>
          <input type="number" id="distance" name="distance" value={distance} onChange={handleChange} />
          {errors.distance && <p style={{ color: 'red' }}>{errors.distance}</p>}
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input type="number" id="price" name="price" value={price} onChange={handleChange} />
          {errors.price && <p style={{ color: 'red' }}>{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="desc">Description:</label>
          <textarea id="desc" name="desc" value={desc} onChange={handleChange} />
          {errors.desc && <p style={{ color: 'red' }}>{errors.desc}</p>}
        </div>
        <div>
          <label htmlFor="image">Upload Image:</label>
          <input type="file" id="image" name="image" onChange={handleChange} />
          {errors.image && <p style={{ color: 'red' }}>{errors.image}</p>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default Create;