import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders login page initially', () => {
  render(<App />);
  // Look for "Sync" in the heading (it's split across elements)
  const heading = screen.getByText(/Sync/i);
  expect(heading).toBeInTheDocument();
});

test('shows email input field on login page', () => {
  render(<App />);
  const emailInput = screen.getByPlaceholderText(/Email address/i);
  expect(emailInput).toBeInTheDocument();
});

test('shows password input field on login page', () => {
  render(<App />);
  const passwordInput = screen.getByPlaceholderText(/Password/i);
  expect(passwordInput).toBeInTheDocument();
});

test('has login button', () => {
  render(<App />);
  const loginButton = screen.getByRole('button', { name: /Log In/i });
  expect(loginButton).toBeInTheDocument();
});

test('switches to board when login button is clicked', () => {
  render(<App />);
  const loginButton = screen.getByRole('button', { name: /Log In/i });
  fireEvent.click(loginButton);
  // Look for "Sync" on the board page too
  const boardTitle = screen.getByText(/Sync/i);
  expect(boardTitle).toBeInTheDocument();
});

test('has logout button on board page', () => {
  render(<App />);
  const loginButton = screen.getByRole('button', { name: /Log In/i });
  fireEvent.click(loginButton);
  const logoutButton = screen.getByRole('button', { name: /Logout/i });
  expect(logoutButton).toBeInTheDocument();
});