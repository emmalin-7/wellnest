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

  useEffect(() => {
    document.body.classList.add('user-profile-page');
    return () => {
      document.body.classList.remove('user-profile-page');
    };
  }, []);

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
        backgroundColor: '#D99DA1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
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

  return (
    <>
      <div className="topnav">
        <div className="nav-logo-container">
          <Link to="/feed">
            <img src="/Nav-Logo-Others.svg" alt="Nav Logo" className="nav-logo" />
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/feed">Feed</Link>
          <Link to="/leaderboard">Leaderboards</Link>
          <Link to="/home">Profile</Link>
          <span className="logout-link" onClick={handleLogout}>Log out</span>
        </div>
      </div>

      <div className="back-button-wrapper">
        <profile-back-button className="profile-back-button" onClick={() => navigate('/feed')}>← Back to Feed</profile-back-button>
      </div>

      <div className="profile-page">
        <img
          src="/Avatar-Pink.svg"
          alt="User Star"
          className="home-user-star"
        />
        <h2>{userInfo?.name || 'User Profile'}</h2>

        <div className="user-profile-chart-description">🛌 Weekly Sleep Summary</div>
        <div className="card user-profile-chart-card">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="user-profile-chart-description">
          🌙 Dream Archive
        </div>
        {userDreams.length > 0 ? (
          <div className="dreams-feed">
            {userDreams.map((d, i) => (
              <div key={i} className="home-dream-entry">
                <div className="dream-header">
                  <strong>
                    {d?.date ? new Date(d.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'No date'}
                  </strong>
                  {d?.hours != null && <p><em>{d.hours} hours of sleep</em></p>}
                </div>
                <p>{d?.content || 'No content'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No public dreams logged by this user.</p>
        )}
      </div>
    </>
  );
}

export default UserProfile;