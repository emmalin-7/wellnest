import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feed.css';
import { Link } from 'react-router-dom';

function Leaderboard() {
  const [top10, setTop10] = useState([]);
  const [bottom10, setBottom10] = useState([]);

  // default to top 10
  const [view, setView] = useState('top');
  const [fallback, setFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/leaderboard')
      .then(res => {
        setTop10(res.data.top10 || []);
        setBottom10(res.data.bottom10 || []);
        setFallback(res.data.fallback || false);
        setLoading(false);
      })
      .catch(err => {
        console.error('Leaderboard fetch failed:', err);
        setLoading(false);
      });
  }, []);

  const displayedList = view === 'top' ? top10 : bottom10;
  const title = view === 'top' ? 'Top 10 Sleepers' : 'Bottom 10 Sleepers';

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

      {/* toggle view for the different leaderboards */}
      <div className="search-bar">
        <button onClick={() => setView('top')}>Top 10</button>
        <button onClick={() => setView('bottom')}>Bottom 10</button>
      </div>

      <div className="feed-container">
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
            <div key={i} className="dream-post">
              <div className="post-header">
                <strong>{entry._id}</strong>
                <span>{entry.totalHours ?? 0} hrs</span>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-feed">No data to display.</p>
        )}
      </div>
    </>
  );
}

export default Leaderboard;