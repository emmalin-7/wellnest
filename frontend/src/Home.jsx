import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import { Bar } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getTodayPSTDate() {
  const now = new Date();
  const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const year = pst.getFullYear();
  const month = String(pst.getMonth() + 1).padStart(2, '0');
  const day = String(pst.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function Home() {
  const [sleepHours, setSleepHours] = useState('');
  const [sleepData, setSleepData] = useState([]);
  const [dreamText, setDreamText] = useState('');
  const [dreams, setDreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sleepSearch, setSleepSearch] = useState('');
  const [searchMode, setSearchMode] = useState('content');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [dreamToDelete, setDreamToDelete] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  const today = getTodayPSTDate();
  const [isPublic, setIsPublic] = useState(false);
  const [hasPostedToday, setHasPostedToday] = useState(false);

  const navigate = useNavigate();

  const logSleep = async (e) => {
    e.preventDefault();
    const hours = Number(sleepHours);
    if (!sleepHours || hours < 0 || hours > 24) {
      alert('Please enter a valid number of hours between 0 and 24.');
      return;
    }

    await axios.post('/api/sleep', { date: today, hours, user: userId });
    setSleepHours('');
    fetchSleepData();
  };

  const submitDream = async (e) => {
    e.preventDefault();
    const hours = Number(sleepHours);
    if (!dreamText || !sleepHours || hours < 0 || hours > 24) {
      alert('Please enter a dream and a valid number of hours (0–24).');
      return;
    }

    try {
      await axios.post('/api/dreams', {
        content: dreamText,
        user: userId,
        isPublic,
        hours
      });

      setDreamText('');
      setSleepHours('');
      await fetchDreams();
      await fetchSleepData();
      setHasPostedToday(true);
    } catch (err) {
      console.error('Failed to post dream:', err);
    }
  };

  const fetchSleepData = async () => {
  try {
    const res = await axios.get('/api/dreams', {
      params: { user: userId }
    });
    const filtered = res.data.filter(d => typeof d.hours === 'number');

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);

    const fullWeekDates = [...Array(7)].map((_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d.toISOString().slice(0, 10); 
    });

    const dataMap = Object.fromEntries(
      filtered.map(d => [d.date, { date: d.date, hours: d.hours }])
    );

    const filled = fullWeekDates.map(date => dataMap[date] || { date, hours: 0 });

    setSleepData(filled);
  } catch (err) {
    console.error('Failed to fetch sleep data from dreams:', err);
  }
};

  const fetchDreams = async () => {
    try {
      const params = { user: userId };
      if (searchMode === 'content' && searchTerm.trim()) {
        params.search = searchTerm;
      }
      if (searchMode === 'hours' && sleepSearch.trim()) {
        params.hours = sleepSearch;
      }
      if (searchMode === 'date' && searchTerm.trim()) {
        params.date = searchTerm;
      }
      const res = await axios.get('/api/dreams', { params });
      setDreams(res.data);

      const todayPST = getTodayPSTDate();
      const hasPosted = res.data.some(d => d.date === todayPST);
      setHasPostedToday(hasPosted);
    } catch (err) {
      console.error('Failed to get dreams:', err);
      setDreams([]);
      setHasPostedToday(false);
    }
  };

  const handleDelete = async (dreamId) => {
    try {
      await axios.delete(`/api/dreams/${dreamId}`, {
        params: { user: userId }
      });
      setDreams(prev => prev.filter(d => d._id !== dreamId));
      fetchSleepData(); 
      fetchDreams();
    } catch (err) {
      console.error('Failed to delete dream:', err);
      alert('Could not delete dream.');
    }
  };

  const handleDeleteClick = (dreamId) => {
    setDreamToDelete(dreamId);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = async () => {
    if (dreamToDelete) {
      await handleDelete(dreamToDelete);
      setShowDeletePopup(false);
      setDreamToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setDreamToDelete(null);
  };

  useEffect(() => {
    fetchSleepData();
    fetchDreams();
  }, []);

  useEffect(() => {
    document.body.classList.add('home-page');
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  const chartData = {
    labels: sleepData.map((e) => {
      const pstDate = new Date(`${e.date}T12:00:00-08:00`);
      return pstDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }),
    datasets: [
      {
        label: 'Hours Slept',
        data: sleepData.map((e) => e.hours),
        backgroundColor: '#ACA5C7',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Sleep Hours by Date',
        font: { 
          family: 'DM Sans', 
          size: 16 
        },
      },
    },
    scales: {
      x: {
        title: { 
          display: true, 
          text: 'Date', 
          font: { 
            family: 'DM Sans' 
          } 
        },
        ticks: { 
          font: { 
            family: 'DM Sans' 
          } 
        }
      },
      y: {
        title: { 
          display: true, 
          text: 'Hours Slept', 
          font: { 
            family: 'DM Sans' 
          } 
        },
        ticks: { 
          font: { 
            family: 'DM Sans' 
          } 
        },
        beginAtZero: true,
        max: 24
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <>
      <div className="topnav">
        <div className="nav-logo-container">
          <Link to="/feed">
            <img src="/Nav-Logo-Profile.svg" alt="Nav Logo" className="nav-logo" />
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/feed">Feed</Link>
          <Link to="/leaderboard">Leaderboards</Link>
          <Link to="/home">Profile</Link>
          <span className="logout-link" onClick={handleLogout}>Log out</span>
        </div>
      </div>

      <div className="home-container">
        <div className="home-content">
          <img
            src={`/Avatar-${user?.starColor || 'Yellow'}.svg`}
            alt="User Star"
            className="home-user-star"
          />

          <div className="date-label">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
          <h1 className="welcome-title">
            ✨ Welcome, <span className="home-user-name">{user?.name || 'User'}</span>
          </h1>
          <p className="check-in-message">Let's check in on your sleep and dreams.</p>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-content">
            <h2 className="chart-description">🛌 Your Weekly Sleep Summary</h2>
            <div className="card home-chart-card">
              <Bar data={chartData} options={chartOptions} />
            </div>

            <h2 className="sleep-log-title">🌙  Today's Sleep Log:</h2>
            <div className="card dreams-card combined-dream-card">
              {hasPostedToday ? (
                <p className="already-posted-message">
                  <img src="/Moon.svg" alt="Moon" />
                  You've logged your sleep and dream for the day—nice!
                </p>
              ) : (
                <>
                  <p className="sleep-log-subtitle">How many hours did you sleep last night?</p>
                  <input
                    type="number"
                    placeholder="Enter hours slept"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="input-hours sleep-log-input"
                    disabled={hasPostedToday}
                  />
                  <p className="sleep-log-subtitle">Write about your dream or how well you slept!</p>
                  <textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder="Start typing your dream..."
                    className="sleep-log-input"
                    disabled={hasPostedToday}
                  />
                  <label className="public-checkbox">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      disabled={hasPostedToday}
                    />
                    Share to Feed
                  </label>
                  {/* if this doesn't work, change this back to button*/}
                  <sleep-log-button 
                    onClick={submitDream} 
                    disabled={hasPostedToday}
                    className="sleep-log-button"
                  >
                    Log entry
                  </sleep-log-button>
                </>
              )}
            </div>

            <h2 className="dream-journal-title">💭 Your Dream Journal</h2>
            
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
                    onKeyDown={(e) => e.key === 'Enter' && fetchDreams()}
                  />
                )}
                {searchMode === 'hours' && (
                  <input
                    type="number"
                    placeholder="Enter hours of sleep"
                    value={sleepSearch}
                    onChange={(e) => setSleepSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchDreams()}
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
                <button onClick={fetchDreams} className="home-search-button">Search</button>
              </div>
            </div>

            <div className="dreams-feed">
              {Array.isArray(dreams) && dreams.length > 0 ? (
                dreams.map((d, i) => (
                  <div key={i} className="home-dream-entry">
                    <div className="dream-header">
                      <strong>
                        {d?.date
                          ? new Date(`${d.date}T12:00:00-08:00`).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'No date'}
                      </strong>
                      {d?.hours != null && <p><em>{d.hours} hours of sleep</em></p>}
                    </div>
                    <p>{d?.content || 'No content'}</p>
                    <button
                      className="trash-button"
                      title="Delete"
                      onClick={() => handleDeleteClick(d._id)}
                    >
                      <img src="/Trash.svg" alt="Delete" />
                      Delete entry
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-feed">No dreams yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeletePopup && (
        <div className="delete-popup">
          <div className="delete-popup-content">
            <img src="/Moon.svg" alt="Moon" className="moon-icon" />
            <p>Are you sure you want to delete this entry?</p>
            <div className="delete-popup-buttons">
              <button className="cancel" onClick={handleCancelDelete}>Cancel</button>
              <button onClick={handleConfirmDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;