import { useState } from "react";
import authService from "../utils/AuthService";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        try {
            const result = await authService.login({
                Username: username,
                Password: password
            });
            console.log('Login result:', result);
            
            if (result.success) {
                // AuthService already stored the token via setAuthData()
                console.log('Login successful, token stored:', authService.getToken());
                console.log('Is authenticated:', authService.isAuthenticated());
                
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                setError(result.error || 'Login failed.');
            }
        } catch (e) {
            setError('Network error.');
            console.error('Login error:', e);
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