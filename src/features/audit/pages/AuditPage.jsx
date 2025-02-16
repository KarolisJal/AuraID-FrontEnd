import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  History as HistoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AuditLog from '../components/AuditLog';
import { auditService } from '../../../services/auditService';

const AuditPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const stats = await auditService.getAuditStatistics();
      setStatistics(stats);
      setError(null);
    } catch (err) {
      setError('Failed to load audit statistics');
      console.error('Error fetching audit statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <Box>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HistoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Audit Log
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchStatistics} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Events
                </Typography>
                <Typography variant="h4">
                  {statistics.totalEvents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Failed Logins
                </Typography>
                <Typography variant="h4" color="error">
                  {statistics.failedLogins}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Suspicious Activities
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {statistics.suspiciousActivities}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              component={motion.div}
              whileHover={{ scale: 1.02 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Recent Events
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.recentEvents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        elevation={2}
        sx={{ p: 3 }}
      >
        <AuditLog />
      </Paper>
    </Box>
  );
};

export default AuditPage; 