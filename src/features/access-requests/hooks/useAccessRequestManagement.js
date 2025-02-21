import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { accessRequestService } from '../../../services/accessRequestService';
import { toast } from 'react-toastify';
import { checkBackendConnection } from '../../../services/api';

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 300;

export const useAccessRequestManagement = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  const isMounted = useRef(true);
  const abortController = useRef(null);
  const fetchInProgress = useRef(false);
  const debouncedFetchTimeout = useRef(null);

  // Check backend connection
  const checkConnection = useCallback(async () => {
    try {
      const connected = await checkBackendConnection();
      if (isMounted.current) {
        setIsConnected(connected);
        if (!connected) {
          setError('Unable to connect to the server');
          setLoading(false);
        }
      }
      return connected;
    } catch (err) {
      console.error('Connection check error:', err);
      if (isMounted.current) {
        setIsConnected(false);
        setError('Unable to connect to the server');
        setLoading(false);
      }
      return false;
    }
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

  const fetchRequests = useCallback(async (page = 0, sort = '', force = false) => {
    console.log('fetchRequests called:', { page, sort, force, isMounted: isMounted.current, fetchInProgress: fetchInProgress.current });
    
    if (!isMounted.current) {
      console.log('Component not mounted, skipping fetch');
      return;
    }

    if (fetchInProgress.current && !force) {
      console.log('Fetch in progress and not forced, skipping');
      return;
    }

    // Cancel any pending requests
    cancelCurrentRequest();
    
    // Create new abort controller
    abortController.current = new AbortController();
    fetchInProgress.current = true;

    try {
      setLoading(true);
      setError(null);

      // Check backend connection first
      const isConnected = await checkConnection();
      if (!isConnected) {
        console.log('Backend not connected, skipping fetch');
        fetchInProgress.current = false;
        return;
      }

      console.log('Fetching access requests...');
      const response = await accessRequestService.getRequestsByStatus('PENDING', page, PAGE_SIZE);

      console.log('Access requests response:', response);

      if (isMounted.current && response?.data) {
        setRequests(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(page);
        setError(null);
        console.log('Updated access requests state:', {
          content: response.data.content?.length,
          totalPages: response.data.totalPages,
          currentPage: page
        });
      }
    } catch (err) {
      console.error('Access request fetch error:', {
        name: err.name,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      if (isMounted.current && err.name !== 'AbortError') {
        let errorMessage = 'Failed to fetch access requests';
        if (err.response?.status === 404) {
          errorMessage = 'No access requests found';
          setRequests([]);
          setTotalPages(0);
        } else if (err.response?.status === 403) {
          errorMessage = 'You do not have permission to view access requests';
        } else if (err.response?.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
          // Redirect to login if needed
          window.location.href = '/login';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        fetchInProgress.current = false;
      }
    }
  }, [cancelCurrentRequest, checkConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      cancelCurrentRequest();
    };
  }, [cancelCurrentRequest]);

  // Initial fetch
  useEffect(() => {
    fetchRequests(0, '', true);
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    currentPage,
    totalPages,
    isConnected,
    fetchRequests,
    setCurrentPage
  };
}; 