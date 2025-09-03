// src/utils/authService.js - Consistent apiRequest usage
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

    // ===== CENTRALIZED API REQUEST HANDLER =====
    async apiRequest(url, options = {}) {
        const token = this.getToken();
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method: 'GET',
            headers: defaultHeaders,
            ...options,
            // Merge headers properly
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, config);
            
            // Centralized 401 handling
            if (response.status === 401) {
                this.clearAuthData();
                window.location.href = '/login';
                throw new Error('Authentication failed');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    // Helper method to handle common response patterns
    async handleApiResponse(response) {
        if (!response.ok) {
            let errorMessage = `Request failed (${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Keep default error message if response is not JSON
            }
            return { success: false, error: errorMessage };
        }

        // Try to get response data
        let responseData = null;
        try {
            responseData = await response.json();
        } catch (e) {
            // No JSON data, that's fine for some endpoints
        }

        return { success: true, data: responseData };
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
    
    async getFreelancerById(id) {
        try {
            const response = await this.apiRequest(`${this.apiURL}/${id}`);
            return this.handleApiResponse(response);
        } catch (error) {
            return { success: false, error: error.message || 'Network error' };
        }
    }

    async updateFreelancer(id, freelancerData) {
        try {
            if (!this.isAuthenticated()) {
                return { success: false, error: 'Not authenticated' };
            }

            const response = await this.apiRequest(`${this.apiURL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(freelancerData)
            });

            return this.handleApiResponse(response);
        } catch (error) {
            return { success: false, error: error.message || 'Network error. Please try again.' };
        }
    }

    async createFreelancer(freelancerData) {
        try {
            if (!this.isAuthenticated()) {
                return { success: false, error: 'Not authenticated' };
            }

            const response = await this.apiRequest(`${this.apiURL}`, {
                method: 'POST',
                body: JSON.stringify(freelancerData)
            });

            return this.handleApiResponse(response);
        } catch (error) {
            return { success: false, error: error.message || 'Network error. Please try again.' };
        }
    }

    async deleteFreelancer(id) {
        try {
            if (!this.isAuthenticated()) {
                return { success: false, error: 'Not authenticated' };
            }

            const response = await this.apiRequest(`${this.apiURL}/${id}`, {
                method: 'DELETE'
            });

            return this.handleApiResponse(response);
        } catch (error) {
            return { success: false, error: error.message || 'Network error. Please try again.' };
        }
    }

    async getAllFreelancers() {
        try {
            const response = await this.apiRequest(`${this.apiURL}`);
            return this.handleApiResponse(response);
        } catch (error) {
            return { success: false, error: error.message || 'Network error' };
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

    async put(endpoint, data) {
        return this.apiRequest(`${this.apiURL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.apiRequest(`${this.apiURL}${endpoint}`, {
            method: 'DELETE'
        });
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;