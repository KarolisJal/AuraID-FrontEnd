// src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

export const API_BASE_URL = 'http://localhost:8080/api/v1';

const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for JWT token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('Making request:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      // If the response has data property, return it directly
      return response.data ? response : { data: response };
    },
    (error) => {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        headers: error.config?.headers
      });
      
      if (!error.response) {
        toast.error('Network error. Please check your internet connection.');
        return Promise.reject(new Error('Network error'));
      }

      // Handle different error status codes
      switch (error.response.status) {
        case 400:
          toast.error(error.response.data?.message || 'Bad request');
          break;
        case 401:
          console.error('Authentication error:', error.response.data);
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          console.error('Authorization error:', error.response.data);
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          console.error('Not found error:', error.response.data);
          toast.error('Resource not found');
          break;
        case 422:
          console.error('Validation error:', error.response.data);
          toast.error(error.response.data?.message || 'Validation error');
          break;
        case 500:
          console.error('Server error:', error.response.data);
          toast.error('Internal server error. Please try again later.');
          break;
        default:
          console.error('Unexpected error:', error.response?.data);
          toast.error('An unexpected error occurred');
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance(API_BASE_URL);

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

// Authentication related endpoints
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
};

// User management endpoints
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
      .then(response => {
        // Return the response data directly, don't throw error for unavailable
        return response.data;
      });
  },
  checkEmail: (email) => {
    const encodedEmail = encodeURIComponent(email);
    return api.get(`/users/check-email/${encodedEmail}`)
      .then(response => {
        // Return the response data directly, don't throw error for unavailable
        return response.data;
      });
  },
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (username, data) => api.post(`/users/${username}/change-password`, data),
  updateUserRoles: (username, roles) => 
    api.patch(`/users/${username}/roles`, { roles }),
};

// Dashboard related endpoints
export const dashboardApi = {
  // Admin endpoints
  getStats: () => api.get('/dashboard/stats'),
  getSecurityEvents: (hours = 24, severity = '') => {
    const params = new URLSearchParams({
      hours: hours.toString(),
      ...(severity && { severity })
    });
    return api.get(`/dashboard/security-events?${params}`);
  },
  getActivityHeatmap: (days = 7) => 
    api.get(`/dashboard/activity-heatmap?days=${days}`),
  getGeographicDistribution: (days = 7) => 
    api.get(`/dashboard/geographic-distribution?days=${days}`),
  performBackup: () => api.post('/dashboard/backup'),
  clearCache: () => api.post('/dashboard/cache/clear'),
  restartServer: () => api.post('/dashboard/restart'),

  // User dashboard endpoints
  getUserDashboardOverview: () => 
    api.get('/user-dashboard/overview'),
  getUserSecurityStatus: () => 
    api.get('/user-dashboard/security-status'),
  getUserActivity: (startDate, endDate, limit = 10) => {
    const params = new URLSearchParams({
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
      limit: limit.toString()
    });
    return api.get(`/user-dashboard/activity?${params}`);
  },
  getUserActiveSessions: () => 
    api.get('/user-dashboard/active-sessions'),
  getSecurityRecommendations: () => 
    api.get('/user-dashboard/security-recommendations')
};

// Audit related endpoints
export const auditApi = {
  getRecentLogs: (limit = 10) => 
    api.get(`/audit/recent?limit=${limit}`),
  
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

// Critical endpoints with retry functionality
export const criticalApi = {
  getStats: withRetry(dashboardApi.getStats),
  getCurrentUser: withRetry(authApi.getCurrentUser)
};

export default api;