import { useState } from "react";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const handleLogin = async () => {
        setError('');
        try {
            const response = await fetch('http://localhost:5095/api/account/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    window.location.href = '/'; // Redirect to home
                } else {
                    setError('Invalid username or password.');
                }
            } else {
                const err = await response.json();
                setError(err.message || 'Login failed.');
            }
        } catch (e) {
            setError('Network error.');
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
                        name="Password"
                    />
                </div>
                {error && <div className="text-danger text-center mt-2">{error}</div>}
                <button onClick={handleLogin} className="mx-auto btn btn-success mt-2">
                    Login
                </button>
            </div>
        </div>
    )
}

export default Login;