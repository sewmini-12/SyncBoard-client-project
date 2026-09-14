import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';

test('renders login form with email and password fields', () => {
  render(<Login onLogin={() => {}} />);
  expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
});

test('calls onLogin when form is submitted', () => {
  const mockLogin = jest.fn();
  const { container } = render(<Login onLogin={mockLogin} />);
  const form = container.querySelector('form');
  fireEvent.submit(form);
  expect(mockLogin).toHaveBeenCalled();
});