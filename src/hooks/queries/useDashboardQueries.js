import { useQuery } from '@tanstack/react-query';
import { workflowApi } from '../../services/workflowApi';

const DASHBOARD_QUERY_KEY = 'dashboard';

export const useDashboardQueries = (isAdmin = false) => {
  // Get dashboard data with optimized caching
  const useDashboardData = () => {
    return useQuery({
      queryKey: [DASHBOARD_QUERY_KEY, 'data', isAdmin],
      queryFn: async () => {
        const response = await workflowApi.getDashboardData(isAdmin);
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    });
  };

  // Get admin stats from dashboard data
  const useAdminStats = () => {
    return useQuery({
      queryKey: [DASHBOARD_QUERY_KEY, 'admin', 'stats'],
      queryFn: async () => {
        const response = await workflowApi.getDashboardData(true);
        return { data: response.data.stats };
      },
      enabled: isAdmin,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
    });
  };

  // Get user stats from dashboard data
  const useUserStats = () => {
    return useQuery({
      queryKey: [DASHBOARD_QUERY_KEY, 'user', 'stats'],
      queryFn: async () => {
        const response = await workflowApi.getDashboardData(false);
        return { data: response.data.stats };
      },
      enabled: !isAdmin,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
    });
  };

  // Get pending requests with shorter cache
  const usePendingRequests = (page = 0, size = 10) => {
    return useQuery({
      queryKey: [DASHBOARD_QUERY_KEY, isAdmin ? 'admin' : 'user', 'pending', page, size],
      queryFn: async () => {
        const response = isAdmin
          ? await workflowApi.getAdminPendingRequests(page, size)
          : await workflowApi.getUserPendingApprovals(page, size);
        return response.data;
      },
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get activities with medium cache
  const useActivities = (page = 0, size = 10) => {
    return useQuery({
      queryKey: [DASHBOARD_QUERY_KEY, isAdmin ? 'admin' : 'user', 'activities', page, size],
      queryFn: async () => {
        const response = isAdmin
          ? await workflowApi.getAdminActivities(page, size)
          : await workflowApi.getUserActivities(page, size);
        return response.data;
      },
      keepPreviousData: true,
      staleTime: 3 * 60 * 1000, // 3 minutes
      cacheTime: 8 * 60 * 1000, // 8 minutes
    });
  };

  // Get all requests for admin with filters
  const useAllRequests = (filters, page = 0, size = 10) => {
    return useQuery({
      queryKey: [DASHBOARD_QUERY_KEY, 'admin', 'all-requests', filters, page, size],
      queryFn: async () => {
        const response = await workflowApi.getAdminAllRequests(filters, page, size);
        return response.data;
      },
      enabled: isAdmin,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get user requests
  const useUserRequests = (page = 0, size = 10) => {
    return useQuery({
      queryKey: [DASHBOARD_QUERY_KEY, 'user', 'requests', page, size],
      queryFn: async () => {
        const response = await workflowApi.getUserRequests(page, size);
        return response.data;
      },
      enabled: !isAdmin,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    useDashboardData,
    useAdminStats,
    useUserStats,
    usePendingRequests,
    useActivities,
    useAllRequests,
    useUserRequests,
  };
}; 