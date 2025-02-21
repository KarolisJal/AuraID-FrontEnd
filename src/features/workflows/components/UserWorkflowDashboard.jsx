import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Replay as RequestChangesIcon,
  Assignment as RequestIcon,
  Timeline as TimelineIcon,
  AccessTime as PendingIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { useDashboard } from '../../../contexts/DashboardContext';
import { useWorkflowManagement } from '../hooks/useWorkflowManagement';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

export const UserWorkflowDashboard = () => {
  const {
    dashboardData,
    loading,
    error,
    lastRefresh,
    refreshDisabled,
    handleRefresh
  } = useDashboard();
  
  const { executeStepAction } = useWorkflowManagement();

  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    stepId: null,
    comment: ''
  });

  const handleActionDialogOpen = (type, stepId) => {
    setActionDialog({
      open: true,
      type,
      stepId,
      comment: ''
    });
  };

  const handleActionDialogClose = () => {
    setActionDialog({
      open: false,
      type: null,
      stepId: null,
      comment: ''
    });
  };

  const handleActionSubmit = async () => {
    try {
      await executeStepAction(
        actionDialog.stepId,
        actionDialog.type,
        { comment: actionDialog.comment }
      );
      handleActionDialogClose();
      handleRefresh(); // Refresh after action
    } catch (err) {
      console.error('Failed to execute action:', err);
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
        <Typography variant="h5">My Workflow Dashboard</Typography>
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
            title="My Pending Requests"
            value={stats?.myPendingRequests || 0}
            icon={<RequestIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingApprovals || 0}
            icon={<PendingIcon fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Requests"
            value={stats?.approvedRequests || 0}
            icon={<ApproveIcon fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Response Time"
            value={stats?.avgResponseTime || '0h'}
            icon={<TimelineIcon fontSize="large" />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Request Status Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Request Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.requestDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.requestDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities.slice(0, 5).map((activity) => (
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
                      <TableCell>{activity.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Pending Approvals */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pending Approvals
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
                <TableCell>Step</TableCell>
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
                        onClick={() => handleActionDialogOpen('approve', request.currentStepId)}
                      >
                        <ApproveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleActionDialogOpen('reject', request.currentStepId)}
                      >
                        <RejectIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Request Changes">
                      <IconButton
                        size="small"
                        onClick={() => handleActionDialogOpen('request-changes', request.currentStepId)}
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

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={handleActionDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'approve' ? 'Approve Request' :
           actionDialog.type === 'reject' ? 'Reject Request' :
           'Request Changes'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={actionDialog.comment}
              onChange={(e) => setActionDialog(prev => ({
                ...prev,
                comment: e.target.value
              }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionDialogClose}>Cancel</Button>
          <Button
            onClick={handleActionSubmit}
            variant="contained"
            color={
              actionDialog.type === 'approve' ? 'success' :
              actionDialog.type === 'reject' ? 'error' :
              'primary'
            }
          >
            {actionDialog.type === 'approve' ? 'Approve' :
             actionDialog.type === 'reject' ? 'Reject' :
             'Request Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 