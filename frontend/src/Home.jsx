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

function Home() {
  const [sleepHours, setSleepHours] = useState('');
  const [sleepData, setSleepData] = useState([]);
  const [dreamText, setDreamText] = useState('');
  const [dreams, setDreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sleepSearch, setSleepSearch] = useState('');
  const [searchMode, setSearchMode] = useState('content');

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  const today = new Date().toISOString().split('T')[0];
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
      const res = await axios.post('/api/dreams', {
        date: today,
        content: dreamText,
        user: userId,
        isPublic,
        hours
      });

      setDreamText('');
      setSleepHours('');
      fetchDreams();
      fetchSleepData();
    } catch (err) {
      console.error('Failed to post dream:', err);
    }
  };

  const fetchSleepData = async () => {
    try {
      const res = await axios.get('/api/dreams', {
        params: { user: userId }
      });

      // Filter for valid hour entries
      const filtered = res.data.filter(d => typeof d.hours === 'number');

      // Sort by date descending (newest first)
      const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Take the 7 most recent entries
      const recent = sorted.slice(0, 7);

      // Reverse again so that oldest is on the left, newest on right
      setSleepData(recent.reverse());
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

      const todayStr = new Date().toISOString().split('T')[0];
      const hasPosted = res.data.some(d => d.date === todayStr);
      setHasPostedToday(hasPosted);
    } catch (err) {
      console.error('Failed to get dreams:', err);
      setDreams([]);
      setHasPostedToday(false);
    }
  };

  const handleDelete = async (dreamId) => {
    if (!window.confirm('Delete this dream?')) return;

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
      const [year, month, day] = e.date.split('-');
      const localDate = new Date(Number(year), Number(month) - 1, Number(day));
      return localDate.toLocaleDateString('en-US', {
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
      legend: { 
        display: false,
        labels: {
          font: {
            family: 'DM Sans'
          }
        }
      },
      title: { 
        display: true, 
        text: 'Sleep Hours by Date',
        font: {
          family: 'DM Sans',
          size: 16
        }
      }
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
            ✨ Welcome back, <span className="home-user-name">{user?.name || 'User'}</span>
          </h1>
          <p className="check-in-message">Let's check in on your sleep and dreams.</p>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-content">
            <h2 className="chart-description">🛌 Your Weekly Sleep Summary</h2>
            <div className="card chart-card">
              <Bar data={chartData} options={chartOptions} />
            </div>

            <h2 className="sleep-log-title">🌙 Today's Sleep Log:</h2>
            <div className="card dreams-card combined-dream-card">
              {hasPostedToday ? (
                <p className="already-posted-message">
                  <img src="/Moon.svg" alt="Moon" />
                  You've logged your dream sleep for the day—nice!
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
              


            <div className="search-bar">
              {searchMode === 'content' && (
                <input
                  type="text"
                  placeholder="Search dreams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchDreams()}
                />
              )}
              {searchMode === 'hours' && (
                <input
                  type="number"
                  placeholder="Search by hours"
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
              <button onClick={fetchDreams}>Search</button>
            </div>
            

            <div className="dreams-feed">
              {Array.isArray(dreams) && dreams.length > 0 ? (
                dreams.map((d, i) => (
                  <div key={i} className="dream-entry">
                    <div className="post-header-with-trash">
                      <strong>{d?.date || 'No date'}</strong>
                      <button
                        className="trash-button"
                        title="Delete"
                        onClick={() => handleDelete(d._id)}
                      >
                        🗑️
                      </button>
                    </div>
                    {d?.hours != null && <p><em>{d.hours} hours of sleep</em></p>}
                    <p>{d?.content || 'No content'}</p>
                  </div>
                ))
              ) : (
                <p className="empty-feed">No dreams yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;