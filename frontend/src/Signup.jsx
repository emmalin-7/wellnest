import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;

    if (!passwordRegex.test(password)) {
      alert('Password must be at least 10 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    axios.post('http://localhost:5001/register', { name, email, password })
      .then(result => {
        console.log(result);
        navigate('/login', { state: { fromRegistration: true } });
      })
      .catch(err => {
        console.log(err);
        alert(err.response?.data?.error || 'Registration failed. Please try again.');
      });
  };

  return (
    <div className="signup-container">
      <div className="signup-split">
        <div className="signup-image-section">
          <img src="/Wellnest-Signup-Image.svg" alt="Wellnest Signup" className="signup-image" />
        </div>
        <div className="signup-form-section">
          <div className="signup-card">
            <p className="signup-tagline">Welcome to Wellnest!</p>
            <p className="subtitle">Create an Account</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  placeholder="Enter Email"
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
              <small className="password-requirements">
                Password must be at least 10 characters and include uppercase, lowercase, number, and special character.
              </small>

              <button type="submit">Register</button>
            </form>
            
            <p className="signup-link">
              <span>Already have an account?</span>
              <Link to="/login">Log in!</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;