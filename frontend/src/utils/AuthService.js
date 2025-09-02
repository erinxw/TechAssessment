// src/utils/authService.js - Minimal Version
class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:5095/api/account';
        this.apiURL = 'http://localhost:5095/api';
    }

    // ===== ESSENTIAL TOKEN MANAGEMENT =====
    getToken() {
        return localStorage.getItem('token');
    }

    setAuthData(authData) {
        if (authData.AccessToken) localStorage.setItem('token', authData.AccessToken);
        if (authData.Username) localStorage.setItem('username', authData.Username);
        if (authData.Id) localStorage.setItem('userId', authData.Id.toString());
    }

    clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
    }

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        return {
            id: localStorage.getItem('userId'),
            username: localStorage.getItem('username'),
            token: this.getToken()
        };
    }

    async getFreelancerById(id) {
        return this.apiRequest(`http://localhost:5095/api/freelancers/${id}`);
    }

    // ===== AUTHENTICATION API CALLS =====
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                this.setAuthData(data);
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async signup(userData) {
        try {
            const response = await fetch(`${this.baseURL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                this.setAuthData(data);
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    logout() {
        this.clearAuthData();
    }

    // ===== AUTHENTICATED API REQUESTS =====
    async apiRequest(url, options = {}) {
        const token = this.getToken();

        if (!token) {
            throw new Error('No authentication token available');
        }

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                this.clearAuthData();
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // ===== CONVENIENCE METHODS =====
    async get(endpoint) {
        return this.apiRequest(`${this.apiURL}${endpoint}`);
    }

    async post(endpoint, data) {
        return this.apiRequest(`${this.apiURL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;