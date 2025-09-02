// src/utils/authService.js - Using accessToken consistently
class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:5095/api/account';
        this.apiURL = 'http://localhost:5095/api/freelancers';
    }

    // ===== ESSENTIAL TOKEN MANAGEMENT =====
    getToken() {
        return localStorage.getItem('accessToken');
    }

    setAuthData(authData) {
        if (authData.accessToken) localStorage.setItem('accessToken', authData.accessToken);
        if (authData.Username) localStorage.setItem('username', authData.Username);
        if (authData.Id) localStorage.setItem('userId', authData.Id.toString());
    }

    clearAuthData() {
        localStorage.removeItem('accessToken');
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
        return this.apiRequest(`http://localhost:5095/api/freelancers/${id}`, {
            method: 'GET'
        });
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
    async updateFreelancer(id, freelancerData) {
        try {
            const token = this.getToken();
            const response = await fetch(`http://localhost:5095/api/freelancers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(freelancerData)
            });

            if (response.status === 401) {
                this.clearAuthData();
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || `Update failed (${response.status})` };
            }

            // If backend returns no content, just return success
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Network error. Please try again.' };
        }
    }

    async createFreelancer(freelancerData) {
        try {
            const token = this.getToken();
            const response = await fetch(`http://localhost:5095/api/freelancers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(freelancerData)
            });

            if (response.status === 401) {
                this.clearAuthData();
                window.location.href = '/';
                throw new Error('Authentication failed');
            }

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || `Creating freelancer failed (${response.status})` };
            }

            // If backend returns no content, just return success
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Network error. Please try again.' };
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