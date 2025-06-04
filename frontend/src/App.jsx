import { useState } from 'react';
// import Login from './pages/login';
// import Dashboard from './pages/dashboard';
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import Leaderboard from './Leaderboard';
import Feed from './Feed';
import UserProfile from './UserProfile';
import ChooseStarAvatar from './ChooseStarAvatar';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  // routing all the paths to the right pages for easier access in code 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/choose-star" element={<ChooseStarAvatar />} />
        <Route path="*" element={<div style={{ padding: 40 }}><h1>404 - Page Not Found</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;
