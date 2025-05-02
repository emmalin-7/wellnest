import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.css';


function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // i think there's smth wrong here
        try {
        const res = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) 
            {
            setMessage('Login successful!');
            navigate('/dashboard');
        } 
        else 
        {
            setMessage(data.error || 'Login failed');
        }
        } catch (err) 
        {
        setMessage('server error THIS IS NOT WORKING');
        }
    };

    return (
        <div className="login-background">
            <div className="stars" />
            <div className="login-card">
                <h2>🌙 Welcome to WellNest! </h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                {message && <p className="error">{message}</p>}
                <p className="signup-link">
                    ⭐️ Don't have an account? <a href="#">Create one</a>
                </p>
            </div>
        </div>
    );
}
    
export default Login;