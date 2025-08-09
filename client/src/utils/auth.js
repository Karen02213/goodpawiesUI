// client/src/utils/auth.js - Client-side Authentication Helper
import { useState, useEffect } from 'react';

class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.tokenKey = 'accessToken';
  }

  // Get stored access token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Store access token
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  // Remove access token
  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.data.accessToken);
        return { success: true, user: data.data };
      } else {
        return { success: false, error: data.error, message: data.message };
      }
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR', message: 'Network error occurred' };
    }
  }

  // Login user
  async login(identifier, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.data.accessToken);
        return { success: true, user: data.data };
      } else {
        return { success: false, error: data.error, message: data.message };
      }
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR', message: 'Network error occurred' };
    }
  }

  // Refresh access token
  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.data.accessToken);
        return { success: true };
      } else {
        this.removeToken();
        return { success: false };
      }
    } catch (error) {
      this.removeToken();
      return { success: false };
    }
  }

  // Logout user
  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  // Logout from all devices
  async logoutAll() {
    try {
      await fetch(`${this.baseURL}/auth/logout-all`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      this.removeToken();
    }
  }

  // Get current user information
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, user: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      return { success: data.success, message: data.message, error: data.error };
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR' };
    }
  }

  // Generic API request with authentication
  async apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      let response = await fetch(url, config);

      // If token expired, try to refresh
      if (response.status === 401 && endpoint !== '/auth/refresh') {
        const refreshResult = await this.refreshToken();
        
        if (refreshResult.success) {
          // Retry request with new token
          config.headers = {
            ...config.headers,
            ...this.getAuthHeaders(),
          };
          response = await fetch(url, config);
        } else {
          // Refresh failed, redirect to login
          this.removeToken();
          window.location.href = '/login';
          return { success: false, error: 'AUTHENTICATION_EXPIRED' };
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'NETWORK_ERROR', message: error.message };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;

// React Hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          authService.removeToken();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    const result = await authService.login(identifier, password);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
    return result;
  };

  const register = async (userData) => {
    setLoading(true);
    const result = await authService.register(userData);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    authService,
  };
};

// Example usage in React components:
/*
// In a component:
import { useAuth } from './utils/auth';

function LoginForm() {
  const { login, loading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(identifier, password);
    
    if (result.success) {
      // Redirect to dashboard
    } else {
      // Show error message
      console.error(result.message);
    }
  };
  
  // ... rest of component
}

// For API calls:
import authService from './utils/auth';

const fetchUserPets = async (userId) => {
  return await authService.apiRequest(`/users/${userId}/pets`);
};

const createPet = async (userId, petData) => {
  return await authService.apiRequest(`/users/${userId}/pets`, {
    method: 'POST',
    body: JSON.stringify(petData),
  });
};
*/
