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

function getTodayPSTDate() {
  const now = new Date();
  const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const year = pst.getFullYear();
  const month = String(pst.getMonth() + 1).padStart(2, '0');
  const day = String(pst.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function UserProfile() {
    const { userId } = useParams();
    const [sleepData, setSleepData] = useState([]);
    const [userDreams, setUserDreams] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
    const fetchData = async () => {
        try {
            const allDreamsRes = await axios.get('/api/dreams', {
                params: { user: userId }
            });
            const allDreams = allDreamsRes.data.filter(d => typeof d.hours === 'number');

            const today = new Date();
            const startDate = new Date();
            startDate.setDate(today.getDate() - 6);

            const fullWeekDates = [...Array(7)].map((_, i) => {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i);
                return d.toISOString().slice(0, 10);
            });

            const dataMap = Object.fromEntries(
                allDreams.map(d => [d.date, { date: d.date, hours: d.hours }])
            );

            const filledSleep = fullWeekDates.map(date => dataMap[date] || { date, hours: 0 });
            setSleepData(filledSleep);

            const publicDreamsRes = await axios.get('/api/dreams', {
                params: { user: userId, isPublic: true }
            });
            setUserDreams(publicDreamsRes.data);

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
            <profile-back-button className="profile-back-button" onClick={() => navigate('/feed')}>
                ← Back to Feed
            </profile-back-button>
            </div>

            {userInfo ? (
            <div className="profile-page">
                <img
                src={`/Avatar-${userInfo.starColor || 'Yellow'}.svg`}
                alt="User Star"
                className="home-user-star"
                />
                <h2>{userInfo.name}</h2>

                <div className="user-profile-chart-description">🛌 Weekly Sleep Summary</div>
                <div className="card user-profile-chart-card">
                <Bar data={chartData} options={chartOptions} />
                </div>

                <div className="user-profile-chart-description">🌙 Dream Archive</div>

                {userDreams.length > 0 ? (
                <div className="dreams-feed">
                    {userDreams.map((d, i) => (
                    <div key={i} className="home-dream-entry">
                        <div className="dream-header">
                        <strong>
                            {(() => {
                            try {
                                const date = new Date(`${(d.date || '').slice(0, 10)}T12:00:00-08:00`);
                                return date.toLocaleDateString('en-US', {
                                    timeZone: 'America/Los_Angeles',
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            } catch {
                                return 'No date';
                            }
                            })()}
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
            ) : (
            <div className="profile-page-loading">Loading user profile...</div>
            )}
        </>
    );
}

export default UserProfile;