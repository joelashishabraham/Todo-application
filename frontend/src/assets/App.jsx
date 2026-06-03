import { useState } from 'react';
import LoginRegister from './components/LoginRegister';
import TaskList from './components/TaskList';
import './styles/App.css';

export default function App() {
  const [userId, setUserId] = useState(null);

  const handleLoginSuccess = (id) => {
    setUserId(id);
  };

  const handleLogout = () => {
    setUserId(null);
  };

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