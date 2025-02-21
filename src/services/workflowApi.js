import { api } from './api';
import { rateLimitManager } from '../utils/rateLimiting';

// Cache configuration
const CACHE_DURATION = 60000; // 1 minute
const cache = new Map();

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Rate limiting configuration
const RATE_LIMIT_RESET_TIME = 60000; // 1 minute
const requestCounts = new Map();
const MAX_REQUESTS_PER_MINUTE = 30;

const checkRateLimit = (endpoint) => {
  const now = Date.now();
  const count = requestCounts.get(endpoint) || { count: 0, timestamp: now };
  
  if (now - count.timestamp >= RATE_LIMIT_RESET_TIME) {
    count.count = 1;
    count.timestamp = now;
  } else if (count.count >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded. Please try again later.');
  } else {
    count.count++;
  }
  
  requestCounts.set(endpoint, count);
};

export const workflowApi = {
  // Workflow Management
  getAllWorkflows: async (page = 0, size = 10) => {
    const cacheKey = `workflows_${page}_${size}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    return rateLimitManager.executeWithRateLimit(
      'getAllWorkflows',
      async () => {
        const response = await api.get(`/workflows?page=${page}&size=${size}`);
        console.log('Raw workflow response:', response);
        
        // Handle both array and paginated response formats
        let content = [];
        let totalElements = 0;
        let totalPages = 0;

        if (response.data) {
          if (Array.isArray(response.data)) {
            content = response.data;
            totalElements = content.length;
            totalPages = Math.ceil(totalElements / size);
          } else if (response.data.content) {
            content = response.data.content;
            totalElements = response.data.totalElements || content.length;
            totalPages = response.data.totalPages || Math.ceil(totalElements / size);
          }
        }

        const formattedResponse = {
          data: {
            content,
            totalPages,
            totalElements,
            size,
            number: page
          }
        };

        console.log('Formatted workflow response:', formattedResponse);
        setCachedData(cacheKey, formattedResponse);
        return formattedResponse;
      },
      {
        cooldown: 2000,
        onError: (error) => {
          console.error('Error fetching workflows:', error);
        }
      }
    );
  },
  
  getWorkflowById: (id) => 
    api.get(`/workflows/${id}`),
  
  createWorkflow: (workflowData) => {
    // Validate workflow data structure
    if (!workflowData.name || !workflowData.type || !workflowData.steps || !Array.isArray(workflowData.steps)) {
      return Promise.reject(new Error('Invalid workflow data structure'));
    }

    // Format the workflow data to match ApprovalWorkflowDTO
    const formattedWorkflow = {
      name: workflowData.name,
      description: workflowData.description || '',
      type: workflowData.type,
      active: true,
      steps: workflowData.steps.map((step, index) => ({
        stepOrder: step.stepOrder || index + 1,
        name: step.name,
        description: step.description || '',
        approvalThreshold: workflowData.type === 'PERCENTAGE_APPROVAL' ? step.approvalThreshold : null,
        approverIds: Array.isArray(step.approverIds) ? step.approverIds : [step.approverIds],
        active: true
      }))
    };

    // Debug logs for request data
    console.log('Debug - Formatted workflow data:', formattedWorkflow);
    
    return api.post('/workflows', formattedWorkflow)
      .catch(error => {
        // Handle specific error cases
        if (error.response) {
          const { status, data } = error.response;
          
          switch (status) {
            case 400:
              throw new Error(data.message || 'Invalid workflow data. Please check all required fields.');
            case 401:
              throw new Error('You are not authorized to create workflows.');
            case 403:
              throw new Error('You do not have permission to create workflows.');
            case 409:
              throw new Error('A workflow with this name already exists.');
            default:
              throw new Error('Failed to create workflow. Please try again.');
          }
        }
        
        console.error('Workflow creation error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      });
  },
  
  updateWorkflow: (id, workflowData) => 
    api.put(`/workflows/${id}`, workflowData),
  
  deleteWorkflow: (id) => 
    api.delete(`/workflows/${id}`),
  
  getWorkflowsByType: (type, page = 0, size = 10) => 
    api.get(`/workflows/type/${type}?page=${page}&size=${size}`),

  // Workflow Steps
  addWorkflowStep: (workflowId, stepData) => {
    const formattedStep = {
      stepOrder: stepData.stepOrder,
      name: stepData.name,
      description: stepData.description,
      approvalThreshold: stepData.approvalThreshold,
      approverIds: Array.isArray(stepData.approverIds) ? stepData.approverIds : [stepData.approverIds],
      active: true
    };

    return api.post(`/workflows/${workflowId}/steps`, formattedStep);
  },
  
  updateWorkflowStep: (workflowId, stepId, stepData) => 
    api.put(`/workflows/${workflowId}/steps/${stepId}`, stepData),
  
  deleteWorkflowStep: (workflowId, stepId) => 
    api.delete(`/workflows/${workflowId}/steps/${stepId}`),
  
  reorderWorkflowSteps: (workflowId, stepOrder) => 
    api.put(`/workflows/${workflowId}/steps/reorder`, stepOrder),

  // Workflow Assignment
  assignWorkflow: (assignmentData) => {
    const { resourceId, workflowId, active = true } = assignmentData;
    const params = new URLSearchParams({
      resourceId: resourceId.toString(),
      workflowId: workflowId.toString(),
      active: active.toString()
    });
    return api.post(`/workflows/assign?${params}`);
  },
  
  removeWorkflowAssignment: (resourceId) => 
    api.delete(`/workflows/assign?resourceId=${resourceId}`),

  // Admin Dashboard
  getAdminDashboard: () =>
    api.get('/workflow-dashboard/admin'),

  getAdminPendingRequests: (params = {}) =>
    api.get('/workflow-dashboard/admin/pending-requests', { params }),

  getAdminAllRequests: (filters = {}) =>
    api.get('/workflow-dashboard/admin/all-requests', { params: filters }),

  getAdminActivities: () =>
    api.get('/workflow-dashboard/admin/activities'),

  // User Dashboard
  getUserDashboard: () =>
    api.get('/workflow-dashboard/user'),

  getUserRequests: (params = {}) =>
    api.get('/workflow-dashboard/user/my-requests', { params }),

  getUserPendingApprovals: (params = {}) =>
    api.get('/workflow-dashboard/user/pending-approvals', { params }),

  getUserActivities: () =>
    api.get('/workflow-dashboard/user/activities'),

  // Request Detail Endpoints
  getRequestDetails: (requestId) =>
    api.get(`/workflow-dashboard/requests/${requestId}`),

  getRequestActivities: (requestId) =>
    api.get(`/workflow-dashboard/requests/${requestId}/activities`),

  // Step Execution
  approveStep: (stepExecutionId, data) => 
    api.post(`/workflows/steps/${stepExecutionId}/approve`, data),
  
  rejectStep: (stepExecutionId, data) => 
    api.post(`/access-requests/${stepExecutionId}/reject`, data),
  
  requestStepChanges: (stepExecutionId, data) => 
    api.post(`/workflows/steps/${stepExecutionId}/request-changes`, data),
  
  checkCanApprove: (stepExecutionId) => 
    api.get(`/workflows/steps/${stepExecutionId}/can-approve`),

  // Dashboard Data with optimized batch fetching
  getDashboardData: async (isAdmin = false) => {
    const cacheKey = `dashboard-data-${isAdmin}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const baseUrl = isAdmin ? '/workflow-dashboard/admin' : '/workflow-dashboard/user';
      checkRateLimit(baseUrl);

      // Fetch stats and activities first
      const [stats, activities] = await Promise.all([
        api.get(`${baseUrl}/stats`),
        api.get(`${baseUrl}/activities`)
      ]);

      // Fetch pending requests with details
      const pendingRequestsResponse = await api.get(
        isAdmin ? `${baseUrl}/pending-requests` : `${baseUrl}/pending-approvals`,
        { 
          params: { 
            includeDetails: true,
            includeResource: true,
            includePermission: true,
            includeWorkflow: true
          } 
        }
      );
      
      const response = {
        data: {
          stats: stats.data,
          pendingRequests: pendingRequestsResponse.data,
          activities: activities.data
        }
      };

      setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
      }
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Add batch fetching method
  getBatchData: async (page = 0, size = 20) => {
    const cacheKey = `batch-data-${page}-${size}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      checkRateLimit('/workflows/batch');
      const response = await Promise.all([
        api.get('/workflows', { params: { page, size } }),
        api.get('/resources', { params: { page, size } }),
        api.get('/workflow-dashboard/stats')
      ]);

      const [workflows, resources, stats] = response;
      const batchData = {
        workflows: workflows.data,
        resources: resources.data,
        stats: stats.data
      };

      setCachedData(cacheKey, { data: batchData });
      return { data: batchData };
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 60;
        throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
      }
      console.error('Error fetching batch data:', error);
      throw error;
    }
  },
}; 