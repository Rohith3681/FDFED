import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../Test/Cart';
import authReducer from '../src/features/auth/authSlice';

// Mock CartCard component with correct path
jest.mock('../Test/CartCard', () => {
  return function MockCartCard({ tour }) {
    return <div data-testid="cart-card">{tour.title}</div>;
  };
});

const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockTours = [
  {
    _id: '1',
    title: 'Paris Tour',
    price: 99.99
  },
  {
    _id: '2',
    title: 'London Tour',
    price: 149.99
  }
];

function renderWithProviders(ui, { initialState = {} } = {}) {
  const store = configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        cart: initialState.cart || []
      }
    }
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
}

describe('Cart Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders empty cart message when cart is empty', () => {
    renderWithProviders(<Cart />);

    expect(screen.getByText('Your Cart')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty. Start exploring amazing tours!')).toBeInTheDocument();
    expect(screen.getByText('Browse Tours')).toBeInTheDocument();
  });

  test('navigates to home page when Browse Tours button is clicked', () => {
    renderWithProviders(<Cart />);

    const browseButton = screen.getByText('Browse Tours');
    fireEvent.click(browseButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('renders cart items when cart is not empty', () => {
    renderWithProviders(<Cart />, {
      initialState: {
        cart: mockTours
      }
    });

    expect(screen.getByText('Your Cart')).toBeInTheDocument();
    expect(screen.queryByText('Your cart is empty. Start exploring amazing tours!')).not.toBeInTheDocument();
    
    const cartCards = screen.getAllByTestId('cart-card');
    expect(cartCards).toHaveLength(mockTours.length);
    expect(screen.getByText('Paris Tour')).toBeInTheDocument();
    expect(screen.getByText('London Tour')).toBeInTheDocument();
  });

  test('renders correct number of CartCard components', () => {
    renderWithProviders(<Cart />, {
      initialState: {
        cart: mockTours
      }
    });

    const cartCards = screen.getAllByTestId('cart-card');
    expect(cartCards).toHaveLength(2);
  });

  test('handles null cart gracefully', () => {
    renderWithProviders(<Cart />, {
      initialState: {
        cart: null
      }
    });

    expect(screen.getByText('Your cart is empty. Start exploring amazing tours!')).toBeInTheDocument();
  });
});