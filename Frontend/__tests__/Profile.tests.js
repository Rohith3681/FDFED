import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '../Test/Profile';
import { useSelector } from 'react-redux';

// Mock the redux hook
jest.mock('react-redux', () => ({
  useSelector: jest.fn()
}));

// Mock the Display component with correct path
jest.mock('../Test/Display', () => {
  return function MockDisplay({ tour }) {
    return <div data-testid="mock-display">{tour.title}</div>;
  };
});

describe('Profile Component', () => {
  const mockUsername = 'testUser';
  const mockUserDetails = {
    user: mockUsername,
    ongoingBookings: [
      { _id: '1', tour: { title: 'Ongoing Tour 1' }, cost: 100 }
    ],
    upcomingBookings: [
      { _id: '2', tour: { title: 'Upcoming Tour 1' }, cost: 200 }
    ],
    completedBookings: [
      { _id: '3', tour: { title: 'Completed Tour 1' }, cost: 300 }
    ]
  };

  beforeEach(() => {
    useSelector.mockReturnValue({ username: mockUsername });
    global.fetch = jest.fn();
    console.error = jest.fn(); // Mock console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<Profile />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders error message when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<Profile />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user profile.')).toBeInTheDocument();
    });
  });

  test('renders user details and bookings when fetch succeeds', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserDetails)
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(`Username: ${mockUsername}`)).toBeInTheDocument();
      expect(screen.getByText('Ongoing Tour 1')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Tour 1')).toBeInTheDocument();
      expect(screen.getByText('Completed Tour 1')).toBeInTheDocument();
    });
  });

  test('handles booking cancellation successfully', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserDetails)
      })
      .mockResolvedValueOnce({
        ok: true
      });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Upcoming Tour 1')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel Booking');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/cancel/2',
        expect.any(Object)
      );
    });
  });

  test('displays no bookings message when category is empty', async () => {
    const emptyUserDetails = {
      user: mockUsername,
      ongoingBookings: [],
      upcomingBookings: [],
      completedBookings: []
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(emptyUserDetails)
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('No ongoing bookings found.')).toBeInTheDocument();
      expect(screen.getByText('No upcoming bookings found.')).toBeInTheDocument();
      expect(screen.getByText('No completed bookings found.')).toBeInTheDocument();
    });
  });

  test('handles server error response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Error fetching user details or bookings.')).toBeInTheDocument();
    });
  });
});