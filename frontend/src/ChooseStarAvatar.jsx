import React from 'react';
import './ChooseStarAvatar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colors = ['Yellow', 'Blue', 'Green', 'Pink', 'Purple'];

function ChooseStarAvatar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleSelect = async (color) => {
    try {
      await axios.put(`http://localhost:5001/api/users/${user.id}/star`, {
        starColor: color
      });

      localStorage.setItem('user', JSON.stringify({
        ...user,
        starColor: color,
        hasChosenStar: true
      }));

      navigate('/home');
    } catch (err) {
      console.error('Error selecting star:', err);
      alert('Failed to save star color.');
    }
  };

  return (
    <div className="choose-star-container">
      <img src="/Welcome-Logo.svg" alt="Welcome Logo" className="welcome-logo" />
      <h1 className="welcome-title">Welcome to Wellnest!</h1>
      <p className="welcome-description">
        We're so glad you're here! ✨ Wellnest is your new cozy corner to track your sleep, record your dreams, and connect with friends.
        <br /><br />
        Before we get started, let's pick your avatar—your little sleep companion on this journey. <strong>Choose wisely! You can only pick once, and you won't be able to change it later.</strong>
      </p>
      <div className="stars-row">
        {colors.map(color => (
          <img
            key={color}
            src={`/Avatar-${color}.svg`}
            alt={color}
            className="star-icon"
            onClick={() => handleSelect(color)}
          />
        ))}
      </div>
      <p className="star-subtitle">Click to select!</p>
    </div>
  );
}

export default ChooseStarAvatar;