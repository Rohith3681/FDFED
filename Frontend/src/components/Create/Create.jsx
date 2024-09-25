import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const Create = () => {
  const { username } = useSelector((state) => state.auth);
  
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [distance, setDistance] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null); // New state for image
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
        setImage(e.target.files[0]); // Handle file input
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('city', city);
    formData.append('address', address);
    formData.append('distance', distance);
    formData.append('price', price);
    formData.append('desc', desc);
    formData.append('username', username);
    if (image) {
      formData.append('image', image); // Append the image file
    }

    try {
      const response = await fetch('http://localhost:8000/create', {
        method: 'POST',
        body: formData, // Use formData for file uploads
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
        setImage(null); // Reset image state
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
    <div>
      <h1>Create New Entry</h1>
      {statusMessage && <p>{statusMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" name="title" value={title} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="city">City:</label>
          <input type="text" id="city" name="city" value={city} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input type="text" id="address" name="address" value={address} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="distance">Distance:</label>
          <input type="number" id="distance" name="distance" value={distance} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input type="number" id="price" name="price" value={price} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="desc">Description:</label>
          <textarea id="desc" name="desc" value={desc} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="image">Upload Image:</label>
          <input type="file" id="image" name="image" onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default Create;
