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
          value={value}
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
  if (!metrics) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          System health data unavailable
        </Typography>
      </Box>
    );
  }

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
          value={metrics.cpuUsage}
          icon={Speed}
          color={getHealthColor(metrics.cpuUsage)}
        />
      </Grid>
      <Grid item xs={12}>
        <HealthIndicator
          label="Memory Usage"
          value={metrics.memoryUsage}
          icon={Memory}
          color={getHealthColor(metrics.memoryUsage)}
        />
      </Grid>
      <Grid item xs={12}>
        <HealthIndicator
          label="Disk Usage"
          value={metrics.diskUsage}
          icon={Storage}
          color={getHealthColor(metrics.diskUsage)}
        />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last Updated: {new Date(metrics.timestamp).toLocaleString()}
          </Typography>
          {metrics.warnings?.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {metrics.warnings.map((warning, index) => (
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
    cpuUsage: PropTypes.number.isRequired,
    memoryUsage: PropTypes.number.isRequired,
    diskUsage: PropTypes.number.isRequired,
    timestamp: PropTypes.string.isRequired,
    warnings: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default SystemHealth; 