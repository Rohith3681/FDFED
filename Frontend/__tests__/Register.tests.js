import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Register } from '../src/components/Register/Register';
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

describe('Register Component', () => {
  test('renders register form', () => {
    renderWithProviders(<Register />);
    
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  test('allows user to type into registration fields', () => {
    renderWithProviders(<Register />);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(nameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(nameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('shows error message for invalid email', async () => {
    renderWithProviders(<Register />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      const errorMessage = screen.getByText(/invalid email/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('submits form with valid data', () => {
    renderWithProviders(<Register />);

    const nameInput = screen.getByPlaceholderText(/name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    fireEvent.change(nameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const submitButton = screen.getByText('Create Account');
    fireEvent.click(submitButton);
  });

  test('shows password requirements', async () => {
    renderWithProviders(<Register />);

    const passwordInput = screen.getByPlaceholderText(/password/i);
    fireEvent.focus(passwordInput);

    await waitFor(() => {
      const requirementMessage = screen.getByText((content, element) => {
        const text = element.textContent.toLowerCase();
        return text.includes('password') && text.includes('characters');
      });
      expect(requirementMessage).toBeInTheDocument();
    });
  });

  test('validates password length', async () => {
    renderWithProviders(<Register />);

    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    // Type a short password
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    // Check for validation error using data-testid
    await waitFor(() => {
      const errorMessage = screen.getByTestId('password-error');
      expect(errorMessage).toBeInTheDocument();
    });

    // Type a valid password
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.blur(passwordInput);

    // Check that error message is gone
    await waitFor(() => {
      expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
    });
  });
});