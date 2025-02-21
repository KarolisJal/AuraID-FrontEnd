import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../services/userApi';
import { toast } from 'react-toastify';

const USERS_QUERY_KEY = 'users';

export const useUserQueries = () => {
  const queryClient = useQueryClient();

  // Get all users with pagination
  const useUsers = ({ page = 0, size = 10 } = {}) => {
    return useQuery({
      queryKey: [USERS_QUERY_KEY, 'list', page, size],
      queryFn: async () => {
        const response = await userApi.getAllUsers(page, size);
        return response.data;
      },
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get user by ID
  const useUserById = (id) => {
    return useQuery({
      queryKey: [USERS_QUERY_KEY, 'detail', id],
      queryFn: async () => {
        const response = await userApi.getUserById(id);
        return response.data;
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create user mutation
  const useCreateUser = () => {
    return useMutation({
      mutationFn: async (userData) => {
        const response = await userApi.createUser(userData);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        toast.success('User created successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create user');
      },
    });
  };

  // Update user mutation
  const useUpdateUser = () => {
    return useMutation({
      mutationFn: async ({ id, data }) => {
        const response = await userApi.updateUser(id, data);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: [USERS_QUERY_KEY, 'detail', variables.id] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [USERS_QUERY_KEY, 'list'] 
        });
        toast.success('User updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update user');
      },
    });
  };

  // Delete user mutation
  const useDeleteUser = () => {
    return useMutation({
      mutationFn: async (id) => {
        await userApi.deleteUser(id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete user');
      },
    });
  };

  // Update user status mutation
  const useUpdateUserStatus = () => {
    return useMutation({
      mutationFn: async ({ userId, status }) => {
        const response = await userApi.updateUserStatus(userId, status);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: [USERS_QUERY_KEY, 'detail', variables.userId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [USERS_QUERY_KEY, 'list'] 
        });
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update user status');
      },
    });
  };

  // Update user roles mutation
  const useUpdateUserRoles = () => {
    return useMutation({
      mutationFn: async ({ userId, roles }) => {
        const response = await userApi.updateUserRoles(userId, roles);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: [USERS_QUERY_KEY, 'detail', variables.userId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: [USERS_QUERY_KEY, 'list'] 
        });
        toast.success('User roles updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update user roles');
      },
    });
  };

  return {
    useUsers,
    useUserById,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useUpdateUserStatus,
    useUpdateUserRoles,
  };
}; 