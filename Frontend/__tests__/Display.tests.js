import React from 'react';
import { render, screen } from '@testing-library/react';
import Display from '../Test/Display';

const mockTour = {
  _id: '1',
  title: 'Paris Tour',
  price: 999,
  city: 'Paris'
};

describe('Display Component', () => {
  test('renders tour information correctly', () => {
    render(<Display tour={mockTour} />);
    
    expect(screen.getByTestId(`tour-${mockTour._id}`)).toBeInTheDocument();
    expect(screen.getByText(mockTour.title)).toBeInTheDocument();
    expect(screen.getByText(`Price: ₹${mockTour.price}`)).toBeInTheDocument();
    expect(screen.getByText(`City: ${mockTour.city}`)).toBeInTheDocument();
  });

  test('renders book button when showBookButton is 1', () => {
    render(<Display tour={mockTour} showBookButton={1} />);
    expect(screen.getByText('Book Now')).toBeInTheDocument();
  });

  test('renders review button when showReviewButton is 1', () => {
    render(<Display tour={mockTour} showReviewButton={1} />);
    expect(screen.getByText('Add Review')).toBeInTheDocument();
  });

  test('renders update button when showUpdateButton is 1', () => {
    render(<Display tour={mockTour} showUpdateButton={1} />);
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  test('renders delete button when showDeleteButton is 1', () => {
    render(<Display tour={mockTour} showDeleteButton={1} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('does not render buttons when show props are 0', () => {
    render(<Display tour={mockTour} />);
    
    expect(screen.queryByText('Book Now')).not.toBeInTheDocument();
    expect(screen.queryByText('Add Review')).not.toBeInTheDocument();
    expect(screen.queryByText('Update')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  test('returns null when tour prop is null', () => {
    const { container } = render(<Display tour={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('does not render city when city prop is not provided', () => {
    const tourWithoutCity = {
      _id: '2',
      title: 'Test Tour',
      price: 499
    };
    
    render(<Display tour={tourWithoutCity} />);
    expect(screen.queryByText(/City:/)).not.toBeInTheDocument();
  });
});