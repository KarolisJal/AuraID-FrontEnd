import { Box, LinearProgress, Typography, Grid, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { Memory, Storage, Speed } from '@mui/icons-material';

const HealthIndicator = ({ label, value, icon: Icon, color }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Icon sx={{ mr: 1, color: color }} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
    <Tooltip title={`${value}%`}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value || 0}
          sx={{
            height: 8,
            borderRadius: 5,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            },
          }}
        />
      </Box>
    </Tooltip>
  </Box>
);

const SystemHealth = ({ metrics }) => {
  // Default values for metrics
  const defaultMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    timestamp: new Date().toISOString(),
    warnings: []
  };

  // Merge provided metrics with defaults
  const safeMetrics = metrics ? {
    ...defaultMetrics,
    ...metrics,
    // Ensure numeric values are valid numbers or default to 0
    cpuUsage: Number.isFinite(metrics.cpuUsage) ? metrics.cpuUsage : 0,
    memoryUsage: Number.isFinite(metrics.memoryUsage) ? metrics.memoryUsage : 0,
    diskUsage: Number.isFinite(metrics.diskUsage) ? metrics.diskUsage : 0,
  } : defaultMetrics;

  const getHealthColor = (value) => {
    if (value >= 90) return '#f44336'; // Red
    if (value >= 70) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <HealthIndicator
          label="CPU Usage"
          value={safeMetrics.cpuUsage}
          icon={Speed}
          color={getHealthColor(safeMetrics.cpuUsage)}
        />
      </Grid>
      <Grid item xs={12}>
        <HealthIndicator
          label="Memory Usage"
          value={safeMetrics.memoryUsage}
          icon={Memory}
          color={getHealthColor(safeMetrics.memoryUsage)}
        />
      </Grid>
      <Grid item xs={12}>
        <HealthIndicator
          label="Disk Usage"
          value={safeMetrics.diskUsage}
          icon={Storage}
          color={getHealthColor(safeMetrics.diskUsage)}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last Updated: {new Date(safeMetrics.timestamp).toLocaleString()}
          </Typography>
          {safeMetrics.warnings?.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {safeMetrics.warnings.map((warning, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  color="warning.main"
                  sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                >
                  ⚠️ {warning}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

HealthIndicator.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
};

SystemHealth.propTypes = {
  metrics: PropTypes.shape({
    cpuUsage: PropTypes.number,
    memoryUsage: PropTypes.number,
    diskUsage: PropTypes.number,
    timestamp: PropTypes.string,
    warnings: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default SystemHealth; 