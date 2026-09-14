import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

test('renders login form', () => {
  render(<Login onLogin={() => {}} />);
  expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
});

test('calls onLogin when form is submitted', () => {
  const mockLogin = jest.fn();
  render(<Login onLogin={mockLogin} />);
  const button = screen.getByRole('button', { name: /Log In/i });
  fireEvent.click(button);
  expect(mockLogin).toHaveBeenCalled();
});