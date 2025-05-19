import React from 'react';
import './Home.css';

function Home() {
  return (
    <>
      <div className="topnav">
        <div className="left-links">
          <a href="/dashboard">Feed</a>
          <a href="/leaderboard">Leaderboards</a>
        </div>
        <div className="right-link">
          <a href="/profile">Profile</a>
        </div>
      </div>
      <h2>Home Screen aka Dashboard</h2>
    </>
  );
}

export default Home;