import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accessRequestService } from '../../services/accessRequestService';
import { workflowApi } from '../../services/workflowApi';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default'
};

export const AccessRequestList = ({ 
  type = 'my-requests', 
  requests: providedRequests = null,
  onRequestUpdated,
  onViewRequest,
  loading: externalLoading,
  isAdmin,
  user
}) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState(null);
  const [requestsWithDetails, setRequestsWithDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Query for fetching requests
  const {
    data: requestsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['access-requests', type, page, rowsPerPage],
    queryFn: async () => {
      const response = await accessRequestService.getRequests(type, page, rowsPerPage);
      return response.data;
    },
    enabled: !providedRequests, // Only fetch if requests are not provided externally
    keepPreviousData: true
  });

  // Mutations for request actions
  const approveMutation = useMutation({
    mutationFn: async ({ id, comment }) => {
      await accessRequestService.approveRequest(id, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['access-requests']);
      queryClient.refetchQueries({queryKey: ['access-requests']});
      toast.success('Request approved successfully');
      handleDialogClose();
      if (onRequestUpdated) onRequestUpdated();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve request');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, comment }) => {
      await accessRequestService.rejectRequest(id, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['access-requests']);
      queryClient.refetchQueries({queryKey: ['access-requests']});
      toast.success('Request rejected successfully');
      handleDialogClose();
      if (onRequestUpdated) onRequestUpdated();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject request');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await accessRequestService.cancelRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['access-requests']);
      queryClient.refetchQueries({queryKey: ['access-requests']});
      toast.success('Request cancelled successfully');
      handleDialogClose();
      if (onRequestUpdated) onRequestUpdated();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel request');
    }
  });

  // Fetch details for requests that don't have them
  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!providedRequests || providedRequests.length === 0) return;

      console.log('Initial request data:', providedRequests);

      // Transform the existing requests to match our expected format
      const transformedRequests = providedRequests.map(req => {
        console.log('Processing request:', req);
        return {
          id: req.id || req.requestId,
          status: req.status,
          resource: {
            name: req.resource?.name || req.resourceName || (req.resource ? req.resource : 'Unknown Resource'),
            type: req.resource?.type || req.resourceType || 'Unknown Type'
          },
          permission: {
            name: req.permission?.name || req.permissionName || (req.permission ? req.permission : 'Unknown Permission')
          },
          requester: req.requester || req.requesterName || 'Unknown User',
          workflow: {
            name: req.workflow?.name || req.workflowName || 'Unknown Workflow'
          },
          currentStep: req.currentStep ? {
            name: req.currentStep.name || req.currentStepName,
            order: req.currentStep.order || req.currentStepOrder || 0,
            total: req.currentStep.total || req.totalSteps || 1
          } : {
            name: 'Initial Step',
            order: 0,
            total: 1
          },
          createdAt: req.createdAt,
          pendingApprovers: req.pendingApprovers || [],
          recentActions: req.recentActions || []
        };
      });

      console.log('Transformed requests:', transformedRequests);
      setRequestsWithDetails(transformedRequests);
      setLoadingDetails(false);
    };

    fetchRequestDetails();
  }, [providedRequests]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (request, actionType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setComment('');
    setAction(null);
  };

  const handleActionConfirm = async () => {
    try {
      switch (action) {
        case 'approve':
          await approveMutation.mutateAsync({ id: selectedRequest.id, comment });
          break;
        case 'reject':
          await rejectMutation.mutateAsync({ id: selectedRequest.id, comment });
          break;
        case 'cancel':
          await cancelMutation.mutateAsync(selectedRequest.id);
          break;
        default:
          console.error('Invalid action:', action);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error(`Error ${action}ing request:`, error);
    }
  };

  // Show loading state
  if (externalLoading || isLoading || loadingDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography color="error">{error.message || 'Failed to load requests'}</Typography>
        <Button 
          onClick={() => queryClient.invalidateQueries(['access-requests'])} 
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const requests = requestsWithDetails.length > 0 ? requestsWithDetails : (providedRequests || requestsData?.content || []);
  const totalElements = providedRequests ? requests.length : (requestsData?.totalElements || 0);

  // Show empty state
  if (!requests || requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography color="textSecondary">
          No access requests found.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Resource</TableCell>
            <TableCell>Permission</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Requested</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.id}</TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {request.resource?.name || 'Unknown Resource'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {request.resource?.type || 'Unknown Type'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {request.permission?.name || 'Unknown Permission'}
                  </Typography>
                  {request.currentStep && (
                    <Typography variant="caption" color="textSecondary">
                      {request.currentStep.order > 0 
                        ? `Step ${request.currentStep.order} of ${request.currentStep.total}`
                        : 'Pending Start'}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={request.status || 'UNKNOWN'} 
                  color={statusColors[request.status] || 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {request.createdAt ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true }) : 'Unknown date'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    by {request.requester || 'Unknown User'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {onViewRequest && (
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => onViewRequest(request.id)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {request.status === 'PENDING' && isAdmin && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleActionClick(request, 'approve')}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleActionClick(request, 'reject')}
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {request.status === 'PENDING' && request.requester === user?.username && (
                    <Tooltip title="Cancel Request">
                      <IconButton
                        size="small"
                        color="default"
                        onClick={() => handleActionClick(request, 'cancel')}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!providedRequests && (
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
      
      {/* Action Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {action === 'approve'
            ? 'Approve Request'
            : action === 'reject'
            ? 'Reject Request'
            : 'Cancel Request'}
        </DialogTitle>
        <DialogContent>
          {(action === 'approve' || action === 'reject') && (
            <TextField
              autoFocus
              margin="dense"
              label="Comment"
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={action !== 'cancel'}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleActionConfirm}
            color={action === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={
              approveMutation.isLoading ||
              rejectMutation.isLoading ||
              cancelMutation.isLoading
            }
          >
            {(approveMutation.isLoading ||
              rejectMutation.isLoading ||
              cancelMutation.isLoading) ? (
              <CircularProgress size={24} />
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}; 