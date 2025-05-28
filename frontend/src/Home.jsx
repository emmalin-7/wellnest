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

  const navigate = useNavigate();

  const logSleep = async (e) => {
    e.preventDefault();
    if (!sleepHours) return;
    await axios.post('/api/sleep', { date: today, hours: Number(sleepHours), user: userId });
    setSleepHours('');
    fetchSleepData();
  };

  const submitDream = async (e) => {
    e.preventDefault();
    if (!dreamText || !sleepHours) return;

    try {
      const res = await axios.post('/api/dreams', {
        date: today,
        content: dreamText,
        user: userId,
        isPublic,
        hours: Number(sleepHours)
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

      const filtered = res.data.filter(d => typeof d.hours === 'number');
      const sorted = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      const recent = sorted.slice(-7); // Only keep the 7 most recent entries
      setSleepData(recent);
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
      const res = await axios.get('/api/dreams', { params });
      setDreams(res.data);
    } catch (err) {
      console.error('Failed to get dreams:', err);
      setDreams([]);
    }
  };

  const handleDelete = async (dreamId) => {
    if (!window.confirm('Delete this dream?')) return;

    try {
      await axios.delete(`/api/dreams/${dreamId}`, {
        params: { user: userId }
      });
      setDreams(prev => prev.filter(d => d._id !== dreamId));
      fetchSleepData(); // update chart if needed
    } catch (err) {
      console.error('Failed to delete dream:', err);
      alert('Could not delete dream.');
    }
  };

  useEffect(() => {
    fetchSleepData();
    fetchDreams();
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
        backgroundColor: '#04AA6D',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Sleep Hours by Date' }
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: {
        title: { display: true, text: 'Hours Slept' },
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
        <div className="left-links">
          <Link to="/feed">Feed</Link>
          <Link to="/leaderboard">Leaderboards</Link>
        </div>
        <div className="right-link">
          <Link to="/home">Profile</Link>
          <span className="logout-link" onClick={handleLogout}>Log out</span>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="date-section">
            <span className="date-label">{new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}</span>
          </div>
          <div className="profile-icon">👤</div>
        </div>

        <div className="dashboard-content">
          <div className="card chart-card">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="card dreams-card combined-dream-card">
            <div className="card-title">Today's Sleep Log: </div>
            <input
              type="number"
              placeholder="Enter hours slept"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="input-hours"
            />
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="Write about your dream..."
            />
            <label className="public-checkbox">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Share to Feed
            </label>
            <button onClick={submitDream}>Post Dream</button>
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
    </>
  );
}

export default Home;