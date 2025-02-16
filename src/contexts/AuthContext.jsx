import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLoading } from './LoadingContext';

const AuthContext = createContext(null);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await authApi.getCurrentUser();
      setUser(response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setIsLoading]);

  const login = async (credentials) => {
    try {
      console.log('Login attempt with:', { ...credentials, password: '***' });
      setIsLoading(true);
      
      // First, get the token from login
      const loginResponse = await authApi.login(credentials);
      console.log('Login response:', loginResponse);

      const { token } = loginResponse.data;
      console.log('Received token:', !!token);
      
      if (!token) {
        throw new Error('No token received');
      }

      // Store the token
      localStorage.setItem('token', token);

      // Then fetch the user data
      console.log('Fetching user data...');
      const userResponse = await authApi.getCurrentUser();
      console.log('User data response:', userResponse);

      const userData = userResponse.data;
      setUser(userData);
      
      console.log('User set in context:', userData);
      console.log('Navigating to dashboard...');
      navigate('/dashboard');
      
      return loginResponse;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    setUser,
    fetchUser,
    isAuthenticated: !!user,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 