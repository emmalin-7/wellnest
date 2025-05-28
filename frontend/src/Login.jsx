import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we came from registration
    if (location.state?.fromRegistration) {
      setShowSuccessBanner(true);
      // Hide banner after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://localhost:5001/login', { email, password })
      .then(result => {
        console.log('Login response:', result.data);

        if (result.data.message === "Success") {
          // store each user for local database, dream and sleep logs
          localStorage.setItem('user', JSON.stringify(result.data.user));

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
      {showSuccessBanner && (
        <div className="success-banner">
          <p>✅ Your account has been created. Please log in.</p>
        </div>
      )}
      <div className="login-split">
        <div className="login-image-section">
          <img src="/Wellnest-Login-Image.svg" alt="Wellnest Login" className="login-image" />
        </div>
        <div className="login-form-section">
          <div className="login-card">
            <p className="login-tagline">Welcome Back!</p>
            <p className="subtitle">Log in to your account</p>
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
              <span>New to Wellnest?</span>
              <Link to="/register">Create an account!</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;