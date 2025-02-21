// src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Get base URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_PREFIX = '/api/v1';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Enable sending cookies in cross-origin requests
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle request attributes by adding them to a custom header
    if (config.attributes) {
      Object.entries(config.attributes).forEach(([key, value]) => {
        config.headers[`X-Request-Attribute-${key}`] = value;
      });
    }

    // Ensure proper handling of query parameters
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          config.params[key] = JSON.stringify(value);
        }
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic and better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Handle CORS and Network errors more explicitly
    if (error.message.includes('Network Error') || error.message.includes('CORS')) {
      console.error('Connection Error:', error);
      const errorMessage = 'Unable to connect to the server. Please ensure the backend is running.';
      toast.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }
    
    // Handle specific error cases
    if (response) {
      const errorMessage = response.data?.message || 'An error occurred';
      
      switch (response.status) {
        case 401:
          toast.error('Authentication required. Please log in again.');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 429:
          toast.warning('Too many requests. Please try again later.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          if (response.status >= 500) {
            toast.error('Server error. Please try again later.');
          } else {
            toast.error(errorMessage);
          }
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to check backend connection
const checkBackendConnection = async () => {
  try {
    // Use base URL without /api/v1 for actuator endpoint
    const healthUrl = `${BASE_URL}/actuator/health`;
    const response = await axios.get(healthUrl, {
      timeout: 5000,
      validateStatus: function (status) {
        // Consider any response from server as "connected"
        // Even 500 means server is up, just having issues
        return status >= 200 && status < 600;
      }
    });

    // Spring Boot Actuator health endpoint returns a status field
    if (response.data?.status === 'UP') {
      return true;
    }

    // If we get any response but status isn't UP, server is up but might have issues
    if (response.status >= 200 && response.status < 300) {
      console.warn('Backend is running but reporting unhealthy status:', {
        status: response.status,
        healthStatus: response.data?.status,
        data: response.data
      });
      toast.warning('Backend service is reporting unhealthy status. Some features may be limited.');
      return true; // Still return true as server is reachable
    }

    if (response.status >= 500) {
      console.warn('Backend is running but reporting issues:', {
        status: response.status,
        data: response.data
      });
      toast.warning('Backend service is experiencing issues. Some features may be limited.');
      return true; // Still return true as server is reachable
    }

    if (response.status >= 400) {
      console.warn('Backend health check failed with client error:', {
        status: response.status,
        data: response.data
      });
      toast.error('Unable to verify backend health. Please check your configuration.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Backend connection check failed:', error);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      toast.error('Backend connection timed out. Please check if the server is running.');
    } else if (error.message.includes('Network Error')) {
      toast.error('Unable to reach the backend server. Please ensure it is running.');
    } else if (error.message.includes('CORS')) {
      toast.error('CORS error: Backend server is not accepting requests from this origin.');
    } else {
      toast.error('Unable to connect to the backend server. Please try again later.');
    }
    
    return false;
  }
};

// Rate limiting state
const rateLimit = {
  requestCount: 0,
  resetTime: Date.now(),
  maxRequests: 30, // Maximum requests per minute
  resetInterval: 60000 // 1 minute
};

// Request interceptor for rate limiting
api.interceptors.request.use(
  async (config) => {
    const now = Date.now();
    
    // Reset counter if interval has passed
    if (now - rateLimit.resetTime >= rateLimit.resetInterval) {
      rateLimit.requestCount = 0;
      rateLimit.resetTime = now;
    }
    
    // Check if we're about to exceed rate limit
    if (rateLimit.requestCount >= rateLimit.maxRequests) {
      const waitTime = rateLimit.resetTime + rateLimit.resetInterval - now;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        // Reset counter after waiting
        rateLimit.requestCount = 0;
        rateLimit.resetTime = Date.now();
      }
    }
    
    rateLimit.requestCount++;
    return config;
  },
  (error) => Promise.reject(error)
);

// Add retry functionality for specific endpoints
const withRetry = (apiCall, retries = 3, delay = 1000) => {
  return async (...args) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await apiCall(...args);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retrying API call... Attempt ${i + 2}/${retries}`);
      }
    }
  };
};

// Export the api instance and connection check
export { api, checkBackendConnection };

// Export all API endpoints
export const userApi = {
  getAllUsers: () => {
    console.log('Making getAllUsers request...');
    const token = localStorage.getItem('token');
    console.log('Token present:', !!token);
    
    return api.get('/users')
      .then(response => {
        console.log('getAllUsers success:', response);
        return response;
      })
      .catch(error => {
        console.error('getAllUsers error:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        throw error;
      });
  },
  getUser: (username) => api.get(`/users/${username}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (username, userData) => api.put(`/users/${username}`, userData),
  deleteUser: (username) => api.delete(`/users/${username}`),
  updateUserStatus: (username, status) => {
    const params = new URLSearchParams({ status });
    return api.patch(`/users/${username}/status?${params}`);
  },
  checkUsername: (username) => {
    const encodedUsername = encodeURIComponent(username);
    return api.get(`/users/check-username/${encodedUsername}`)
      .then(response => response.data);
  },
  checkEmail: (email) => {
    const encodedEmail = encodeURIComponent(email);
    return api.get(`/users/check-email/${encodedEmail}`)
      .then(response => response.data);
  },
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (username, data) => api.post(`/users/${username}/change-password`, data),
  updateUserRoles: (username, roles) => api.patch(`/users/${username}/roles`, { roles }),
  getUsersByRole: (role) => {
    const token = localStorage.getItem('token');
    const encodedRole = encodeURIComponent(role);
    console.log('Fetching users for role:', role);
    console.log('Auth token present:', !!token);
    
    return api.get(`/users/role/${encodedRole}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        console.log('Users by role response:', response);
        return response.data;
      })
      .catch(error => {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url,
          headers: error.config?.headers
        });
        
        if (error.response?.status === 401) {
          toast.error('Authentication required. Please log in again.');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to view users with this role.');
        }
        
        throw error;
      });
  },
  getAvailableRoles: () => {
    return api.get('/users/role')
      .then(response => {
        console.log('Available roles response:', response);
        return response.data;
      })
      .catch(error => {
        console.error('Error fetching roles:', error);
        throw error;
      });
  }
};

export const authApi = {
  login: (credentials) => {
    console.log('Attempting login with:', { ...credentials, password: '***' });
    return api.post('/auth/login', credentials)
      .then(response => {
        console.log('Login response:', response);
        return response;
      })
      .catch(error => {
        console.error('Login error:', error);
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  },
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.post('/auth/verify', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', {
    token,
    newPassword: password
  }),
  testEmail: (email) => api.post(`/auth/test-email?email=${email}`),
  getCurrentUser: () => api.get('/users/me'),
  logout: () => {
    const token = localStorage.getItem('token');
    return api.post('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getSecurityEvents: (hours = 24, severity = '') => {
    const params = new URLSearchParams({
      hours: hours.toString(),
      ...(severity && { severity })
    });
    return api.get(`/dashboard/security-events?${params}`);
  },
  getActivityHeatmap: (days = 7) => api.get(`/dashboard/activity-heatmap?days=${days}`),
  getGeographicDistribution: (days = 7) => api.get(`/dashboard/geographic-distribution?days=${days}`),
  performBackup: () => api.post('/dashboard/backup'),
  clearCache: () => api.post('/dashboard/cache/clear'),
  restartServer: () => api.post('/dashboard/restart'),
  getUserDashboardOverview: () => api.get('/user-dashboard/overview'),
  getUserSecurityStatus: () => api.get('/user-dashboard/security-status'),
  getUserActivity: (startDate, endDate, limit = 10) => {
    const params = new URLSearchParams({
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
      limit: limit.toString()
    });
    return api.get(`/user-dashboard/activity?${params}`);
  },
  getUserActiveSessions: () => api.get('/user-dashboard/active-sessions'),
  getSecurityRecommendations: () => api.get('/user-dashboard/security-recommendations')
};

export const auditApi = {
  getRecentLogs: (limit = 10) => api.get(`/audit/recent?limit=${limit}`),
  searchLogs: (params) => {
    const searchParams = new URLSearchParams({
      limit: params.limit?.toString() || '10',
      ...(params.username && { username: params.username }),
      ...(params.action && { action: params.action }),
      ...(params.entityType && { entityType: params.entityType }),
      ...(params.ipAddress && { ipAddress: params.ipAddress }),
      ...(params.startDate && { startDate: params.startDate.toISOString() }),
      ...(params.endDate && { endDate: params.endDate.toISOString() })
    });
    return api.get(`/audit/search?${searchParams}`);
  },
  getUserActivitySummary: (username, since) => {
    const params = new URLSearchParams({
      ...(since && { since: since.toISOString() })
    });
    return api.get(`/audit/user/${username}/activity-summary?${params}`);
  }
};

// Export the critical endpoints with retry functionality
export const criticalApi = {
  getStats: withRetry(dashboardApi.getStats),
  getCurrentUser: withRetry(authApi.getCurrentUser)
};