import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feed.css';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

function Feed() {
  const [dreams, setDreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPublicDreams = async (search = '') => {
    try {
      const res = await axios.get('/api/dreams', {
        params: {
          isPublic: true,
          search
        }
      });

      // if dream is marked as public, it will go on feed, otherwise, just profile
      // const publicDreams = res.data.filter(d => d.isPublic);
      
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

      {/* nav bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search public dreams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchPublicDreams(searchTerm);
            }
          }}
          />
        <button onClick={() => fetchPublicDreams(searchTerm)}>Search</button>
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