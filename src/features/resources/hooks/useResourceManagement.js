import { useState, useCallback, useEffect, useRef } from 'react';
import { resourceApi, ResourceType } from '../../../services/resourceApi';
import { toast } from 'react-toastify';
import { apiCache } from '../../../utils/apiCache';
import { useAuth } from '../../../contexts/AuthContext';
import { checkBackendConnection } from '../../../services/api';
import { workflowApi } from '../../../services/workflowApi';

// Validation constants
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;
const CACHE_KEY = '/resources';
const CACHE_TTL = 300000; // Increase to 5 minutes
const DEBOUNCE_DELAY = 300; // Add debounce delay
const COOLDOWN_DELAY = 2000; // Add cooldown delay constant
const PAGE_SIZE = 10;

// Define which fields are required for each resource type
const REQUIRED_FIELDS = {
  [ResourceType.APPLICATION]: ['url'],
  [ResourceType.FOLDER]: ['path'],
  [ResourceType.SYSTEM]: ['systemId'],
  [ResourceType.DATABASE]: ['connectionString'],
  [ResourceType.API]: ['endpoint'],
  [ResourceType.NETWORK_RESOURCE]: ['location']
};

export const useResourceManagement = () => {
  const { user } = useAuth();
  
  // State declarations (must come before any other hooks)
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedResource, setSelectedResource] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState(0);

  // Refs (must come after useState)
  const isMounted = useRef(true);
  const abortController = useRef(null);
  const fetchInProgress = useRef(false);
  const debouncedFetchTimeout = useRef(null);

  // Validation function
  const validateResourceData = useCallback((data) => {
    if (!data) {
      throw new Error('Resource data is required');
    }

    // Validate required fields
    if (!data.name) {
      throw new Error('Resource name is required');
    }

    if (data.name.length < NAME_MIN_LENGTH || data.name.length > NAME_MAX_LENGTH) {
      throw new Error(`Resource name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`);
    }

    if (data.description && data.description.length > DESCRIPTION_MAX_LENGTH) {
      throw new Error(`Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`);
    }

    if (!data.type || !Object.values(ResourceType).includes(data.type)) {
      throw new Error('Invalid resource type');
    }

    // Validate type-specific required fields
    const requiredFields = REQUIRED_FIELDS[data.type] || [];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required for ${data.type} resources`);
      }
    }

    return true;
  }, []);

  // Check backend connection (define before it's used)
  const checkConnection = useCallback(async () => {
    const connected = await checkBackendConnection();
    if (isMounted.current) {
      setIsConnected(connected);
    }
    return connected;
  }, []);

  // Cancel request helper
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

  // Main fetch function
  const fetchResources = useCallback(async (page = 0, sort = '', force = false) => {
    if (!isMounted.current || (fetchInProgress.current && !force)) {
      console.log('Skipping resource fetch - component unmounted or fetch in progress');
      return;
    }

    // Cancel previous request if it exists
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    fetchInProgress.current = true;

    try {
      setLoading(true);
      setError(null);

      const response = await resourceApi.getAllResources(page, PAGE_SIZE, {
        signal: abortController.current?.signal,
        sort
      });

      if (isMounted.current) {
        if (response?.data?.content) {
          setResources(response.data.content);
          setTotalPages(response.data.totalPages || 0);
          setCurrentPage(page);
        } else {
          console.warn('Response data is missing content:', response.data);
          setResources([]);
          setTotalPages(0);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        console.log('Resource request was canceled');
        return;
      }

      console.error('Resource fetch error:', err);
      
      if (isMounted.current) {
        let errorMessage = 'Failed to fetch resources';
        if (err.response?.status === 404) {
          errorMessage = 'No resources found';
        } else if (err.response?.status === 403) {
          errorMessage = 'You do not have permission to view resources';
        }
        
        setError(errorMessage);
        setResources([]);
        setTotalPages(0);
        
        toast.error(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        fetchInProgress.current = false;
      }
      if (abortController.current) {
        abortController.current = null;
      }
    }
  }, []);

  // Effects (must come after all hooks)
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    console.log('Initial data load effect triggered');
    fetchResources(0, '', true);
  }, [fetchResources]);

  useEffect(() => {
    const unsubscribe = apiCache.subscribe(CACHE_KEY, (event) => {
      if (event === 'invalidate' || event === 'stale') {
        cancelCurrentRequest();
      }
    });
    return () => unsubscribe();
  }, [cancelCurrentRequest]);

  // Get a single resource by ID with caching
  const getResourceById = useCallback(async (id) => {
    const cacheKey = `${CACHE_KEY}/${id}`;
    const cachedResource = apiCache.get(cacheKey);
    if (cachedResource) {
      return cachedResource;
    }

    setLoading(true);
    try {
      const response = await resourceApi.getResourceById(id);
      const resource = response.data;
      
      // Cache the resource
      apiCache.set(cacheKey, resource, {}, CACHE_TTL);
      return resource;
    } catch (err) {
      toast.error('Failed to fetch resource details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch resources by type
  const fetchResourcesByType = useCallback(async (type, page = 0, sort = '') => {
    const now = Date.now();
    if (now - lastFetchTimestamp < COOLDOWN_DELAY) {
      return;
    }

    if (!isMounted.current || fetchInProgress.current) return;

    // Clear any existing debounced fetch
    if (debouncedFetchTimeout.current) {
      clearTimeout(debouncedFetchTimeout.current);
    }

    setLastFetchTimestamp(now);
    
    // Set up debounced fetch
    debouncedFetchTimeout.current = setTimeout(async () => {
      try {
        fetchInProgress.current = true;
        setLoading(true);
        setError(null);

        // Cancel any existing request
        cancelCurrentRequest();
        
        // Create new abort controller
        abortController.current = new AbortController();

        const params = {
          type,
          page,
          size: PAGE_SIZE,
          ...(sort && { sort })
        };

        const response = await resourceApi.getResourcesByType(params, {
          signal: abortController.current?.signal
        });

        if (isMounted.current) {
          const data = response?.data;
          if (data?.content) {
            setResources(data.content);
            setTotalPages(data.totalPages || 0);
            setCurrentPage(page);
          } else if (Array.isArray(data)) {
            setResources(data);
            setTotalPages(1);
            setCurrentPage(0);
          } else {
            setResources([]);
            setTotalPages(0);
            setCurrentPage(0);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted.current && err.name !== 'AbortError') {
          console.error('Resource fetch by type error:', err);
          setResources([]);
          setTotalPages(0);
          setError(`Failed to fetch ${type} resources`);
          if (err.response?.status !== 404) {
            toast.error(`Error loading ${type} resources`);
          }
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          fetchInProgress.current = false;
        }
      }
    }, DEBOUNCE_DELAY);
  }, [lastFetchTimestamp, cancelCurrentRequest]);

  // Fetch resources by creator
  const fetchResourcesByCreator = useCallback(async (creatorId, page = 0, sort = '') => {
    const now = Date.now();
    if (now - lastFetchTimestamp < 2000) {
      return;
    }
    
    setLastFetchTimestamp(now);
    setLoading(true);
    try {
      const response = await resourceApi.getResourcesByCreator(creatorId, page, 10, sort);
      const data = response?.data;
      
      if (data?.content) {
        setResources(data.content);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(page);
      } else if (Array.isArray(data)) {
        setResources(data);
        setTotalPages(1);
        setCurrentPage(0);
      } else {
        setResources([]);
        setTotalPages(0);
        setCurrentPage(0);
      }
      setError(null);
    } catch (err) {
      console.error('Resource fetch by creator error:', err);
      setResources([]);
      setError('Failed to fetch resources');
      toast.error('Error loading resources');
    } finally {
      setLoading(false);
    }
  }, [lastFetchTimestamp]);

  // Handle sorting
  const handleSort = useCallback((sortField) => {
    const newSortConfig = sortField ? `${sortField},asc` : '';
    fetchResources(currentPage, newSortConfig, true);
  }, [currentPage, fetchResources]);

  // Create new resource
  const createResource = useCallback(async (resourceData) => {
    setLoading(true);
    try {
      console.log('Validating resource data:', resourceData);
      validateResourceData(resourceData);

      // Check if resource with same name exists
      try {
        console.log('Checking if name exists:', resourceData.name);
        const nameExists = await resourceApi.checkNameExists(resourceData.name);
        console.log('Name exists check result:', nameExists);
        if (nameExists) {
          throw new Error('A resource with this name already exists');
        }
      } catch (err) {
        console.error('Name check error details:', {
          error: err,
          response: err.response?.data,
          status: err.response?.status,
          message: err.message
        });
        if (err.message === 'A resource with this name already exists') {
          throw err;
        }
        console.warn('Name existence check failed:', err);
      }

      // Extract workflowId before sending resource data
      const { workflowId, ...resourceCreateData } = resourceData;
      console.log('Sending resource create request with data:', resourceCreateData);

      // Create the resource
      const response = await resourceApi.createResource(resourceCreateData);
      console.log('Resource creation response:', response);
      
      // Handle workflow assignment if workflowId is provided
      if (workflowId && response?.data?.id) {
        try {
          await workflowApi.assignWorkflow({ 
            resourceId: response.data.id, 
            workflowId 
          });
        } catch (workflowErr) {
          console.error('Failed to assign workflow:', workflowErr);
          toast.error('Resource created but workflow assignment failed');
          // Don't throw here as the resource was created successfully
        }
      }
      
      // Invalidate cache and refresh data
      apiCache.invalidate(CACHE_KEY);
      await fetchResources(0, '', true);
      
      toast.success('Resource created successfully');
      return response;
    } catch (err) {
      console.error('Failed to create resource:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create resource';
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateResourceData, fetchResources]);

  // Update existing resource
  const updateResource = useCallback(async (id, resourceData) => {
    setLoading(true);
    try {
      validateResourceData(resourceData);
      
      console.log('Updating resource:', { id, resourceData }); // Add debug log
      
      // Extract workflowId before sending resource data
      const { workflowId, ...resourceUpdateData } = resourceData;
      
      // Update the resource
      const response = await resourceApi.updateResource(id, resourceUpdateData);
      
      // Handle workflow assignment
      try {
        if (workflowId) {
          console.log('Assigning workflow:', { resourceId: id, workflowId }); // Add debug log
          await workflowApi.assignWorkflow({
            resourceId: parseInt(id, 10), // Ensure resourceId is a number
            workflowId: parseInt(workflowId, 10), // Ensure workflowId is a number
            active: true
          });
        } else {
          // If no workflow ID is provided, remove any existing workflow assignment
          console.log('Removing workflow assignment for resource:', id); // Add debug log
          await workflowApi.removeWorkflowAssignment(parseInt(id, 10)); // Ensure id is a number
        }
      } catch (workflowErr) {
        console.error('Failed to manage workflow assignment:', workflowErr);
        console.error('Error details:', {
          status: workflowErr.response?.status,
          data: workflowErr.response?.data,
          message: workflowErr.message
        });
        // Don't throw the error, just show a toast
        toast.error('Resource updated but workflow assignment failed. Please try again.');
      }
      
      // Invalidate caches
      apiCache.invalidate(CACHE_KEY);
      apiCache.invalidate(`${CACHE_KEY}/${id}`);
      await fetchResources(currentPage, '', true);
      
      toast.success('Resource updated successfully');
      return response;
    } catch (err) {
      console.error('Failed to update resource:', err);
      toast.error('Failed to update resource');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [validateResourceData, fetchResources, currentPage]);

  // Delete resource
  const deleteResource = useCallback(async (id) => {
    setLoading(true);
    try {
      await resourceApi.deleteResource(id);
      
      // Invalidate caches
      apiCache.invalidate(CACHE_KEY);
      apiCache.invalidate(`${CACHE_KEY}/${id}`);
      await fetchResources(currentPage, '', true);
      
      toast.success('Resource deleted successfully');
    } catch (err) {
      toast.error('Failed to delete resource');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchResources, currentPage]);

  // Fetch resource permissions
  const fetchResourcePermissions = async (resourceId) => {
    try {
      const response = await resourceApi.getResourcePermissions(resourceId);
      setPermissions(response);
      return response;
    } catch (err) {
      toast.error('Failed to fetch resource permissions');
      throw err;
    }
  };

  // Manage permissions
  const managePermission = async (resourceId, permissionData, action = 'add') => {
    try {
      let response;
      switch (action) {
        case 'add':
          response = await resourceApi.addPermission(resourceId, permissionData);
          break;
        case 'update':
          response = await resourceApi.updatePermission(
            resourceId,
            permissionData.id,
            permissionData
          );
          break;
        case 'delete':
          response = await resourceApi.deletePermission(
            resourceId,
            permissionData.id
          );
          break;
        default:
          throw new Error('Invalid permission action');
      }
      
      await fetchResourcePermissions(resourceId);
      toast.success('Permission updated successfully');
      return response;
    } catch (err) {
      toast.error('Failed to manage permission');
      throw err;
    }
  };

  return {
    resources,
    loading,
    error,
    currentPage,
    totalPages,
    selectedResource,
    permissions,
    setSelectedResource,
    fetchResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    fetchResourcesByType,
    fetchResourcesByCreator,
    handleSort,
    fetchResourcePermissions,
    managePermission,
    isConnected,
    setCurrentPage
  };
}; 