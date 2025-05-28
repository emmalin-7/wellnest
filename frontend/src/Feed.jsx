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
      const res = await axios.post('/api/dreams/' + dreamId + '/like', { user:userId });
      alert('dream successfully liked')
      setDreams(prev => {
        return prev.map(entry => {
          if (entry._id == dreamId){
            return {...entry, likes: [ ...entry.likes, userId ]}
          }
          return entry;
        })
      })
    } catch (error) {
      alert(error.response.data)
    }
  }

  const handleComment = async (dreamId, e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;
    
    console.log('hello');
    try {
      const body = { user:userId, content:e.target.content.value };
      const res = await axios.post('/api/dreams/' + dreamId + '/comment', body );
      alert('dream successfully commented on')
      setDreams(prev => {
        return prev.map(entry => {
          if (entry._id == dreamId){
            return {...entry, comments: [ ...entry.comments, body ]}
          }
          return entry;
        })
      })
    } catch (error) {
      console.error(error);
      alert(error.response.data)
    }
  }

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
                <span>{new Date(dream.date).toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
              {dream.hours != null && (
                <p><em>{dream.hours} hours of sleep</em></p>
              )}
              <p>{dream.content}</p>
              <button onClick={() => handleLike(dream._id)}> 
                ♡
              </button>
              <span>
                {dream.likes.length} Likes
              </span>
              <div>
                {dream.comments.map((comment)=> {
                  return <div>
                    {comment.user}/{
                      comment.content
                    }
                  </div>
                })}
              </div>
              <form onSubmit={(e) => handleComment(dream._id, e)}> 
                <div>
                  Add a Comment!
                </div>
                <textarea name='content'></textarea>
                <button>
                  ↵
                </button>
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