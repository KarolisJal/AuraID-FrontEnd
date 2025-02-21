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
  const [isInitialized, setIsInitialized] = useState(false);
  const { setIsLoading } = useLoading();
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsInitialized(true);
        return null;
      }

      // Add retry logic for network issues
      let retries = 3;
      while (retries > 0) {
        try {
          setIsLoading(true);
          const response = await authApi.getCurrentUser();
          setUser(response.data);
          setIsInitialized(true);
          return response.data;
        } catch (error) {
          if (error.response?.status === 401) {
            // Token is invalid, clear it and redirect
            localStorage.removeItem('token');
            setUser(null);
            setIsInitialized(true);
            if (window.location.pathname !== '/login') {
              navigate('/login');
            }
            return null;
          }
          if (error.message === 'Network error' && retries > 1) {
            // Wait before retrying on network errors
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
            continue;
          }
          // If we've exhausted retries, keep the user logged in on network errors
          if (retries === 1 && error.message === 'Network error') {
            setIsInitialized(true);
            return null;
          }
          throw error;
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setIsInitialized(true);
      // Don't automatically logout on errors other than 401
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
      return null;
    }
  }, [navigate, setIsLoading]);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const loginResponse = await authApi.login(credentials);
      const { token } = loginResponse.data;
      
      if (!token) {
        throw new Error('No token received');
      }

      // Store the token
      localStorage.setItem('token', token);

      // Then fetch the user data
      const userResponse = await authApi.getCurrentUser();
      const userData = userResponse.data;
      setUser(userData);
      navigate('/dashboard');
      
      return loginResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Don't render children until authentication is initialized
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  const value = {
    user,
    setUser,
    fetchUser,
    isAuthenticated: !!user,
    login,
    isInitialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 