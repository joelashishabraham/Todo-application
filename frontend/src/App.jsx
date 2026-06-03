import { useState, useEffect } from 'react';
import LoginRegister from './components/LoginRegister';
import TaskList from './components/TaskList';
import './styles/App.css';

export default function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  const checkIfLoggedIn = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setUserId(data.user.id);
      }
    } catch (err) {
      console.log('Not logged in');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (id) => {
    setUserId(id);
  };

  const handleLogout = () => {
    setUserId(null);
  };

  if (loading) return <div className="app">Loading...</div>;

  return (
    <div className="app">
      {userId ? (
        <TaskList userId={userId} onLogout={handleLogout} />
      ) : (
        <LoginRegister onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}