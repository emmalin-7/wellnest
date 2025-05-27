import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feed.css';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

function Feed() {
  const [dreams, setDreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('content');
  const [hourSearch, setHourSearch] = useState('');


  const fetchPublicDreams = async () => {
    try {
    const params = { isPublic: true };

    if (searchMode === 'content' && searchTerm.trim()) {
      params.search = searchTerm;
    }
    if (searchMode === 'hours' && hourSearch.trim()) {
      params.hours = hourSearch;
    }

    const res = await axios.get('/api/dreams', { params });
      
      setDreams(res.data);
      } catch (err) {
        console.error('Failed to load dreams:', err);
        setDreams([]);
      }
    };

  useEffect(() => {
    fetchPublicDreams();
  }, []);

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

      {/* search mode toggle bar */}
      <div className="search-toggle">
      <span>Search by:</span>
      <label className="search-option">
        <input
          type="radio"
          value="content"
          checked={searchMode === 'content'}
          onChange={() => setSearchMode('content')}
        />
        <span>Content</span>
      </label>
      <label className="search-option">
        <input
          type="radio"
          value="hours"
          checked={searchMode === 'hours'}
          onChange={() => setSearchMode('hours')}
        />
        <span>Hours</span>
      </label>
    </div>


      {/* search bar */}
      <div className="search-bar">
        {searchMode === 'content' && (
        <input
          type="text"
          placeholder="Search public dreams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPublicDreams()}
         />
        )}
        {searchMode === 'hours' && (
        <input
          type="number"
          placeholder="Search by hours"
          value={hourSearch}
          onChange={(e) => setHourSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPublicDreams()}
        />
        )}
        <button onClick={fetchPublicDreams}>Search</button>
      </div>

      <div className="feed-container">
        <h2>🌔 Wellnest</h2>
        {Array.isArray(dreams) && dreams.length > 0 ? (
          dreams.map((dream, i) => (
            <div key={i} className="dream-post">
              <div className="post-header">
                <strong>{dream.user}</strong>
                <span>{dream.date}</span>
              </div>
              {dream.hours != null && (
                <p><em>{dream.hours} hours of sleep</em></p>
              )}
              <p>{dream.content}</p>
            </div>
          ))
        ) : (
          <p className="empty-feed">No public dreams yet.</p>
        )}
      </div>
    </>
  );
}

export default Feed;