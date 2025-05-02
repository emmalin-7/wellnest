import { useState } from 'react';

function AuthTest() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');

    const handleAuth = async (type) => {
    const endpoint = type === 'register' ? 'register' : 'login';
    
    try {
        const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            }
        );

        const data = await res.json();

        if (res.ok && type === 'login') {
            setToken(data.token);
            setMessage('logged in successfully!');
        }    
        else 
        {
        setMessage(data.message || data.error || 'done');
        }
    } 
    catch (err) 
    {
        console.error(err);
        setMessage('server error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
        <h2>Test Login/Register</h2>
        <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <br /><br />

        <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button onClick={() => handleAuth('register')}>Register</button>
        <button onClick={() => handleAuth('login')}>Login</button>
        <br /><br />
        
        {token && <p>Token: {token}</p>}
        {message && <p>{message}</p>}
        </div>
    );
}

export default AuthTest;