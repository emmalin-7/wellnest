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
  const [searchMode, setSearchMode] = useState('content'); // toggle between search types

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.email;
  console.log('User email:', userEmail);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [isPublic, setIsPublic] = useState(false);

  const navigate = useNavigate();

  // logging sleep hours
  const logSleep = async (e) => {
    e.preventDefault();
    if (!sleepHours) return;

    // date set to current date for now so it auto updates, we can change this later (final)
    await axios.post('/api/sleep', { date: today, hours: Number(sleepHours), user: userEmail });

    setSleepHours('');
    fetchSleepData();
  };
  
  // dealing with the dream submissions 
const submitDream = async (e) => {
  e.preventDefault();
  if (!dreamText || !sleepHours) return;

  try {
    console.log('Posting dream:', {
      date: today,
      content: dreamText,
      user: userEmail,
      isPublic,
      hours: Number(sleepHours)
    });

    const res = await axios.post('/api/dreams', {
      date: today,
      content: dreamText,
      user: userEmail,
      isPublic,
      hours: Number(sleepHours)
    });

    console.log('Dream posted:', res.data);

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
        params: { user: userEmail }
      });

      // filter out dreams without valid hours
      const filtered = res.data.filter(d => typeof d.hours === 'number');

      // sort by date ascending
      const sorted = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

      setSleepData(sorted);
    } catch (err) {
      console.error('Failed to fetch sleep data from dreams:', err);
    }
  };

  const fetchDreams = async () => {
    try {
    const params = { user: userEmail };

    // Only add relevant search param
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

  useEffect(() => {
    fetchSleepData();
    fetchDreams();
  }, []);

  // this chart works!
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

      {/* dashboard */}
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="date-section">
            <span className="date-label">{today}</span>
          </div>
          <div className="profile-icon">👤</div>
        </div>

        <div className="dashboard-content">

          {/* THIS SECTION BELOW IS SLEEP LOGGING, BUT SLEEP LOGGING DOES NOT WORK YET.*/}

          {/* sleep chart display */}
          <div className="card chart-card">
            <Bar data={chartData} options={chartOptions} />
          </div>

          {/* THIS SECTION BELOW IS DREAM LOGGING. this works BUT i cannot delete logs yet, additionally, it only displays on dashboard for now, not the feed yet */}

          {/* dream logging */}
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

        {/* search mode toggle */}
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

          {/* show dreams (in dashboard only) [i think we can do this same way for the feed?] */}
          <div className="dreams-feed">
            {Array.isArray(dreams) && dreams.length > 0 ? (
              dreams.map((d, i) => (
                <div key={i} className="dream-entry">
                  <strong>{d?.date || 'No date'}</strong>
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