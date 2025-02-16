import { useState, useCallback } from 'react';
import { userApi } from '../../../services/api';
import { toast } from 'react-toastify';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userApi.getAllUsers();
      console.log('API Response:', response); // Debug log
      setUsers(response.data || []); // Ensure we always set an array
    } catch (error) {
      console.error('Error fetching users:', error); // Debug log
      setError(error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (userData) => {
    setLoading(true);
    try {
      await userApi.createUser(userData);
      toast.success('User created successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error); // Debug log
      toast.error(error.response?.data?.message || 'Failed to create user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (username, userData) => {
    setLoading(true);
    try {
      await userApi.updateUser(username, userData);
      toast.success('User updated successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error); // Debug log
      toast.error(error.response?.data?.message || 'Failed to update user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (username) => {
    setLoading(true);
    try {
      await userApi.deleteUser(username);
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error); // Debug log
      toast.error(error.response?.data?.message || 'Failed to delete user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (username, status) => {
    setLoading(true);
    try {
      await userApi.updateUserStatus(username, status);
      toast.success('User status updated successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error); // Debug log
      toast.error(error.response?.data?.message || 'Failed to update user status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
  };
}; 