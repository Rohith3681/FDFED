import React from 'react';
import PropTypes from 'prop-types';
import './Display.css';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Test/Dashboard';
import authReducer from '../src/features/auth/authSlice';

const Display = ({ tour, showReviewButton, showBookButton, showUpdateButton, showDeleteButton }) => {
  if (!tour) return null;

  return (
    <div className="tour-card" data-testid={`tour-${tour._id}`}>
      <h3>{tour.title}</h3>
      <div className="tour-details">
        <p>Price: ₹{tour.price}</p>
        {tour.city && <p>City: {tour.city}</p>}
        {showBookButton === 1 && (
          <button className="book-button">Book Now</button>
        )}
        {showReviewButton === 1 && (
          <button className="review-button">Add Review</button>
        )}
        {showUpdateButton === 1 && (
          <button className="update-button">Update</button>
        )}
        {showDeleteButton === 1 && (
          <button className="delete-button">Delete</button>
        )}
      </div>
    </div>
  );
};

Display.propTypes = {
  tour: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    city: PropTypes.string,
  }).isRequired,
  showReviewButton: PropTypes.number,
  showBookButton: PropTypes.number,
  showUpdateButton: PropTypes.number,
  showDeleteButton: PropTypes.number
};

Display.defaultProps = {
  showReviewButton: 0,
  showBookButton: 0,
  showUpdateButton: 0,
  showDeleteButton: 0
};

// Mock the Display component
jest.mock('../Test/Display', () => {
  return function MockDisplay({ tour }) {
    return <div data-testid={`tour-${tour._id}`}>{tour.title}</div>;
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockTours = [
  {
    _id: '1',
    title: 'Paris Tour',
    price: 100,
    bookedBy: [
      { _id: 'user1', name: 'John Doe' },
      { _id: 'user2', name: 'Jane Doe' }
    ]
  },
  {
    _id: '2',
    title: 'London Tour',
    price: 150,
    bookedBy: []
  }
];

function renderWithProviders(ui, { initialState = {} } = {}) {
  const store = configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        username: 'testuser',
        role: '8180',
        ...initialState
      }
    }
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders dashboard header', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
  });

  test('displays welcome message with username', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByTestId('welcome-message')).toHaveTextContent('Welcome back, testuser');
  });

  test('displays create tour button', () => {
    renderWithProviders(<Dashboard />);
    const createButton = screen.getByTestId('create-tour-button');
    expect(createButton).toBeInTheDocument();
  });

  test('navigates to create tour page on button click', () => {
    renderWithProviders(<Dashboard />);
    const createButton = screen.getByTestId('create-tour-button');
    fireEvent.click(createButton);
    expect(mockNavigate).toHaveBeenCalledWith('/create');
  });

  test('displays no tours message when tours array is empty', async () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('No tours created yet.')).toBeInTheDocument();
  });

  test('displays tours grid when tours exist', async () => {
    const mockFetchResponse = { tours: mockTours };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFetchResponse)
      })
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('tours-grid')).toBeInTheDocument();
      mockTours.forEach(tour => {
        expect(screen.getByTestId(`tour-${tour._id}`)).toBeInTheDocument();
      });
    });
  });

  test('displays correct revenue statistics', async () => {
    const mockFetchResponse = { tours: mockTours };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockFetchResponse)
      })
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      const revenueCard = screen.getByTestId('revenue-card');
      expect(revenueCard).toHaveTextContent('Total Revenue (90%)');
    });
  });
});

export default Display;