import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const [sleepData, setSleepData] = useState([]);
  const [userDreams, setUserDreams] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dreamsRes = await axios.get('/api/dreams', {
          params: { user: userId, isPublic: true }
        });
        const validDreams = dreamsRes.data.filter(d => typeof d.hours === 'number');

        const sorted = validDreams.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = sorted.slice(0, 7).reverse();
        setSleepData(recent);
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

        <div className="chart-wrapper">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <h3>Dream Logs</h3>
        {userDreams.length > 0 ? (
          userDreams.map((d, i) => (
            <div key={i} className="dream-entry">
              <strong>{d.date}</strong>
              {d.hours != null && <p><em>{d.hours} hours of sleep.</em></p>}
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