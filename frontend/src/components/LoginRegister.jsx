import { useState } from 'react';
import '../styles/App.css';

export default function LoginRegister({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(''); // Clear previous errors

  try {
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    const requestData = isLogin
      ? { username, password }
      : { username, email, password };

    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (data.success) {
  if (isLogin) {
    // Login successful
    setUsername('');
    setPassword('');
    onLoginSuccess(data.user_id);
  } else {
    // Register successful
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setIsLogin(true); 
    setError('Account created! Please login.');
  }
} else {
      setError(data.message);
    }
  } catch (err) {
    setError('Network error: ' + err.message);
  }
};

  return (
    <div className="auth-container">
      {<div className="auth-container">
  <div className="auth-box">
    <h1>{isLogin ? 'Login' : 'Register'}</h1>
    
    <form onSubmit={handleSubmit}>
      {/* Username field */}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      {/* Email field (only show if registering) */}
      {!isLogin && (
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}

      {/* Password field */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Error message */}
      {error && <p className="error">{error}</p>}

      {/* Submit button */}
      <button type="submit">
        {isLogin ? 'Login' : 'Register'}
      </button>
    </form>

    {/* Toggle between login and register */}
    <p>
      {isLogin ? "Don't have account? " : 'Already have account? '}
      <button 
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="toggle-btn"
      >
        {isLogin ? 'Register' : 'Login'}
      </button>
    </p>
  </div>
</div>}
    </div>
  );
}