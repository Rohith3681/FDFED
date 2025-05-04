import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './Create.module.css';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [maxGroupSize, setMaxGroupSize] = useState('');
  const navigate = useNavigate();

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
  };

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
    if (!maxGroupSize.trim()) newErrors.maxGroupSize = 'Max Group Size is required.';

    // If all fields are filled, perform additional validation
    if (Object.keys(newErrors).length === 0) {
      if (title.length < 3) newErrors.title = 'Title must be at least 3 characters long.';
      if (city.length < 2) newErrors.city = 'City must be at least 2 characters long.';
      if (address.length < 5) newErrors.address = 'Address must be at least 5 characters long.';
      if (isNaN(distance) || distance <= 0) newErrors.distance = 'Distance must be a positive number.';
      if (isNaN(price) || price <= 0) newErrors.price = 'Price must be a positive number.';
      if (desc.length < 10) newErrors.desc = 'Description must be at least 10 characters long.';
      if (isNaN(maxGroupSize) || maxGroupSize <= 0) {
        newErrors.maxGroupSize = 'Max Group Size must be a positive number.';
      }
      if (maxGroupSize > 100) {
        newErrors.maxGroupSize = 'Max Group Size cannot exceed 100.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    
    switch (name) {
        case 'image':
            try {
                const file = files[0];
                if (file) {
                    const base64String = await convertToBase64(file);
                    console.log('Base64 string starts with:', base64String.substring(0, 50)); // Debug
                    setImage(base64String);
                    setErrors(prev => ({ ...prev, image: '' }));
                }
            } catch (error) {
                console.error('Error converting image:', error);
                setErrors(prev => ({ ...prev, image: 'Error processing image' }));
            }
            break;
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
        case 'maxGroupSize':
            setMaxGroupSize(value);
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
    
    try {
      const tourData = {
        title: title.trim(),
        city: city.trim(),
        address: address.trim(),
        distance: distance,
        price: price,
        desc: desc.trim(),
        maxGroupSize: maxGroupSize,
        image: image // Now this is the base64 string
      };

      const response = await fetch('http://localhost:8000/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(tourData)
      });

      const result = await response.json();
      if (response.ok) {
        setShowSuccess(true); // Show success overlay instead of status message
        // Reset form fields
        setTitle('');
        setCity('');
        setAddress('');
        setDistance('');
        setPrice('');
        setDesc('');
        setMaxGroupSize('');
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
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1>Create New Tour</h1>
        {statusMessage && (
          <div className={`${styles.statusMessage} ${statusMessage.includes('successfully') ? styles.success : styles.error}`}>
            {statusMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="title">Title</label>
            <input 
              className={styles.input}
              type="text" 
              id="title" 
              name="title" 
              value={title} 
              onChange={handleChange}
              placeholder="Enter tour title"
            />
            {errors.title && <p className={styles.error}>{errors.title}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="city">City</label>
            <input 
              className={styles.input}
              type="text" 
              id="city" 
              name="city" 
              value={city} 
              onChange={handleChange}
              placeholder="Enter city name"
            />
            {errors.city && <p className={styles.error}>{errors.city}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="address">Address</label>
            <input 
              className={styles.input}
              type="text" 
              id="address" 
              name="address" 
              value={address} 
              onChange={handleChange}
              placeholder="Enter complete address"
            />
            {errors.address && <p className={styles.error}>{errors.address}</p>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="distance">Distance (km)</label>
              <input 
                className={styles.input}
                type="number" 
                id="distance" 
                name="distance" 
                value={distance} 
                onChange={handleChange}
                placeholder="Enter distance"
              />
              {errors.distance && <p className={styles.error}>{errors.distance}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="price">Price (₹)</label>
              <input 
                className={styles.input}
                type="number" 
                id="price" 
                name="price" 
                value={price} 
                onChange={handleChange}
                placeholder="Enter price"
              />
              {errors.price && <p className={styles.error}>{errors.price}</p>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="maxGroupSize">Max Group Size</label>
            <input 
              className={styles.input}
              type="number" 
              id="maxGroupSize" 
              name="maxGroupSize" 
              value={maxGroupSize} 
              onChange={handleChange}
              placeholder="Enter maximum group size"
              min="1"
              max="100"
            />
            {errors.maxGroupSize && <p className={styles.error}>{errors.maxGroupSize}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="desc">Description</label>
            <textarea 
              className={styles.textarea}
              id="desc" 
              name="desc" 
              value={desc} 
              onChange={handleChange}
              placeholder="Enter tour description"
              rows="4"
            />
            {errors.desc && <p className={styles.error}>{errors.desc}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="image">Tour Image</label>
            <div className={styles.fileInputWrapper}>
              <input 
                className={styles.fileInput}
                type="file" 
                id="image" 
                name="image" 
                onChange={handleChange}
                accept="image/*"
              />
              <div className={styles.fileInputLabel}>
                {image ? 'Image selected' : 'Choose an image'}
              </div>
            </div>
            {errors.image && <p className={styles.error}>{errors.image}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Creating Tour...' : 'Create Tour'}
          </button>
        </form>
      </div>

      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.successTitle}>Tour Created Successfully!</h2>
            <p className={styles.successMessage}>
              Your tour has been created and is now available for booking.
            </p>
            <div className={styles.successButtons}>
              <button 
                className={styles.successButton}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
              <button 
                className={`${styles.successButton} ${styles.secondaryButton}`}
                onClick={() => {
                  setShowSuccess(false);
                  window.scrollTo(0, 0);
                }}
              >
                Create Another Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;