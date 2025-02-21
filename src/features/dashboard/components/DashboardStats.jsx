import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  Assessment as RequestsIcon,
  Security as ResourcesIcon,
  Group as UsersIcon,
  Workflow as WorkflowsIcon
} from '@mui/icons-material';
import { useDashboardQueries } from '../../../hooks/queries/useDashboardQueries';

const StatCard = ({ title, value, icon: Icon, loading, error }) => (
  <Paper sx={{ p: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ 
        p: 1, 
        borderRadius: 1, 
        bgcolor: 'primary.light',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon sx={{ color: 'primary.main' }} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={40} />
        ) : error ? (
          <Typography color="error">Error</Typography>
        ) : (
          <Typography variant="h4">
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
);

export const DashboardStats = () => {
  const { 
    useDashboardData,
    useAdminStats,
    useUserStats
  } = useDashboardQueries();

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError
  } = useDashboardData();

  const {
    data: adminStats,
    isLoading: isAdminLoading,
    error: adminError
  } = useAdminStats();

  const {
    data: userStats,
    isLoading: isUserLoading,
    error: userError
  } = useUserStats();

  const isLoading = isDashboardLoading || isAdminLoading || isUserLoading;
  const hasError = dashboardError || adminError || userError;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" align="center">
          {(dashboardError || adminError || userError)?.message || 'Failed to load dashboard stats'}
        </Typography>
      </Box>
    );
  }

  const stats = [
    {
      title: 'Total Access Requests',
      value: dashboardData?.totalRequests || 0,
      icon: RequestsIcon
    },
    {
      title: 'Active Resources',
      value: dashboardData?.activeResources || 0,
      icon: ResourcesIcon
    },
    {
      title: 'Active Users',
      value: dashboardData?.activeUsers || 0,
      icon: UsersIcon
    },
    {
      title: 'Active Workflows',
      value: dashboardData?.activeWorkflows || 0,
      icon: WorkflowsIcon
    }
  ];

  const adminMetrics = adminStats ? [
    {
      title: 'Pending Approvals',
      value: adminStats.pendingApprovals || 0,
      icon: RequestsIcon
    },
    {
      title: 'Resources Under Review',
      value: adminStats.resourcesUnderReview || 0,
      icon: ResourcesIcon
    }
  ] : [];

  const userMetrics = userStats ? [
    {
      title: 'My Pending Requests',
      value: userStats.pendingRequests || 0,
      icon: RequestsIcon
    },
    {
      title: 'My Resources',
      value: userStats.assignedResources || 0,
      icon: ResourcesIcon
    }
  ] : [];

  return (
    <Box sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              loading={isLoading}
              error={hasError}
            />
          </Grid>
        ))}
        
        {adminStats && adminMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} key={`admin-${index}`}>
            <StatCard
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              loading={isAdminLoading}
              error={adminError}
            />
          </Grid>
        ))}

        {userStats && userMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} key={`user-${index}`}>
            <StatCard
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              loading={isUserLoading}
              error={userError}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 