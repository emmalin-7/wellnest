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
    <div className="login-container">
      <div className="login-card">
        <img src="/Wellnest-Logo.svg" alt="Wellnest Logo" className="logo" />
        <p className="tagline">Welcome back to Wellnest!</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>
        
        <p className="signup-link">
          <span>Don't have an account?</span>
          <Link to="/register">Join us!</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;