import { api } from './api';

const AUDIT_BASE_URL = '/audit';

export const auditService = {
  // Get recent audit logs with pagination
  getRecentAuditLogs: async ({ page, size = 10 }) => {
    try {
      const response = await api.get(`${AUDIT_BASE_URL}/recent?limit=${size}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent logs:', error);
      throw error;
    }
  },

  // Get audit statistics
  getAuditStatistics: async () => {
    try {
      // Default to last 24 hours if not specified
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const response = await api.get(`${AUDIT_BASE_URL}/statistics?since=${since}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit statistics:', error);
      throw error;
    }
  },

  // Get failed login attempts
  getFailedLoginAttempts: async (limit = 10) => {
    try {
      const response = await api.get(`${AUDIT_BASE_URL}/failed-logins?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch failed login attempts:', error);
      throw error;
    }
  },

  // Get suspicious activities
  getSuspiciousActivities: async () => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const response = await api.get(`${AUDIT_BASE_URL}/suspicious?since=${since}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch suspicious activities:', error);
      throw error;
    }
  },

  // Get recent failed login attempts by user
  getRecentFailedLoginAttempts: async () => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const response = await api.get(`${AUDIT_BASE_URL}/failed-login-attempts?since=${since}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent failed login attempts:', error);
      throw error;
    }
  },

  // Search audit logs
  searchAuditLogs: async ({
    username,
    action,
    entityType,
    ipAddress,
    startDate,
    endDate,
    limit = 10
  }) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      if (username) params.append('username', username);
      if (action) params.append('action', action);
      if (entityType) params.append('entityType', entityType);
      if (ipAddress) params.append('ipAddress', ipAddress);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await api.get(`${AUDIT_BASE_URL}/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search audit logs:', error);
      throw error;
    }
  },

  // Get user activity summary
  getUserActivitySummary: async (username, since) => {
    try {
      const params = new URLSearchParams();
      if (since) params.append('since', since.toISOString());
      
      const response = await api.get(`${AUDIT_BASE_URL}/user/${username}/activity-summary?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user activity summary:', error);
      throw error;
    }
  },

  // Get IP address activity
  getIpAddressActivity: async (limit = 10) => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const response = await api.get(`${AUDIT_BASE_URL}/ip-activity?since=${since}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch IP address activity:', error);
      throw error;
    }
  },

  // Get action trends
  getActionTrends: async () => {
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await api.get(`${AUDIT_BASE_URL}/action-trends?since=${since}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch action trends:', error);
      throw error;
    }
  }
}; 