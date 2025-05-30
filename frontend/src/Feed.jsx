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
  const [userSearch, setUserSearch] = useState('');
  const [showLikePopup, setShowLikePopup] = useState(false);
  const [likePopupMessage, setLikePopupMessage] = useState('');
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [showEmptyCommentPopup, setShowEmptyCommentPopup] = useState(false);
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('feed-body');
    return () => {
      document.body.classList.remove('feed-body');
    };
  }, []);

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
      if (searchMode === 'user' && userSearch.trim()) {
        params.userSearch = userSearch;
      }
      if (searchMode === 'date' && searchTerm.trim()) {
        params.date = searchTerm;
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
      setLikePopupMessage('Successfully liked post!');
      setShowLikePopup(true);
      setDreams((prev) =>
        prev.map((entry) =>
          entry._id === dreamId
            ? { ...entry, likes: [...entry.likes, userId] }
            : entry
        )
      );
    } catch (error) {
      setLikePopupMessage('You already liked this post!');
      setShowLikePopup(true);
    }
  };

  const handleComment = async (dreamId, e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    if (!e.target.content.value.trim()) {
      setShowEmptyCommentPopup(true);
      return;
    }

    try {
      const body = { user: userId, content: e.target.content.value };
      await axios.post('/api/dreams/' + dreamId + '/comment', {
        user: userId,
        content: e.target.content.value
      });
      setShowCommentPopup(true);
      await fetchPublicDreams();

      e.target.reset();
      
    } catch (error) {
      console.error(error);
      alert(error.response.data);
    }
  };

  const handleCommentDelete = async (dreamId, commentId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    try {
      await axios.delete(`/api/dreams/${dreamId}/comments/${commentId}`, {
        data: { user: userId }
      });

      fetchPublicDreams();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment.');
    }
  };

  return (
    <div className="feed-page">
      {/* Test font loading */}
      <div className="test-font" style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}>Test Font</div>
      
      {/* nav bar */}
      <div className="topnav">
        <div className="nav-logo-container">
          <Link to="/feed">
            <img src="/Nav-Logo-Feed.svg" alt="Nav Logo" className="nav-logo" />
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/feed" className="feed-link">Feed</Link>
          <Link to="/leaderboard">Leaderboards</Link>
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
            <label className="search-option">
              <input
                type="radio"
                value="user"
                checked={searchMode === 'user'}
                onChange={() => setSearchMode('user')}
              />
              <span>User</span>
            </label>
            <label className="search-option">
              <input
                type="radio"
                value="date"
                checked={searchMode === 'date'}
                onChange={() => setSearchMode('date')}
              />
              <span>Date</span>
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
            {searchMode === 'user' && (
              <input
                type="text"
                placeholder="Enter username"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPublicDreams()}
              />
            )}
            {searchMode === 'date' && (
              <input
                type="date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDreams()}
              />
            )}
            <button onClick={fetchPublicDreams} className="feed-search-button">Search</button>
          </div>
        </div>

        {Array.isArray(dreams) && dreams.length > 0 ? (
          dreams.map((dream, i) => (
            <div key={i} className="feed-dream-post">
              <div className="post-header">
                <div className="post-user-info">
                  <img
                    src={`/Avatar-${dream.user.starColor || 'Yellow'}.svg`}
                    alt="Profile"
                    className="profile-pic"
                  />
                  <div className="user-details">
                    <Link to={`/profile/${typeof dream.user === 'object' ? dream.user._id : dream.user}`} className="user-name">
                      {typeof dream.user === 'object' ? dream.user.name : dream.user}
                    </Link>
                    {dream.hours != null && (
                      <p className="sleep-hours">{dream.hours} hours slept</p>
                    )}
                  </div>
                </div>
                <span className="post-date">
                  {dream.date
                    ? new Date(`${dream.date}T12:00:00-08:00`).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : dream.created
                    ? new Date(dream.created).toLocaleDateString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''}
                </span>
              </div>
              <p className="dream-content">{dream.content}</p>
              <div className="like-section">
                <button 
                  className="like-button" 
                  onClick={() => handleLike(dream._id)}
                  onMouseEnter={(e) => {
                    if (!dream.likes.includes(currentUserId)) {
                      e.currentTarget.querySelector('img').src = '/Red-Heart.svg';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!dream.likes.includes(currentUserId)) {
                      e.currentTarget.querySelector('img').src = '/Empty-Heart.svg';
                    }
                  }}
                >
                  <img 
                    src={dream.likes.includes(currentUserId) ? '/Red-Heart.svg' : '/Empty-Heart.svg'} 
                    alt="Like" 
                    className="heart-icon" 
                  />
                  <span className="like-count">{dream.likes.length} {dream.likes.length === 1 ? 'Like' : 'Likes'}</span>
                </button>
              </div>
              <form onSubmit={(e) => handleComment(dream._id, e)} className="comment-form">
                <textarea 
                  name="content" 
                  className="comment-input" 
                  placeholder="Add a comment..."
                ></textarea>
                <button className="comment-submit">Post Comment</button>
              </form>
              <div className="comments-section">
                <h3 className="comments-title">Comments:</h3>
                {dream.comments.map((comment, idx) => (
                  <div key={idx} className="comment">
                    <div className="comment-header">
                      <span className="comment-user">{comment.user?.name || 'unknown user'}</span>
                        {(comment.user === currentUserId || comment.user?._id === currentUserId) && (
                          <button
                            onClick={() => handleCommentDelete(dream._id, comment._id)}
                            className="delete-comment"
                          >
                            <img src="/Trash.svg" alt="Delete" style={{ width: '20x', height: '20px' }} />
                          </button>
                        )}
                    </div>
                    <div className="comment-content">{comment.content}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-feed">No public dreams yet.</p>
        )}

        {showLikePopup && (
          <div className="like-popup">
            <div className="like-popup-content">
              <img src="/Moon.svg" alt="Moon" className="moon-icon" />
              <p>{likePopupMessage}</p>
              <button onClick={() => setShowLikePopup(false)}>Okay</button>
            </div>
          </div>
        )}

        {showEmptyCommentPopup && (
          <div className="like-popup">
            <div className="like-popup-content">
              <img src="/Moon.svg" alt="Moon" className="moon-icon" />
              <p>Oops!<br/>You need to write a comment first.</p>
              <button onClick={() => setShowEmptyCommentPopup(false)}>Okay</button>
            </div>
          </div>
        )}

        {showCommentPopup && (
          <div className="like-popup">
            <div className="like-popup-content">
              <img src="/Moon.svg" alt="Moon" className="moon-icon" />
              <p>Comment added!</p>
              <button onClick={() => setShowCommentPopup(false)}>Okay</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;