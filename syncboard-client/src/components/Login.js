import React, { useState } from 'react';
import { login, register } from '../services/auth';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const response = await register(name, email, password);
        // Registration successful
        onLogin(response.user);
      } else {
        const response = await login(email, password);
        // Login successful
        onLogin(response.user);
      }
    } catch (err) {
      // Display specific error from backend
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.request) {
        // Network error (backend not running)
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>📋 <span>Sync</span>Board</h1>
        <p className="subtitle">
          {isRegister ? 'Create your account' : 'Collaborative Task Management'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <p className="toggle-auth">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(''); // Clear error when switching
            }}
            className="toggle-btn"
          >
            {isRegister ? 'Log In' : 'Create Account'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;