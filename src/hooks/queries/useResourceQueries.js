import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi } from '../../services/resourceApi';
import { toast } from 'react-toastify';

const RESOURCES_QUERY_KEY = 'resources';

export const useResourceQueries = () => {
  const queryClient = useQueryClient();

  // Get all resources
  const useResources = (page = 0, size = 20) => {
    return useQuery({
      queryKey: [RESOURCES_QUERY_KEY, 'list', page, size],
      queryFn: async () => {
        const response = await resourceApi.getAllResources(page, size);
        return response.data;
      },
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get resource by ID
  const useResourceById = (id) => {
    return useQuery({
      queryKey: [RESOURCES_QUERY_KEY, 'detail', id],
      queryFn: async () => {
        const response = await resourceApi.getResourceById(id);
        return response.data;
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get resources by type
  const useResourcesByType = (type, page = 0, size = 20) => {
    return useQuery({
      queryKey: [RESOURCES_QUERY_KEY, 'type', type, page, size],
      queryFn: async () => {
        const response = await resourceApi.getResourcesByType(type, page, size);
        return response.data;
      },
      enabled: !!type,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create resource mutation
  const useCreateResource = () => {
    return useMutation({
      mutationFn: async (resourceData) => {
        const response = await resourceApi.createResource(resourceData);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [RESOURCES_QUERY_KEY] });
        toast.success('Resource created successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create resource');
      },
    });
  };

  // Update resource mutation
  const useUpdateResource = () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const response = await resourceApi.updateResource(id, data);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: [RESOURCES_QUERY_KEY, 'detail', variables.id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [RESOURCES_QUERY_KEY, 'list'] 
        });
        toast.success('Resource updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update resource');
      },
    });
  };

  // Delete resource mutation
  const useDeleteResource = () => {
    return useMutation({
      mutationFn: async (id) => {
        await resourceApi.deleteResource(id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [RESOURCES_QUERY_KEY] });
        toast.success('Resource deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete resource');
      },
    });
  };

  // Get resource permissions
  const useResourcePermissions = (resourceId) => {
    return useQuery({
      queryKey: [RESOURCES_QUERY_KEY, 'permissions', resourceId],
      queryFn: async () => {
        const response = await resourceApi.getResourcePermissions(resourceId);
        return response.data;
      },
      enabled: !!resourceId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Manage permission mutation
  const useManagePermission = () => {
    return useMutation({
      mutationFn: async ({ resourceId, permissionData, action }) => {
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
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: [RESOURCES_QUERY_KEY, 'permissions', variables.resourceId],
        });
        toast.success('Permission updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to manage permission');
      },
    });
  };

  return {
    useResources,
    useResourceById,
    useResourcesByType,
    useCreateResource,
    useUpdateResource,
    useDeleteResource,
    useResourcePermissions,
    useManagePermission,
  };
}; 