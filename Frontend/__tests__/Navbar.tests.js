import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../Test/Navbar';
import { useSelector, useDispatch } from 'react-redux';

// Mock redux hooks
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn()
}));

// Mock the logout action with correct path - updated to match Navbar.jsx import
jest.mock('../src/features/auth/authSlice', () => ({
  logout: jest.fn()
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  const mockDispatch = jest.fn();
  
  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    global.fetch = jest.fn();
    console.error = jest.fn(); // Mock console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders logo and basic navigation links', () => {
    useSelector.mockReturnValue({ isAuthenticated: false, role: null, cart: [] });
    
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Pack Your Bags')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  test('renders login and register links when not authenticated', () => {
    useSelector.mockReturnValue({ isAuthenticated: false, role: null, cart: [] });
    
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('renders admin navigation when authenticated as admin', () => {
    useSelector.mockReturnValue({ 
      isAuthenticated: true, 
      role: '8180',
      cart: [] 
    });
    
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Create Tour')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('renders user navigation when authenticated as user', () => {
    useSelector.mockReturnValue({ 
      isAuthenticated: true, 
      role: '2120',
      cart: [{ id: 1 }, { id: 2 }] 
    });
    
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Book Tour')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Cart (2)')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('handles logout successfully', async () => {
    useSelector.mockReturnValue({ 
      isAuthenticated: true, 
      role: '2120',
      cart: [] 
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true
    });

    renderWithRouter(<Navbar />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include'
        })
      );
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  test('handles logout failure', async () => {
    useSelector.mockReturnValue({ 
      isAuthenticated: true, 
      role: '2120',
      cart: [] 
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: false
    });

    renderWithRouter(<Navbar />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Failed to log out');
    });
  });

  test('displays correct cart items count', () => {
    useSelector.mockReturnValue({ 
      isAuthenticated: true, 
      role: '2120',
      cart: [{ id: 1 }, { id: 2 }, { id: 3 }] 
    });
    
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Cart (3)')).toBeInTheDocument();
  });

  test('handles empty cart display', () => {
    useSelector.mockReturnValue({ 
      isAuthenticated: true, 
      role: '2120',
      cart: [] 
    });
    
    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('Cart (0)')).toBeInTheDocument();
  });
});