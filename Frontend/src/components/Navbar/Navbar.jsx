import React from 'react';
import { NavLink } from "react-router-dom";
import Logo from '../../assets/WhatsApp Image 2024-08-22 at 21.52.32_dc9cf41a.jpg';
import './Navbar.css';

export const Navbar = () => {
  return (
    <div>
      <nav>
        <div className="logo">
          <img src={Logo} alt="Logo" />
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="nav-links">
          <NavLink className={(e) => e.isActive ? "orange" : ""} to="/"><li>Home</li></NavLink>
          <NavLink className={(e) => e.isActive ? "orange" : ""} to="/about"><li>About</li></NavLink>
          <NavLink className={(e) => e.isActive ? "orange" : ""} to="/login"><li>Login</li></NavLink>
          <NavLink className={(e) => e.isActive ? "orange" : ""} to="/register"><li>Register</li></NavLink>
        </div>
      </nav>
    </div>
  );
};
