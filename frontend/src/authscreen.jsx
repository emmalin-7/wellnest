import { useState } from 'react';

function AuthScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [mode, setMode] = useState('login');

    const handleSubmit = async (e) => {
        e.preventDefault();
    const endpoint = mode === 'login' ? 'login' : 'register';

    try {
        const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, 
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            }
        );

      const data = await res.json();

    if (!res.ok) 
    {
        setMessage(data.error || 'error.');
        return;
    }
    
    if (mode === 'login') 
    {
        setToken(data.token);
        setMessage('logged in!');
    } 
    else 
    {
        setMessage('ur user has been registered. now you can log in!');
    }
    } 
    catch (err) 
    {
        setMessage('server error. please try again.');
    }
    };

    const handleLogout = () => {
        setToken('');
        setMessage('logged out!');
    };

    return (
        <div style={styles.container}>
            <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>
                    {mode === 'login' ? 'Login' : 'Register'}
                </button>
            </form>

            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.link}>
                    {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>

            {token && (
                <div style={styles.tokenBox}>
                <strong>Token:</strong>
                <pre>{token}</pre>
                <button onClick={handleLogout} style={styles.logout}>
                    Logout
                </button>
                </div>
            )}

            {message && <p>{message}</p>}
        </div>
    );
}

const styles = {
    container: 
    {
        maxWidth: '400px',
        margin: '4rem auto',
        padding: '2rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        backgroundColor: '#f9f9f9',
    },
    form: 
    {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1rem',
    },
    input: 
    {
        padding: '0.5rem',
        fontSize: '1rem',
    },
    button: 
    {
        padding: '0.5rem',
        fontSize: '1rem',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
    },
    link: 
    {
        background: 'none',
        border: 'none',
        color: '#007bff',
        textDecoration: 'underline',
        cursor: 'pointer',
        marginTop: '1rem',
    },
    tokenBox: 
    {
        marginTop: '1rem',
        textAlign: 'left',
        background: '#eef',
        padding: '1rem',
        borderRadius: '5px',
        fontSize: '0.9rem',
        wordBreak: 'break-all',
    },
    logout: 
    {
        marginTop: '1rem',
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '0.4rem',
        border: 'none',
        cursor: 'pointer',
    },
};

export default AuthScreen;