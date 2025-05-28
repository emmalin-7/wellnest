import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feed.css';
import './Leaderboard.css';
import { Link, useNavigate } from 'react-router-dom';

function Leaderboard() {
  const [top10, setTop10] = useState([]);
  const [bottom10, setBottom10] = useState([]);
  const [view, setView] = useState('top');
  const [fallback, setFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  useEffect(() => {
    axios.get('/api/leaderboard')
      .then(res => {
        setTop10(res.data.top10 || []);
        setBottom10(res.data.bottom10 || []);
        setFallback(res.data.fallback || false);
        setTotalUsers(res.data.totalUsers || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Leaderboard fetch failed:', err);
        setLoading(false);
      });
  }, []);

  const displayedList = view === 'top' ? top10 : bottom10;
  const title = view === 'top' ? 'Top 10 Sleepers' : 'Bottom 10 Sleepers';

  const getRankDisplay = (index) => {
    if (view === 'top') {
      return (
        <>
          {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : ''}
          {index + 1}
        </>
      );
    } else {
      const rank = totalUsers - index;
      return (
        <>
          🔻 {rank}
        </>
      );
    }
  };

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
          <span className="logout-link" onClick={handleLogout}>Log out</span>
        </div>
      </div>

      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <img src="/Wellnest-Logo-Trophy.svg" alt="Wellnest Trophy Logo" className="leaderboard-logo" />
          <h1 className="leaderboard-title">Leaderboard</h1>
          <p className="leaderboard-subtitle">See who's resting best (and who needs a nap).</p>
          <div className="search-bar">
            <button onClick={() => setView('top')}>📈 Top 10</button>
            <button onClick={() => setView('bottom')}>📉 Bottom 10</button>
          </div>
        </div>

        <div className="leaderboard-content">
          <h2>{title}</h2>
          {fallback && (
            <p style={{ fontStyle: 'italic', color: '#888' }}>
              Not enough weekly data — showing all-time instead.
            </p>
          )}
          {loading ? (
            <p>Loading leaderboard...</p>
          ) : displayedList.length > 0 ? (
            displayedList.map((entry, i) => (
              <div key={i} className={`dream-post ${view === 'top' ? 
                i === 0 ? 'first-place' : 
                i === 1 ? 'second-place' : 
                i === 2 ? 'third-place' : '' : ''}`}>
                <div className="rank-number">
                  {getRankDisplay(i)}
                </div>
                <div className="user-name">{entry._id?.name || 'Unknown User'}</div>
                <div className="sleep-stats">
                  <span className="sleep-label">Total Sleep:</span>
                  <span className="sleep-hours">{entry.totalHours?.toFixed(1) ?? 0} hrs</span>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-feed">No data to display.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Leaderboard;