import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  Security,
  AccessTime,
  Warning,
  Error as ErrorIcon,
  Info,
  Refresh,
  DevicesOther,
  VpnKey,
} from '@mui/icons-material';
import { format } from 'date-fns';
import StatCard from '../../../components/dashboard/StatCard';
import { dashboardApi } from '../../../services/api';
import { motion } from 'framer-motion';
import { useTheme } from '../../../theme/ThemeProvider';
import { toast } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';
import { ResponsiveHeatMap } from '@nivo/heatmap';

const MotionGrid = motion(Grid);
const MotionCard = motion(Card);

const severityColors = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'error',
};

const severityIcons = {
  LOW: <Info color="info" />,
  MEDIUM: <Warning color="warning" />,
  HIGH: <ErrorIcon color="error" />,
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'PPpp');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

const DashboardSection = ({ children, title }) => {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <Alert severity="error" sx={{ m: 1 }}>
          Failed to load {title}: {error.message}
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

function UserDashboard() {
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    overview: null,
    securityStatus: null,
    recentActivity: [],
    activeSessions: [],
    recommendations: []
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add debug logging
      console.log('Fetching dashboard data with token:', localStorage.getItem('token'));

      const requests = [
        dashboardApi.getUserDashboardOverview().catch(error => {
          console.error('Overview error:', error.response?.data || error.message);
          return { data: null };
        }),
        dashboardApi.getUserSecurityStatus().catch(error => {
          console.error('Security status error:', error.response?.data || error.message);
          return { data: {
            passwordStrength: 'Unknown',
            mfaEnabled: false,
            lastPasswordChange: null,
            activeDevicesCount: 0,
            securityScore: 0
          }};
        }),
        dashboardApi.getUserActivity(null, null, 10).catch(error => {
          console.error('Activity error:', error.response?.data || error.message);
          return { data: [] };
        }),
        dashboardApi.getUserActiveSessions().catch(error => {
          console.error('Active sessions error:', error.response?.data || error.message);
          return { data: [] };
        }),
        dashboardApi.getSecurityRecommendations().catch(error => {
          console.error('Recommendations error:', error.response?.data || error.message);
          return { data: [] };
        })
      ];

      const [
        overviewResponse,
        securityStatusResponse,
        activityResponse,
        activeSessionsResponse,
        recommendationsResponse
      ] = await Promise.all(requests);

      // Add debug logging
      console.log('Dashboard responses:', {
        overview: overviewResponse?.data,
        security: securityStatusResponse?.data,
        activity: activityResponse?.data,
        sessions: activeSessionsResponse?.data,
        recommendations: recommendationsResponse?.data
      });

      setData({
        overview: overviewResponse?.data || null,
        securityStatus: securityStatusResponse?.data || {
          passwordStrength: 'Unknown',
          mfaEnabled: false,
          lastPasswordChange: null,
          activeDevicesCount: 0,
          securityScore: 0
        },
        recentActivity: activityResponse?.data || [],
        activeSessions: activeSessionsResponse?.data || [],
        recommendations: recommendationsResponse?.data || []
      });
      
      setLastRefresh(new Date());

      // Only show error if all critical data is missing
      if (!overviewResponse?.data && !securityStatusResponse?.data && !activityResponse?.data) {
        setError(new Error('Unable to load most dashboard data. Some features may be limited.'));
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading && !data.overview) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {loading && <LinearProgress />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load dashboard data
        </Alert>
      )}

      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4 
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            My Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Last updated: {format(lastRefresh, 'HH:mm:ss')}
            </Typography>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchDashboardData} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Security Status Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Security Score"
              value={`${data.securityStatus?.securityScore ?? '-'}%`}
              icon={<Security />}
              color={data.securityStatus?.securityScore > 70 ? 'success' : 'warning'}
              subtitle="Overall security rating"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Password Strength"
              value={data.securityStatus?.passwordStrength ?? '-'}
              icon={<VpnKey />}
              color={data.securityStatus?.passwordStrength === 'Strong' ? 'success' : 'warning'}
              subtitle={`Last changed: ${data.securityStatus?.lastPasswordChange ? formatDate(data.securityStatus.lastPasswordChange) : 'Never'}`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Devices"
              value={data.securityStatus?.activeDevicesCount ?? '-'}
              icon={<DevicesOther />}
              color="info"
              subtitle="Currently logged in devices"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="2FA Status"
              value={data.securityStatus?.mfaEnabled ? 'Enabled' : 'Disabled'}
              icon={<Security />}
              color={data.securityStatus?.mfaEnabled ? 'success' : 'error'}
              subtitle="Two-factor authentication"
            />
          </Grid>

          {/* Active Sessions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Active Sessions</Typography>
                <Stack spacing={1}>
                  {data.activeSessions.length > 0 ? (
                    data.activeSessions.map((session, index) => (
                      <Paper key={index} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DevicesOther />
                            <Typography variant="body2">{session.deviceType || 'Unknown device'}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(session.lastAccess)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          IP: {session.ipAddress || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {session.location || 'Unknown location'}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No active sessions
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Recommendations */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Security Recommendations</Typography>
                <Stack spacing={1}>
                  {data.recommendations.length > 0 ? (
                    data.recommendations.map((recommendation, index) => (
                      <Paper key={index} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              icon={severityIcons[recommendation.severity]}
                              label={recommendation.severity}
                              color={severityColors[recommendation.severity]}
                              size="small"
                            />
                            <Typography variant="body2">{recommendation.type}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {recommendation.message}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                          {recommendation.action}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No security recommendations at this time
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                <Stack spacing={1}>
                  {data.recentActivity.length > 0 ? (
                    data.recentActivity.map((activity, index) => (
                      <Paper key={index} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{activity.action || 'Unknown action'}</Typography>
                            <Chip
                              label={activity.status || 'Unknown'}
                              color={activity.status === 'SUCCESS' ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(activity.timestamp)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {activity.details || 'No details available'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            IP: {activity.ipAddress || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Device: {activity.userAgent || 'Unknown device'}
                          </Typography>
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No recent activity
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default UserDashboard; 