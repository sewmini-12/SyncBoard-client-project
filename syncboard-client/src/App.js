import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Board from './components/Board';
import { isAuthenticated, getCurrentUser, logout } from './services/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const userData = getCurrentUser();
      if (userData) {
        setUser(userData);
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Board onLogout={handleLogout} user={user} />
      )}
    </div>
  );
}

export default App;