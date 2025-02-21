import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  People,
  Security,
  AccessTime,
  CheckCircle,
  Refresh,
  PersonAdd,
  ClearAll,
  RestartAlt,
  CloudQueue,
  PeopleAlt,
  Backup,
  Warning,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';
import { format } from 'date-fns';
import StatCard from '../../../components/dashboard/StatCard';
import SystemHealth from '../../../features/admin/components/SystemHealth';
import SecurityEvents from '../../../features/admin/components/SecurityEvents';
import UserAnalytics from '../../../features/admin/components/UserAnalytics';
import { dashboardApi } from '../../../services/api';
import { motion } from 'framer-motion';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { ErrorBoundary } from 'react-error-boundary';
import AuditDashboard from '../../../features/admin/components/AuditDashboard';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveBar } from '@nivo/bar';
import { countries } from '../../../utils/constants/countries';
import PropTypes from 'prop-types';
import { handleError, ErrorTypes } from '../../../utils/errorHandler';

const MotionGrid = motion(Grid);
const MotionCard = motion(Card);
const MotionPaper = motion(Paper);

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

const DashboardSection = ({ children, title }) => {
  // Simplified validation that doesn't throw errors
  const hasValidChildren = children && (
    React.isValidElement(children) || 
    (Array.isArray(children) && children.every(child => React.isValidElement(child)))
  );

  if (!hasValidChildren) {
    return (
      <Alert severity="warning" sx={{ m: 1 }}>
        No content available for {title}
      </Alert>
    );
  }

  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <Alert severity="error" sx={{ m: 1 }}>
          Failed to load {title}: {error.message}
        </Alert>
      )}
    >
      <Paper sx={{ p: 2, mb: 2 }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        {children}
      </Paper>
    </ErrorBoundary>
  );
};

DashboardSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]).isRequired,
  title: PropTypes.string.isRequired
};

function AdminDashboard() {
  const { currentTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    stats: null,
    activity: [],
    securityEvents: [],
    securityMetrics: null,
    userTrends: null,
    activityHeatmap: null,
    geographicDistribution: null,
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);
  const [eventFilter, setEventFilter] = useState({
    hours: 24,
    severity: '',
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsResponse,
        securityEventsResponse,
        heatmapResponse,
        geoResponse,
      ] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSecurityEvents(eventFilter.hours, eventFilter.severity),
        dashboardApi.getActivityHeatmap(7),
        dashboardApi.getGeographicDistribution(7),
      ]);

      setData({
        stats: statsResponse?.data || null,
        securityEvents: securityEventsResponse?.data?.events || [],
        activityHeatmap: heatmapResponse?.data || null,
        geographicDistribution: geoResponse?.data || { countries: {} },
      });
      setLastRefresh(new Date());
      setError(null);
    } catch (error) {
      const appError = handleError(error, ErrorTypes.DASHBOARD);
      setError(appError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      await dashboardApi.performBackup();
      toast.success('System backup initiated successfully');
    } catch (error) {
      handleError(error, ErrorTypes.SERVER);
    }
  };

  const handleClearCache = async () => {
    try {
      await dashboardApi.clearCache();
      toast.success('Cache cleared successfully');
    } catch (error) {
      handleError(error, ErrorTypes.SERVER);
    }
  };

  const handleRestartServer = async () => {
    if (window.confirm('Are you sure you want to restart the server?')) {
      try {
        await dashboardApi.restartServer();
        toast.success('Server restart initiated');
      } catch (error) {
        handleError(error, ErrorTypes.SERVER);
      }
    }
  };

  const handleEventFilterChange = (event) => {
    const { name, value } = event.target;
    setEventFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [eventFilter]);

  if (loading && !data.stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {loading && <LinearProgress variant="indeterminate" />}
      
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
            Admin Dashboard
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
          {/* Stat Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={data.stats?.userMetrics?.totalUsers ?? '-'}
              icon={<PeopleAlt />}
              color="primary"
              subtitle={`${data.userTrends?.last24Hours ?? 0} new in 24h`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={data.stats?.userMetrics?.activeUsers ?? '-'}
              icon={<PeopleAlt />}
              color="success"
              subtitle={`${((data.stats?.userMetrics?.activeUsers / data.stats?.userMetrics?.totalUsers) * 100).toFixed(0)}% of total`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Security Score"
              value={`${data.stats?.securityMetrics?.securityScore ?? '-'}%`}
              icon={<Security />}
              color="warning"
              subtitle="System security rating"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Uptime"
              value={(() => {
                const uptime = data.stats?.systemHealth?.uptime;
                if (!uptime) return '-';
                
                const hours = Math.round(uptime / 3600);
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                
                if (days > 0) {
                  return remainingHours > 0 ? 
                    `${days}d ${remainingHours}h` : 
                    `${days}d`;
                }
                return `${hours}h`;
              })()}
              icon={<CloudQueue />}
              color="info"
              subtitle={`Since ${new Date(data.stats?.systemHealth?.timestamp ?? '').toLocaleDateString()}`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="New Users Today"
              value={data.stats?.userMetrics?.newUsersToday ?? '-'}
              icon={<PersonAdd />}
              color="info"
              subtitle={`${data.stats?.userMetrics?.newUsersThisWeek ?? 0} this week`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Login Success Rate"
              value={(() => {
                const metrics = data.stats?.securityMetrics;
                if (!metrics?.loginAttempts) return '-';
                const rate = (metrics.successfulLogins / metrics.loginAttempts) * 100;
                return `${rate.toFixed(1)}%`;
              })()}
              icon={<Security />}
              color="success"
              subtitle={`${data.stats?.securityMetrics?.successfulLogins ?? 0}/${data.stats?.securityMetrics?.loginAttempts ?? 0} attempts`}
            />
          </Grid>

          {/* System Health */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Box sx={{ mt: 2 }}>
                <SystemHealth metrics={data.stats?.systemHealth} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  CPU Usage: {data.stats?.systemHealth?.cpuUsage ?? '-'}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Memory Usage: {data.stats?.systemHealth?.memoryUsage ?? '-'}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Disk Usage: {data.stats?.systemHealth?.diskUsage ?? '-'}%
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Security Events */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Security Events
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    name="hours"
                    value={eventFilter.hours}
                    onChange={handleEventFilterChange}
                    label="Time Range"
                  >
                    <MenuItem value={24}>Last 24 Hours</MenuItem>
                    <MenuItem value={48}>Last 48 Hours</MenuItem>
                    <MenuItem value={72}>Last 72 Hours</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    name="severity"
                    value={eventFilter.severity}
                    onChange={handleEventFilterChange}
                    label="Severity"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Stack spacing={1}>
                {data.securityEvents.map((event, index) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={severityIcons[event.severity]}
                          label={event.severity}
                          color={severityColors[event.severity]}
                          size="small"
                        />
                        <Typography variant="body2">{event.eventType}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(event.timestamp), 'PPpp')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {event.description}
                    </Typography>
                    {event.username && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        User: {event.username}
                      </Typography>
                    )}
                    {event.ipAddress && (
                      <Typography variant="caption" display="block">
                        IP: {event.ipAddress}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* User Analytics */}
          <Grid item xs={12}>
            <DashboardSection title="User Analytics">
              <UserAnalytics data={data.userTrends} />
            </DashboardSection>
          </Grid>

          {/* Audit Dashboard */}
          <Grid item xs={12}>
            <DashboardSection title="Audit & Security">
              <AuditDashboard />
            </DashboardSection>
          </Grid>

          {/* Activity Heatmap */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Activity Heatmap</Typography>
                <Box sx={{ height: 400 }}>
                  {data.activityHeatmap?.heatmap ? (
                    <ResponsiveHeatMap
                      data={data.activityHeatmap.heatmap.map((row, i) => ({
                        id: `Day ${i + 1}`,
                        data: row.map((value, j) => ({
                          x: j,
                          y: value
                        }))
                      }))}
                      margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -90,
                        legend: 'Hour',
                        legendPosition: 'middle',
                        legendOffset: 46
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Day',
                        legendPosition: 'middle',
                        legendOffset: -40
                      }}
                      colors={{
                        type: 'sequential',
                        scheme: 'blues'
                      }}
                      emptyColor="#555555"
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">No activity data available</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Geographic Distribution */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Geographic Distribution</Typography>
                <Box sx={{ height: 400 }}>
                  {data.geographicDistribution?.countries && Object.keys(data.geographicDistribution.countries).length > 0 ? (
                    <ResponsiveBar
                      data={Object.entries(data.geographicDistribution.countries)
                        .map(([countryCode, value]) => {
                          const country = countries.find(c => c.code === countryCode);
                          return {
                            country: country ? country.name : countryCode,
                            value: value
                          };
                        })
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 20)
                      }
                      keys={['value']}
                      indexBy="country"
                      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                      padding={0.3}
                      valueScale={{ type: 'linear' }}
                      indexScale={{ type: 'band', round: true }}
                      colors={{ scheme: 'nivo' }}
                      borderColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]]
                      }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Country',
                        legendPosition: 'middle',
                        legendOffset: 40
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Number of Users',
                        legendPosition: 'middle',
                        legendOffset: -40
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]]
                      }}
                      legends={[
                        {
                          dataFrom: 'keys',
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 120,
                          translateY: 0,
                          itemsSpacing: 2,
                          itemWidth: 100,
                          itemHeight: 20,
                          itemDirection: 'left-to-right',
                          itemOpacity: 0.85,
                          symbolSize: 20,
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemOpacity: 1
                              }
                            }
                          ]
                        }
                      ]}
                      role="application"
                      ariaLabel="Geographic distribution of users"
                      barAriaLabel={e => `${e.id}: ${e.formattedValue} users in ${e.indexValue}`}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography color="text.secondary">
                        No geographic data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Backup />}
                onClick={handleBackup}
              >
                Backup System
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ClearAll />}
                onClick={handleClearCache}
              >
                Clear Cache
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RestartAlt />}
                onClick={handleRestartServer}
              >
                Restart Server
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {process.env.NODE_ENV === 'development' && (
        <Button 
          onClick={() => console.log('Current Dashboard State:', data)}
          sx={{ position: 'fixed', bottom: 16, right: 200 }}
          variant="contained"
          color="secondary"
        >
          Show Current State
        </Button>
      )}
    </Box>
  );
}

export default AdminDashboard;