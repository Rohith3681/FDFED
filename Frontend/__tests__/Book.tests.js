import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Book from '../Test/Book';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../src/features/cart/cartSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer
  }
});

const mockBook = {
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  genre: 'Fiction',
  price: 29.99,
  imageUrl: 'test-image.jpg'
};

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

function renderWithProviders(ui) {
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}

describe('Book Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any previous error states
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('renders book information correctly', async () => {
    renderWithProviders(<Book book={mockBook} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Failed to fetch tours')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('book-title')).toHaveTextContent(mockBook.title);
    expect(screen.getByTestId('book-author')).toHaveTextContent(mockBook.author);
    expect(screen.getByTestId('book-genre')).toHaveTextContent(mockBook.genre);
    expect(screen.getByTestId('book-price')).toHaveTextContent(`$${mockBook.price}`);
  });

  

  test('navigates to book details on details link click', async () => {
    renderWithProviders(<Book book={mockBook} />);
    
    try {
      // Wait for loading state to resolve with a longer timeout
      await waitFor(
        () => {
          const errorMessage = screen.queryByText('Failed to fetch tours');
          expect(errorMessage).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Find and click the details link
      const detailsElement = await screen.findByRole('link', {
        name: /details/i,
      });
      
      fireEvent.click(detailsElement);
      
      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith(`/book/${mockBook.id}`);
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});