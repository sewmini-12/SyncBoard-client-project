import { render, screen } from '@testing-library/react';
import Login from './Login';

test('renders login form with email field', () => {
  render(<Login onLogin={() => {}} />);
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
});

test('renders login form with password field', () => {
  render(<Login onLogin={() => {}} />);
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
});

test('renders login button', () => {
  render(<Login onLogin={() => {}} />);
  expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
});