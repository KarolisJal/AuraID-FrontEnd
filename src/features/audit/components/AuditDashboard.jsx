import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import { Security, Warning, Error as ErrorIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { StatCard } from '../../../components/dashboard/StatCard';
import { LoadingScreen } from '../../../components/common';

export function AuditDashboard({ data, loading }) {
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Grid container spacing={3}>
      {/* Statistics Cards */}
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
          icon={<ErrorIcon />}
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
          icon={<ErrorIcon />}
          color="error"
        />
      </Grid>

      {/* Failed Login Attempts */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Recent Failed Login Attempts
          </Typography>
          {data.failedLogins.slice(0, 5).map((log, index) => (
            <Box
              key={log.id || index}
              sx={{
                p: 2,
                mb: index < 4 ? 2 : 0,
                borderBottom: index < 4 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2">{log.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(log.createdAt), 'PPpp')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    IP: {log.ipAddress}
                  </Typography>
                </Box>
                <Chip
                  label={`${data.failedLoginAttempts[log.username] || 1} attempts`}
                  color="error"
                  size="small"
                />
              </Box>
            </Box>
          ))}
        </Paper>
      </Grid>

      {/* Suspicious Activities */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Suspicious Activities
          </Typography>
          {data.suspiciousActivities.slice(0, 5).map((activity, index) => (
            <Box
              key={activity.id || index}
              sx={{
                p: 2,
                mb: index < 4 ? 2 : 0,
                borderBottom: index < 4 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2">{activity.details}</Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(activity.createdAt), 'PPpp')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User: {activity.username} | IP: {activity.ipAddress}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
}

AuditDashboard.propTypes = {
  data: PropTypes.shape({
    statistics: PropTypes.object,
    failedLogins: PropTypes.array,
    suspiciousActivities: PropTypes.array,
    failedLoginAttempts: PropTypes.object,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
}; 