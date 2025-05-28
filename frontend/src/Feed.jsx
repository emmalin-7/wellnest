import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feed.css';
import { Bar } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';

function Feed() {
  const [dreams, setDreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('content');
  const [hourSearch, setHourSearch] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

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

  const handleLike = async (dreamId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;
    try {
      await axios.post('/api/dreams/' + dreamId + '/like', { user: userId });
      alert('dream successfully liked');
      setDreams((prev) =>
        prev.map((entry) =>
          entry._id === dreamId
            ? { ...entry, likes: [...entry.likes, userId] }
            : entry
        )
      );
    } catch (error) {
      alert(error.response.data);
    }
  };

  const handleComment = async (dreamId, e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    try {
      const body = { user: userId, content: e.target.content.value };
      await axios.post('/api/dreams/' + dreamId + '/comment', body);
      alert('dream successfully commented on');
      setDreams((prev) =>
        prev.map((entry) =>
          entry._id === dreamId
            ? { ...entry, comments: [...entry.comments, body] }
            : entry
        )
      );
    } catch (error) {
      console.error(error);
      alert(error.response.data);
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
          <span className="logout-link" onClick={handleLogout}>
            Log out
          </span>
        </div>
      </div>

      <div className="feed-container">
        <div className="feed-header">
          <img src="/Feed-Logo.svg" alt="Feed Logo" className="feed-logo" />
          <p className="feed-title">💤 Dream Feed</p>
          <p className="feed-subtitle">Explore dreams shared by the community!</p>
        </div>

        {/* search mode toggle bar */}
        <div className="search-toggle">
          <p className="search-label">Search by:</p>
          <div className="search-options">
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
        </div>

        {/* search bar */}
        <div className="search-section">
          <p className="search-description">Search through dreams</p>
          <div className="search-bar">
            <img src="/Search.svg" alt="Search" className="search-icon" />
            {searchMode === 'content' && (
              <input
                type="text"
                placeholder="Try keywords like 'flying' or 'nightmare'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPublicDreams()}
              />
            )}
            {searchMode === 'hours' && (
              <input
                type="number"
                placeholder="Enter hours of sleep"
                value={hourSearch}
                onChange={(e) => setHourSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPublicDreams()}
              />
            )}
            <button onClick={fetchPublicDreams} className="feed-search-button">Search</button>
          </div>
        </div>

        {Array.isArray(dreams) && dreams.length > 0 ? (
          dreams.map((dream, i) => (
            <div key={i} className="dream-post">
              <div className="post-header">
                <strong>
                  <Link to={`/profile/${typeof dream.user === 'object' ? dream.user._id : dream.user}`}>
                    {typeof dream.user === 'object' ? dream.user.name : dream.user}
                  </Link>
                </strong>
                <span>
                  <span>
                    {dream.date?.split('-').join('/')}
                  </span>
                </span>
              </div>
              {dream.hours != null && (
                <p>
                  <em>{dream.hours} hours of sleep</em>
                </p>
              )}
              <p>{dream.content}</p>
              <div className="actions">
                <button className="like-button" onClick={() => handleLike(dream._id)}>♡ Like</button>
                <span>{dream.likes.length} Likes</span>
              </div>
              <div>
                {dream.comments.map((comment, idx) => (
                  <div key={idx}>
                    <div className="comment-header"> {comment.user?.name}</div>
                    <div>{comment.content}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={(e) => handleComment(dream._id, e)}>
                <div>Add a Comment!</div>
                <textarea name="content"></textarea>
                <button>↵</button>
              </form>
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