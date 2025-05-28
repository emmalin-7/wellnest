import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // ✅ Fix 1
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './UserProfile.css';
import './Home.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function UserProfile() {
  const { userId } = useParams();
  const [userDreams, setUserDreams] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate(); // ✅ Fix 2

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dreamsRes = await axios.get('/api/dreams', {
          params: { user: userId, isPublic: true }
        });
        setUserDreams(dreamsRes.data);

        const userRes = await axios.get(`/api/users/${userId}`);
        setUserInfo(userRes.data);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    };

    fetchData();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const sleepData = userDreams
    .filter(d => typeof d.hours === 'number')
    .reduce((acc, dream) => {
      if (!acc[dream.date]) acc[dream.date] = 0;
      acc[dream.date] += dream.hours;
      return acc;
    }, {});

  const sleepEntries = Object.entries(sleepData)
    .map(([date, hours]) => ({ date, hours }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7);

  const chartData = {
    labels: sleepEntries.map((e) => {
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
        data: sleepEntries.map(e => e.hours),
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

      <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate('/feed')}>← Back to Feed</button>
      </div>

      <div className="profile-page">
        <h2>{userInfo?.name || 'User Profile'}</h2>
        <p>{userInfo?.email}</p>

        <div className="chart-wrapper">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <h3>Public Dream Logs</h3>
        {userDreams.length > 0 ? (
          userDreams.map((d, i) => (
            <div key={i} className="dream-entry">
              <strong>{d.date}</strong>
              {d.hours != null && <p><em>{d.hours} hours</em></p>}
              <p>{d.content}</p>
            </div>
          ))
        ) : (
          <p>No public dreams logged by this user.</p>
        )}
      </div>
    </>
  );
}

export default UserProfile;