import { useState } from "react";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        
        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            console.log('Attempting login for:', username);
            
            const response = await fetch('http://localhost:5095/api/account/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    Username: username,
                    Password: password
                })
            });

            const data = await response.json();
            console.log('Login response:', response.status, data);

            if (response.ok) {
                // Store auth data directly
                if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
                if (data.Username) localStorage.setItem('username', data.Username);
                if (data.Id) localStorage.setItem('userId', data.Id.toString());
                
                console.log('Login successful, token stored:', !!localStorage.getItem('accessToken'));
                
                alert('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className='container mt-4'>
            <h2 className="text-center">Login</h2>
            <div className="card mx-auto py-3" style={{ maxWidth: "400px" }}>
                <div className="form-group px-4 py-1">
                    <label htmlFor="Username">Username</label>
                    <input
                        type="text"
                        className="form-control"
                        id="Username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        name="Username"
                    />
                </div>
                <div className="form-group px-4 py-1">
                    <label htmlFor="Password">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        name="Password"
                    />
                </div>
                {error && <div className="text-danger text-center mt-2">{error}</div>}
                <button onClick={handleLogin} className="mx-auto btn btn-success mt-2">
                    Login
                </button>
            </div>
        </div>
    );
}

export default Login;