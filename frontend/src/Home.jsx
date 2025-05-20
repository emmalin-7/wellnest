import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
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

  const userEmail = localStorage.getItem('userEmail');
  console.log('User email:', userEmail);
  const today = new Date().toISOString().slice(0, 10);

  const [isPublic, setIsPublic] = useState(false);


  // logging sleep hours, NOT YET COMPLETE
  const logSleep = async (e) => {
    e.preventDefault();
    if (!sleepHours) return;

    // date set to current date for now so it auto updates, we can change this later
    await axios.post('/api/sleep', { date: today, hours: Number(sleepHours), user: userEmail });

    setSleepHours('');
    fetchSleepData();
  };
  
  // dealing with the dream submissions 
  const submitDream = async (e) => {
    e.preventDefault();
    if (!dreamText) return;

    try {
      console.log('Posting dream:', { date: today, content: dreamText, user: userEmail, isPublic });

      const res = await axios.post('/api/dreams', {
        date: today,
        content: dreamText,
        user: userEmail,
        isPublic
      });
      console.log('Dream posted:', res.data);

      setDreamText('');
      fetchDreams();
    } catch (err) {
      console.error('Failed to post dream:', err);
    }
  };

  const fetchSleepData = async () => {
    const res = await axios.get('/api/sleep', {
      params: { user: userEmail }
    });
    console.log('Fetched sleep data:', res.data);
    setSleepData(res.data.reverse());
  };

  const fetchDreams = async () => {
    try {
      const res = await axios.get('/api/dreams', {
        params: { user: userEmail }
      });
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

  // this chart doesn't work yet cuz we can't really enter sleep hours
  const chartData = {
    labels: sleepData.map((e) =>
      new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' })
    ),
    datasets: [
      {
        label: 'Hours Slept',
        data: sleepData.map((e) => e.hours),
        backgroundColor: '#04AA6D',
      },
    ],
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
        </div>
      </div>

      {/* dashboard */}
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="date-section">
            <span className="date-label">{today}</span>
            <a href="#" className="change-link" onClick={(e) => e.preventDefault()}>
              change
            </a>
          </div>
          <div className="profile-icon">👤</div>
        </div>

        <div className="dashboard-content">

          {/* THIS SECTION BELOW IS SLEEP LOGGING, BUT SLEEP LOGGING DOES NOT WORK YET.*/}

          {/* sleep logging */}
          <div className="card time-card">
            <div className="card-title">Log Sleep</div>
            <input
              type="number"
              placeholder="Enter hours slept"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
            />
            <button onClick={logSleep}>✎</button>
          </div>

          {/* sleep chart display */}
          <div className="card chart-card">
            <Bar data={chartData} />
          </div>

          {/* THIS SECTION BELOW IS DREAM LOGGING. this works BUT i cannot delete logs yet, additionally, it only displays on dashboard for now, not the feed yet */}

          {/* dream logging */}
          <div className="card dreams-card">
            <div className="card-title">🌙 DREAMS</div>
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
            <button onClick={submitDream}>post dream</button>
          </div>

          {/* show dreams (in dashboard only) [i think we can do this same way for the feed?] */}
          <div className="dreams-feed">
            {Array.isArray(dreams) && dreams.length > 0 ? (
              dreams.map((d, i) => (
                <div key={i} className="dream-entry">
                  <strong>{d?.date || 'No date'}</strong>
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