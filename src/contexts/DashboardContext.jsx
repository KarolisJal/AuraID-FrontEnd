import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useDashboardQueries } from '../hooks/queries/useDashboardQueries';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  
  const {
    useDashboardData,
    useAdminStats,
    useUserStats,
    usePendingRequests,
    useActivities,
    useAllRequests,
    useUserRequests,
  } = useDashboardQueries(isAdmin);

  // Use the queries
  const { 
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError 
  } = useDashboardData();

  const {
    data: stats,
    isLoading: isStatsLoading,
  } = isAdmin ? useAdminStats() : useUserStats();

  const {
    data: pendingRequests,
    isLoading: isPendingLoading,
  } = usePendingRequests();

  const {
    data: activities,
    isLoading: isActivitiesLoading,
  } = useActivities();

  // Combine loading states
  const isLoading = isDashboardLoading || isStatsLoading || isPendingLoading || isActivitiesLoading;

  const value = {
    dashboardData,
    stats,
    pendingRequests,
    activities,
    isLoading,
    error: dashboardError,
    isAdmin,
    // Expose query hooks for components that need them
    queries: {
      useAllRequests,
      useUserRequests,
      usePendingRequests,
      useActivities,
    },
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 