import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Create from '../Test/Create'; // Adjust the import path as necessary
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Create.test.jsx

// Mock the modules
jest.mock('react-redux', () => ({
  useSelector: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

// Mock CSS modules
jest.mock('./Create.module.css', () => ({
  pageWrapper: 'pageWrapper',
  container: 'container',
  form: 'form',
  input: 'input',
  error: 'error'
}));

describe('Create Component', () => {
  const mockNavigate = jest.fn();
  const mockUsername = 'testUser';
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    useSelector.mockReturnValue({ username: mockUsername });
    useNavigate.mockReturnValue(mockNavigate);
    global.fetch = jest.fn();
    window.scrollTo = jest.fn();
  });

  test('renders create tour form', () => {
    render(<Create />);
    expect(screen.getByText('Create New Tour')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
  });

  test('validates empty form submission', async () => {
    render(<Create />);
    
    fireEvent.click(screen.getByText('Create Tour'));

    await waitFor(() => {
      expect(screen.getByText('Title is required.')).toBeInTheDocument();
      expect(screen.getByText('City is required.')).toBeInTheDocument();
      expect(screen.getByText('Address is required.')).toBeInTheDocument();
    });
  });

  test('validates input fields with invalid data', async () => {
    render(<Create />);
    
    // Enter invalid data
    await user.type(screen.getByLabelText('Title'), 'ab');
    await user.type(screen.getByLabelText('City'), 'a');
    await user.type(screen.getByLabelText('Distance (km)'), '-5');
    
    fireEvent.click(screen.getByText('Create Tour'));

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 3 characters long.')).toBeInTheDocument();
      expect(screen.getByText('City must be at least 2 characters long.')).toBeInTheDocument();
      expect(screen.getByText('Distance must be a positive number.')).toBeInTheDocument();
    });
  });

  test('handles successful form submission', async () => {
    const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Tour created successfully' })
      })
    );

    render(<Create />);

    // Fill in form data
    await user.type(screen.getByLabelText('Title'), 'Test Tour');
    await user.type(screen.getByLabelText('City'), 'Test City');
    await user.type(screen.getByLabelText('Address'), 'Test Address');
    await user.type(screen.getByLabelText('Distance (km)'), '100');
    await user.type(screen.getByLabelText('Price (₹)'), '1000');
    await user.type(screen.getByLabelText('Max Group Size'), '10');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    
    const fileInput = screen.getByLabelText('Tour Image');
    await user.upload(fileInput, mockFile);

    fireEvent.click(screen.getByText('Create Tour'));

    await waitFor(() => {
      expect(screen.getByText('Tour Created Successfully!')).toBeInTheDocument();
    });
  });

  test('handles failed form submission', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Server error' })
      })
    );

    render(<Create />);
    
    // Fill in minimal valid form data
    await user.type(screen.getByLabelText('Title'), 'Test Tour');
    await user.type(screen.getByLabelText('City'), 'Test City');
    await user.type(screen.getByLabelText('Address'), 'Test Address');
    await user.type(screen.getByLabelText('Distance (km)'), '100');
    await user.type(screen.getByLabelText('Price (₹)'), '1000');
    await user.type(screen.getByLabelText('Description'), 'Test Description');
    await user.type(screen.getByLabelText('Max Group Size'), '10');

    const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Tour Image');
    await user.upload(fileInput, mockFile);

    fireEvent.click(screen.getByText('Create Tour'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create tour: Server error')).toBeInTheDocument();
    });
  });

  
});