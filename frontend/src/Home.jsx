import React from 'react';
import './Home.css';

function Home() {
  return (
    <>
      {/* nav bar */}
      <div className="topnav">
        <div className="left-links">
          <a href="/dashboard">Feed</a>
          <a href="/leaderboard">Leaderboards</a>
        </div>
        <div className="right-link">
          <a href="/profile">Profile</a>
        </div>
      </div>

      {/* dashboard */}
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="date-section">
            <span className="date-label">DATE</span>
            <a href="#" className="change-link">change</a>
          </div>
          <div className="profile-icon">👤</div>
        </div>

        <div className="dashboard-content">
          {/* enter time here */}
          <div className="card time-card">
            <div className="card-title">TIME IN BED</div>
            <div className="time-text">8h 16min</div>
          </div>

          {/* graph sleep here */}
          <div className="card chart-card">
            <div className="chart-bars">
              <div className="bar">
                <div className="fill" style={{ height: '50%' }}></div>
                <span>M</span>
              </div>
              <div className="bar">
                <div className="fill" style={{ height: '80%' }}></div>
                <span>T</span>
              </div>
              <div className="bar">
                <div className="fill" style={{ height: '60%' }}></div>
                <span>W</span>
              </div>
              <div className="bar">
                <div className="fill" style={{ height: '55%' }}></div>
                <span>T</span>
              </div>
            </div>
          </div>

          {/* dream log here */}
          <div className="card dreams-card">
            <div className="card-title">🌙 DREAMS</div>
            <div className="dream-content">
              <p>Had a dream about flying...</p>
              <button className="edit-btn">✎</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
