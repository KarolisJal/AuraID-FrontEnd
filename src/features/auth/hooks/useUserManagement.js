import { useState, useCallback, useEffect } from 'react';
import { userApi } from '../../../services/api';
import { toast } from 'react-toastify';

export const useUserManagement = () => {
  console.log('A. useUserManagement hook initializing');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    console.log('B. fetchUsers called');
    setLoading(true);
    setError(null);
    try {
      console.log('C. Making API call to getAllUsers');
      const response = await userApi.getAllUsers();
      console.log('D. API Response:', response);
      setUsers(response.data);
      return response;
    } catch (err) {
      console.error('E. Error in fetchUsers:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
      toast.error(err.response?.data?.message || 'Failed to fetch users');
      throw err;
    } finally {
      console.log('F. Setting loading to false');
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Creating user:', { ...userData, password: '[REDACTED]' });
      const response = await userApi.createUser(userData);
      console.log('User creation response:', response);
      await fetchUsers(); // Refresh the list after creation
      return response.data;
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create user';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (username, userData) => {
    setLoading(true);
    try {
      const response = await userApi.updateUser(username, userData);
      await fetchUsers(); // Refresh the list after update
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (username) => {
    setLoading(true);
    try {
      await userApi.deleteUser(username);
      await fetchUsers(); // Refresh the list after deletion
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUserStatus = useCallback(async (username, status) => {
    setLoading(true);
    try {
      const response = await userApi.updateUserStatus(username, status);
      await fetchUsers(); // Refresh the list after status update
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUserRoles = useCallback(async (username, roles) => {
    setLoading(true);
    try {
      const response = await userApi.updateUserRoles(username, roles);
      await fetchUsers(); // Refresh the list after roles update
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  // Fetch users on component mount
  useEffect(() => {
    console.log('G. useUserManagement useEffect running');
    fetchUsers().catch(error => {
      console.error('H. Error in initial fetchUsers:', error);
    });
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRoles,
  };
}; 