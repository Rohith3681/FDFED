import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './Create.module.css';

const Create = () => {
  const navigate = useNavigate();
  const { username } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    address: '',
    distance: '',
    price: '',
    desc: '',
    image: null,
    maxGroupSize: '',
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    } else if (formData.city.length < 2) {
      newErrors.city = 'City must be at least 2 characters long.';
    }

    if (!formData.distance.trim()) {
      newErrors.distance = 'Distance is required.';
    } else if (isNaN(formData.distance) || Number(formData.distance) <= 0) {
      newErrors.distance = 'Distance must be a positive number.';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    if (!formData.price.trim()) newErrors.price = 'Price is required.';
    if (!formData.desc.trim()) newErrors.desc = 'Description is required.';
    if (!formData.image) newErrors.image = 'Image is required.';
    if (!formData.maxGroupSize.trim()) newErrors.maxGroupSize = 'Max Group Size is required.';

    if (Object.keys(newErrors).length === 0) {
      if (formData.address.length < 5) newErrors.address = 'Address must be at least 5 characters long.';
      if (isNaN(formData.price) || formData.price <= 0) newErrors.price = 'Price must be a positive number.';
      if (formData.desc.length < 10) newErrors.desc = 'Description must be at least 10 characters long.';
      if (isNaN(formData.maxGroupSize) || formData.maxGroupSize <= 0) {
        newErrors.maxGroupSize = 'Max Group Size must be a positive number.';
      }
      if (formData.maxGroupSize > 100) {
        newErrors.maxGroupSize = 'Max Group Size cannot exceed 100.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'image' ? e.target.files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('distance', formData.distance);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('desc', formData.desc);
    formDataToSend.append('username', username);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
    formDataToSend.append('maxGroupSize', formData.maxGroupSize);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create`, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setSubmitError('');
      } else {
        setSubmitError(`Failed to create tour: ${result.message}`);
        setIsSuccess(false);
      }
    } catch (error) {
      setSubmitError('Failed to create tour: Network error');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {isSuccess ? (
          <div className={styles.successOverlay} role="alert">
            <h2>Tour Created Successfully!</h2>
            <button 
              onClick={() => navigate('/dashboard')}
              className={styles.successButton}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <h1>Create New Tour</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.input}
                  aria-label="Title"
                  placeholder="Enter tour title"
                />
                {errors.title && <span className={styles.error}>{errors.title}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="city" className={styles.label}>City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={styles.input}
                  aria-label="City"
                  placeholder="Enter city name"
                />
                {errors.city && <span className={styles.error}>{errors.city}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address" className={styles.label}>Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter complete address"
                />
                {errors.address && <p className={styles.error}>{errors.address}</p>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="distance" className={styles.label}>Distance (km)</label>
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    value={formData.distance}
                    onChange={handleChange}
                    className={styles.input}
                    aria-label="Distance (km)"
                    placeholder="Enter distance"
                  />
                  {errors.distance && <span className={styles.error}>{errors.distance}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="price" className={styles.label}>Price (₹)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter price"
                  />
                  {errors.price && <p className={styles.error}>{errors.price}</p>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="maxGroupSize" className={styles.label}>Max Group Size</label>
                <input
                  type="number"
                  id="maxGroupSize"
                  name="maxGroupSize"
                  value={formData.maxGroupSize}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter maximum group size"
                  min="1"
                  max="100"
                />
                {errors.maxGroupSize && <p className={styles.error}>{errors.maxGroupSize}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="desc" className={styles.label}>Description</label>
                <textarea
                  id="desc"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Enter tour description"
                  rows="4"
                />
                {errors.desc && <p className={styles.error}>{errors.desc}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="image" className={styles.label}>Tour Image</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleChange}
                    className={styles.fileInput}
                    accept="image/*"
                  />
                  <div className={styles.fileInputLabel}>
                    {formData.image ? formData.image.name : 'Choose an image'}
                  </div>
                </div>
                {errors.image && <p className={styles.error}>{errors.image}</p>}
              </div>

              {submitError && (
                <div className={styles.error} role="alert">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Creating Tour...' : 'Create Tour'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Create;