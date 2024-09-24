import React from 'react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

<div className="footer-section brand">
  <h6>
    Pack Your Bags
  </h6>
  <p className='theme'>
  –"Your Adventure Awaits, Explore the World with Us!"
  </p>
</div>

        {/* Quick Links Section */}
        <div className="footer-section quick-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact">
          <h4>Contact Info</h4>
          <p><i className="fas fa-map-marker-alt"></i> 321-1, Mumbai, India</p>
          <p><i className="fas fa-phone-alt"></i> +91 8639464273</p>
          <p><i className="fas fa-envelope"></i> contact@packyourbags.com</p>
        </div>

        {/* Social Media Section */}
        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><i className="fab fa-twitter"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="footer-bottom">
        <h5>&copy; 2024 Pack Your Bags. All Rights Reserved.</h5>
      </div>
    </footer>
  );
}
