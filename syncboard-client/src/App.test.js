import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SyncBoard heading', () => {
  render(<App />);
  expect(screen.getByText(/Sync/i)).toBeInTheDocument();
});

test('shows email input field', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
});

test('shows password input field', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
});

test('shows login button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
});