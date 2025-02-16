import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Security,
  Warning,
  Error as ErrorIcon,
  Refresh,
  PersonOff,
  Login,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { auditService } from '../../../services/auditService';
import StatCard from '../../../components/dashboard/StatCard';

const AuditDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    statistics: {},
    failedLogins: [],
    suspiciousActivities: [],
    failedLoginAttempts: {},
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        statistics,
        failedLogins,
        suspiciousActivities,
        failedLoginAttempts,
      ] = await Promise.all([
        auditService.getAuditStatistics(),
        auditService.getFailedLoginAttempts(),
        auditService.getSuspiciousActivities(),
        auditService.getRecentFailedLoginAttempts(),
      ]);

      setData({
        statistics,
        failedLogins,
        suspiciousActivities,
        failedLoginAttempts,
      });
    } catch (error) {
      console.error('Failed to fetch audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Security Overview</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Activity Statistics */}
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Total Activities"
            value={Object.values(data.statistics).reduce((a, b) => a + b, 0)}
            icon={<Security />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Failed Logins"
            value={data.failedLogins.length}
            icon={<Login />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Suspicious Activities"
            value={data.suspiciousActivities.length}
            icon={<Warning />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Blocked Users"
            value={Object.keys(data.failedLoginAttempts).filter(k => data.failedLoginAttempts[k] >= 5).length}
            icon={<PersonOff />}
            color="error"
          />
        </Grid>

        {/* Failed Login Attempts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Failed Login Attempts
            </Typography>
            <List>
              {data.failedLogins.slice(0, 5).map((log, index) => (
                <ListItem key={log.id || index} divider={index < 4}>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={log.username}
                    secondary={
                      <>
                        {format(new Date(log.createdAt), 'PPpp')}
                        <br />
                        IP: {log.ipAddress}
                      </>
                    }
                  />
                  <Chip
                    label={`${data.failedLoginAttempts[log.username] || 1} attempts`}
                    color="error"
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Suspicious Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Suspicious Activities
            </Typography>
            <List>
              {data.suspiciousActivities.slice(0, 5).map((activity, index) => (
                <ListItem key={activity.id || index} divider={index < 4}>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.details}
                    secondary={
                      <>
                        {format(new Date(activity.createdAt), 'PPpp')}
                        <br />
                        User: {activity.username} | IP: {activity.ipAddress}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuditDashboard; 