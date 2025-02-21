import { useState, useCallback, useEffect, useRef } from 'react';
import { workflowApi } from '../../../services/workflowApi';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { useDashboard } from '../../../contexts/DashboardContext';
import { apiCache } from '../../../utils/apiCache';
import { checkBackendConnection } from '../../../services/api';

const CACHE_KEY = '/workflows';
const CACHE_TTL = 300000; // 5 minutes
const DEBOUNCE_DELAY = 300; // Reduced from 500ms to 300ms
const COOLDOWN_DELAY = 1000; // Reduced from 2000ms to 1000ms
const PAGE_SIZE = 20; // Increased from 10 to 20 for better performance

// Add cache key helpers
const getCacheKeyWithParams = (page, sort) => `${CACHE_KEY}-${page}-${sort}`;
const getStepCacheKey = (workflowId) => `${CACHE_KEY}-steps-${workflowId}`;

export const useWorkflowManagement = () => {
  const { user } = useAuth();
  const { dashboardData, fetchDashboardData } = useDashboard();
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  const isMounted = useRef(true);
  const abortController = useRef(null);
  const fetchInProgress = useRef(false);
  const debouncedFetchTimeout = useRef(null);

  // Initialize AbortController
  useEffect(() => {
    isMounted.current = true;
    abortController.current = new AbortController();
    
    // Initial fetch
    if (isMounted.current) {
      fetchWorkflows(0);
    }
    
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
      if (debouncedFetchTimeout.current) {
        clearTimeout(debouncedFetchTimeout.current);
      }
    };
  }, []); // Remove fetchWorkflows from dependencies

  // Check backend connection
  const checkConnection = useCallback(async () => {
    const connected = await checkBackendConnection();
    if (isMounted.current) {
      setIsConnected(connected);
    }
    return connected;
  }, []);

  const cancelCurrentRequest = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    if (debouncedFetchTimeout.current) {
      clearTimeout(debouncedFetchTimeout.current);
      debouncedFetchTimeout.current = null;
    }
  }, []);

  // Subscribe to cache invalidation
  useEffect(() => {
    const unsubscribe = apiCache.subscribe(CACHE_KEY, (event) => {
      if (event === 'invalidate' || event === 'stale') {
        setLastFetchTimestamp(0); // Reset cooldown to allow immediate fetch
      }
    });
    return () => unsubscribe();
  }, []);

  // Optimize the fetchWorkflows function
  const fetchWorkflows = useCallback(async (page = 0, sort = '', force = false) => {
    console.log('fetchWorkflows called with:', { page, sort, force });

    if (!isMounted.current || (fetchInProgress.current && !force)) {
      console.log('Skipping fetch - component unmounted or fetch in progress');
      return;
    }

    // Cancel previous request if it exists
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    fetchInProgress.current = true;
    
    try {
      console.log('Starting workflow fetch...');
      setLoading(true);
      setError(null);

      const response = await workflowApi.getAllWorkflows(page, PAGE_SIZE, {
        signal: abortController.current?.signal,
        sort
      });

      console.log('Workflow fetch response:', response);

      if (isMounted.current) {
        if (response?.data?.content) {
          setWorkflows(response.data.content);
          setTotalPages(response.data.totalPages || 0);
          setCurrentPage(page);
          console.log('Workflows updated:', {
            contentLength: response.data.content.length,
            totalPages: response.data.totalPages,
            currentPage: page
          });
        } else {
          console.warn('Response data is missing content:', response.data);
          setWorkflows([]);
          setTotalPages(0);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        console.log('Request was canceled');
        return;
      }

      console.error('Workflow fetch detailed error:', {
        name: err.name,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack
      });
      
      if (isMounted.current) {
        let errorMessage = 'Failed to fetch workflows';
        if (err.response?.status === 404) {
          errorMessage = 'No workflows found';
        } else if (err.response?.status === 403) {
          errorMessage = 'You do not have permission to view workflows';
        }
        
        setError(errorMessage);
        setWorkflows([]);
        setTotalPages(0);
        
        toast.error(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        fetchInProgress.current = false;
        console.log('Fetch completed, states reset');
      }
      if (abortController.current) {
        abortController.current = null;
      }
    }
  }, []);

  // Optimize executeStepAction to avoid unnecessary refetches
  const executeStepAction = useCallback(async (stepExecutionId, action, data = {}) => {
    if (!isMounted.current) return;

    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'approve':
          response = await workflowApi.approveStep(stepExecutionId, data);
          if (isMounted.current) {
            toast.success('Step approved successfully');
            // Only invalidate relevant cache keys
            apiCache.invalidate(getStepCacheKey(selectedWorkflow?.id));
            apiCache.invalidate(getCacheKeyWithParams(currentPage, ''));
            await Promise.all([
              fetchDashboardData(false),
              fetchWorkflows(currentPage, '', false)
            ]);
          }
          break;
        case 'reject':
          response = await workflowApi.rejectStep(stepExecutionId, data);
          if (isMounted.current) {
            toast.success('Step rejected');
            apiCache.invalidate(getStepCacheKey(selectedWorkflow?.id));
            apiCache.invalidate(getCacheKeyWithParams(currentPage, ''));
            await Promise.all([
              fetchDashboardData(false),
              fetchWorkflows(currentPage, '', false)
            ]);
          }
          break;
        case 'request-changes':
          response = await workflowApi.requestStepChanges(stepExecutionId, data);
          if (isMounted.current) {
            toast.success('Changes requested');
            apiCache.invalidate(getStepCacheKey(selectedWorkflow?.id));
            apiCache.invalidate(getCacheKeyWithParams(currentPage, ''));
            await Promise.all([
              fetchDashboardData(false),
              fetchWorkflows(currentPage, '', false)
            ]);
          }
          break;
        default:
          throw new Error('Invalid step action');
      }
      return response;
    } catch (err) {
      if (isMounted.current) {
        console.error(`Failed to ${action} step:`, err);
        toast.error(`Failed to ${action} step`);
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [fetchDashboardData, fetchWorkflows, currentPage, selectedWorkflow]);

  // Add deleteWorkflow function
  const deleteWorkflow = useCallback(async (id) => {
    if (!isMounted.current) return;

    setLoading(true);
    try {
      await workflowApi.deleteWorkflow(id);
      
      // Invalidate caches
      apiCache.invalidate(CACHE_KEY);
      apiCache.invalidate(`${CACHE_KEY}/${id}`);
      
      // Refresh data
      await Promise.all([
        fetchDashboardData(true),
        fetchWorkflows(currentPage, '', true)
      ]);
      
      toast.success('Workflow deleted successfully');
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      toast.error('Failed to delete workflow');
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [currentPage, fetchDashboardData, fetchWorkflows]);

  // Add createWorkflow function
  const createWorkflow = useCallback(async (workflowData) => {
    if (!isMounted.current) return;

    setLoading(true);
    try {
      const response = await workflowApi.createWorkflow(workflowData);
      
      // Invalidate caches
      apiCache.invalidate(CACHE_KEY);
      
      // Refresh data
      await Promise.all([
        fetchDashboardData(true),
        fetchWorkflows(currentPage, '', true)
      ]);
      
      toast.success('Workflow created successfully');
      return response;
    } catch (err) {
      console.error('Failed to create workflow:', err);
      toast.error('Failed to create workflow');
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [currentPage, fetchDashboardData, fetchWorkflows]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      cancelCurrentRequest();
    };
  }, [cancelCurrentRequest]);

  return {
    workflows,
    selectedWorkflow,
    loading,
    error,
    currentPage,
    totalPages,
    dashboardData,
    setSelectedWorkflow,
    fetchWorkflows,
    executeStepAction,
    isConnected,
    setCurrentPage,
    deleteWorkflow,
    createWorkflow
  };
}; 