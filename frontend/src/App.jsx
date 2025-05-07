import { useState } from 'react';
// import Login from './pages/login';
// import Dashboard from './pages/dashboard';
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;