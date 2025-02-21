import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Replay as RequestChangesIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useDashboard } from '../../../contexts/DashboardContext';
import { useWorkflowManagement } from '../hooks/useWorkflowManagement';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: `${color}.light`,
      color: `${color}.dark`
    }}
  >
    {icon}
    <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
  </Paper>
);

export const AdminWorkflowDashboard = () => {
  const {
    dashboardData,
    loading,
    error,
    lastRefresh,
    refreshDisabled,
    handleRefresh
  } = useDashboard();
  
  const { executeStepAction } = useWorkflowManagement();

  const handleStepAction = async (stepExecutionId, action) => {
    try {
      await executeStepAction(stepExecutionId, action);
      handleRefresh(); // Refresh after action
    } catch (err) {
      console.error('Failed to execute step action:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  const {
    pendingRequests,
    activities,
    stats
  } = dashboardData;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Workflow Dashboard</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Tooltip title={refreshDisabled ? "Please wait before refreshing again" : "Refresh Dashboard"}>
            <span>
              <IconButton 
                onClick={handleRefresh} 
                disabled={loading || refreshDisabled}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Pending Requests"
            value={stats?.totalPending || 0}
            icon={<TimelineIcon fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Today"
            value={stats?.approvedToday || 0}
            icon={<ApproveIcon fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rejected Today"
            value={stats?.rejectedToday || 0}
            icon={<RejectIcon fontSize="large" />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Processing Time"
            value={stats?.avgProcessingTime || '0h'}
            icon={<TimelineIcon fontSize="large" />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Request Volume
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.requestVolume || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Processing Time Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.processingTimeTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="time" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Pending Requests Table */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pending Requests
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Current Step</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.resourceName}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.requesterName}</TableCell>
                  <TableCell>{request.currentStep}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={
                        request.status === 'PENDING' ? 'warning' :
                        request.status === 'IN_PROGRESS' ? 'info' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Approve">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleStepAction(request.currentStepId, 'approve')}
                      >
                        <ApproveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleStepAction(request.currentStepId, 'reject')}
                      >
                        <RejectIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Request Changes">
                      <IconButton
                        size="small"
                        onClick={() => handleStepAction(request.currentStepId, 'request-changes')}
                      >
                        <RequestChangesIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Activities */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={activity.action}
                      color={
                        activity.action === 'APPROVED' ? 'success' :
                        activity.action === 'REJECTED' ? 'error' :
                        activity.action === 'CHANGES_REQUESTED' ? 'warning' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{activity.resourceName}</TableCell>
                  <TableCell>{activity.userName}</TableCell>
                  <TableCell>{activity.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}; 