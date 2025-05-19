import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feed.css';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

function Feed() {

  return (
    <>
      {/* nav bar */}
      <div className="topnav">
        <div className="left-links">
          <Link to="/feed">Feed</Link>
          <Link to="/leaderboard">Leaderboards</Link>
        </div>
        <div className="right-link">
          <Link to="/home">Profile</Link>
        </div>
      </div>

      this is feed!

    </>
  );
}

export default Feed;