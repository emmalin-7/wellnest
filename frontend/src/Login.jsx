import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:5001/login', { email, password })
      .then(result => {
        console.log('Login response:', result.data);

        if (result.data.message === "Success") {
          // store each user for local database, dream and sleep logs
          localStorage.setItem('userEmail', result.data.user.email);

          // go to dashboard
          navigate('/home');
        } else {
          alert(result.data.message);
        }
      })
      .catch(err => {
        console.error('Login error:', err);
        alert('An error occurred during login.');
      });
  };

  return (
    <div className="login-background">
      <div className="stars" />
      <div className="login-card">
        <h3>🌙 Welcome to Wellnest!</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email"><strong>Email</strong></label>
          <input
            type="email"
            placeholder="Enter Email"
            autoComplete="off"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password"><strong>Password</strong></label>
          <input
            type="password"
            placeholder="Enter Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="signup-link"> 
          ⭐️ Don't have an account?{' '}
          <Link to="/register">Join us!</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;