import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Paper,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as RequestIcon,
  AccessTime as PendingIcon,
  CheckCircle as ApproveIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { AccessRequestList } from '../../../components/access-requests/AccessRequestList';
import { AccessRequestForm } from '../../../components/access-requests/AccessRequestForm';
import { RequestDetailView } from '../../../components/access-requests/RequestDetailView';
import { ActivityLogView } from '../../../components/access-requests/ActivityLogView';
import { useAuth } from '../../../contexts/AuthContext';
import { useDashboard } from '../../../contexts/DashboardContext';
import { resourceApi } from '../../../services/resourceApi';
import { permissionApi, PermissionType } from '../../../services/permissionApi';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { toast } from 'react-toastify';
import { useDashboardQueries } from '../../../hooks/queries/useDashboardQueries';
import { accessRequestService } from '../../../services/accessRequestService';
import { api } from '../../../services/api';
import { workflowApi } from '../../../services/workflowApi';

const MotionPaper = motion(Paper);
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
      {typeof value === 'object' && value.data ? value.data : value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
  </Paper>
);

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`access-request-tabpanel-${index}`}
      aria-labelledby={`access-request-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const REFRESH_INTERVAL = 300000; // 5 minutes

export const AccessRequests = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');
  const { useDashboardData, useAdminStats, useUserStats } = useDashboardQueries(isAdmin);

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
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

  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [resources, setResources] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Transform dashboard data for the list components
  const transformedData = {
    activities: dashboardData?.recentActivities || [],
    stats: dashboardData?.stats || {}
  };

  // Move fetchRequests outside useEffect so we can reuse it
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      console.log('Fetching requests for tab:', tabValue, 'isAdmin:', isAdmin);
      
      const response = await accessRequestService.getRequests(
        tabValue === 0 ? 'all' : 'pending',
        0,
        10,
        'createdAt,desc',
        isAdmin
      );

      console.log('Response from server:', response);
      console.log('Response data content:', response.data?.content);

      if (response?.data?.content) {
        const requestsData = response.data.content.filter(request => {
          const isValid = request && request.id;
          if (!isValid) {
            console.log('Filtering out invalid request:', request);
          }
          return isValid;
        });
        console.log('Filtered requests data:', requestsData);
        console.log('Individual requests:', requestsData.map(r => ({
          id: r.id,
          status: r.status,
          resource: r.resource?.name,
          permission: r.permission?.name
        })));
        setRequests(requestsData);
      } else {
        console.warn('Unexpected response format:', response);
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      const errorMessage = err.response?.status === 403 
        ? 'You do not have permission to view these requests'
        : 'Failed to fetch requests. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch requests when tab changes
  useEffect(() => {
    fetchRequests();
  }, [tabValue, isAdmin]);

  // Set up periodic refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchDashboard();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [refetchDashboard]);

  // Fetch resources and permissions only when dialog opens
  useEffect(() => {
    let mounted = true;
    let abortController = new AbortController();

    const fetchResourcesAndPermissions = async () => {
      if (!dialogOpen) return;
      
      setResourcesLoading(true);
      setError(null);
      
      try {
        const [resourcesResponse, permissionsResponse] = await Promise.all([
          resourceApi.getAllResources(0, 10, { signal: abortController.signal }),
          permissionApi.getAllPermissions(0, 10, { signal: abortController.signal })
        ]);

        if (mounted) {
          // Create base permissions from PermissionType enum
          const basePermissions = Object.entries(PermissionType).map(([name], index) => ({
            id: index + 1,
            name,
            description: `Permission to ${name.toLowerCase()} resources`,
            enabled: true
          }));
          
          setResources(resourcesResponse?.data?.content || []);
          setPermissions(basePermissions);
          setError(null);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        if (mounted) {
          const errorMessage = err.response?.status === 403 
            ? 'You do not have permission to view resources and permissions'
            : 'Failed to load resources and permissions';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (mounted) {
          setResourcesLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchResourcesAndPermissions();
    }, 100);

    return () => {
      mounted = false;
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [dialogOpen]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleRequestSubmitted = () => {
    handleCloseDialog();
    // Refetch both dashboard data and requests
    refetchDashboard();
    // Trigger a new request fetch
    fetchRequests();
  };

  const handleViewRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedRequestId(null);
  };

  // Show loading state
  if (isDashboardLoading || isAdminLoading || isUserLoading || resourcesLoading || requestsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error || dashboardError || adminError || userError) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || dashboardError?.message || adminError?.message || userError?.message}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setError(null);
            refetchDashboard();
          }}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Show any errors at the top */}
      {(error || dashboardError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || dashboardError?.message}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              elevation={3}
              sx={{ p: 3, textAlign: 'center' }}
            >
              <RequestIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{transformedData.stats.totalRequests}</Typography>
              <Typography color="textSecondary">Total Requests</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              elevation={3}
              sx={{ p: 3, textAlign: 'center' }}
            >
              <PendingIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{transformedData.stats.pendingRequests}</Typography>
              <Typography color="textSecondary">Pending</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              elevation={3}
              sx={{ p: 3, textAlign: 'center' }}
            >
              <ApproveIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{transformedData.stats.approvedRequests}</Typography>
              <Typography color="textSecondary">Approved</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              elevation={3}
              sx={{ p: 3, textAlign: 'center' }}
            >
              <TimelineIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{`${transformedData.stats.averageApprovalTime}h`}</Typography>
              <Typography color="textSecondary">Avg. Processing Time</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Access Requests
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={resourcesLoading}
          >
            New Request
          </Button>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Requests" />
            <Tab label="Pending" />
            <Tab label="Activity Log" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <AccessRequestList
                type="all"
                requests={requests}
                onViewRequest={handleViewRequest}
                loading={requestsLoading}
                isAdmin={isAdmin}
                user={user}
              />
            )}
            {tabValue === 1 && (
              <AccessRequestList
                type="pending"
                requests={requests}
                onViewRequest={handleViewRequest}
                loading={requestsLoading}
                isAdmin={isAdmin}
                user={user}
              />
            )}
            {tabValue === 2 && (
              <ActivityLogView 
                activities={transformedData.activities}
                loading={isDashboardLoading}
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* New Request Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <AccessRequestForm
            onSubmit={handleRequestSubmitted}
            onCancel={handleCloseDialog}
            resources={resources}
            permissions={permissions}
            loading={resourcesLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Request Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedRequestId && (
            <RequestDetailView
              requestId={selectedRequestId}
              onClose={handleCloseDetailDialog}
              onRequestUpdated={() => {
                refetchDashboard();
                handleCloseDetailDialog();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}; 