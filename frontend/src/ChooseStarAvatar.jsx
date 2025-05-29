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
    <div className="star-select-container">
      <p className="choose-star-note">You can only choose once. Pick your favorite star!</p>
      <h2 className="choose-star-title">Choose Your Star Color</h2>
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
    </div>
  );
}

export default ChooseStarAvatar;