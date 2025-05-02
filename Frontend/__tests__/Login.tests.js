import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../src/components/Login/Login';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/features/auth/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer
  }
});

function renderWithProviders(ui) {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}

describe('Login Component', () => {
  test('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('allows user to type into input fields', () => {
    renderWithProviders(<Login />);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(nameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(nameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('calls login function when form is submitted', () => {
    renderWithProviders(<Login />);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    fireEvent.change(nameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  });
});
