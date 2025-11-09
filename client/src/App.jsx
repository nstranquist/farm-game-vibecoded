import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Game from './components/Game';
import { getToken, clearToken } from './services/api';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Check for existing token
    const savedToken = getToken();
    if (savedToken) {
      // TODO: Verify token is still valid
      setToken(savedToken);
    }
  }, []);

  const handleAuthenticated = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    clearToken();
    setToken(null);
    setUsername(null);
  };

  if (!token) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  return <Game token={token} username={username} onLogout={handleLogout} />;
}

export default App;
