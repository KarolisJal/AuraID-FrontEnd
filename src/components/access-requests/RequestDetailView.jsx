import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Category as ResourceIcon,
  VpnKey as PermissionIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { accessRequestService } from '../../services/accessRequestService';
import { workflowApi } from '../../services/workflowApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const statusColors = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

const activityIcons = {
  CREATED: <TimeIcon color="primary" />,
  UPDATED: <TimeIcon color="info" />,
  APPROVED: <TimeIcon color="success" />,
  REJECTED: <TimeIcon color="error" />,
  CANCELLED: <TimeIcon color="default" />,
};

export const RequestDetailView = ({ requestId, onClose, onRequestUpdated }) => {
  const [request, setRequest] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      try {
        const [requestData, activitiesData] = await Promise.all([
          accessRequestService.getRequestById(requestId),
          workflowApi.getRequestActivities(requestId),
        ]);
        setRequest(requestData.data);
        setActivities(activitiesData.data);
      } catch (error) {
        console.error('Error fetching request details:', error);
        setError('Failed to load request details');
        toast.error('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const handleAction = async () => {
    try {
      if (actionType === 'approve') {
        await accessRequestService.approveRequest(requestId, comment);
        toast.success('Request approved successfully');
      } else if (actionType === 'reject') {
        await accessRequestService.rejectRequest(requestId, comment);
        toast.success('Request rejected successfully');
      } else if (actionType === 'cancel') {
        await accessRequestService.cancelRequest(requestId);
        toast.success('Request cancelled successfully');
      }
      
      if (onRequestUpdated) {
        onRequestUpdated();
      }
      setActionDialogOpen(false);
      setComment('');
    } catch (error) {
      console.error(`Error ${actionType}ing request:`, error);
      toast.error(`Failed to ${actionType} request`);
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
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Request not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Request Information Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Request Information
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <ResourceIcon />
            </ListItemIcon>
            <ListItemText
              primary="Resource"
              secondary={request.resourceName}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PermissionIcon />
            </ListItemIcon>
            <ListItemText
              primary="Permission"
              secondary={request.permissionName}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary="Requester"
              secondary={request.requesterName}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText
              primary="Justification"
              secondary={request.justification}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TimeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Status"
              secondary={
                <Chip
                  label={request.status}
                  color={statusColors[request.status]}
                  size="small"
                />
              }
            />
          </ListItem>
        </List>

        {/* Action Buttons */}
        {request.status === 'PENDING' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            {isAdmin && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setActionType('approve');
                    setActionDialogOpen(true);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setActionType('reject');
                    setActionDialogOpen(true);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {(user.id === request.requesterId) && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setActionType('cancel');
                  setActionDialogOpen(true);
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Activity Timeline Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activity Timeline
        </Typography>
        <Timeline>
          {activities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineSeparator>
                <TimelineDot color={
                  activity.type === 'APPROVED' ? 'success' :
                  activity.type === 'REJECTED' ? 'error' :
                  activity.type === 'CANCELLED' ? 'grey' :
                  'primary'
                }>
                  {activityIcons[activity.type]}
                </TimelineDot>
                {index < activities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="subtitle2">
                  {activity.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.actorName} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </Typography>
                {activity.comment && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {activity.comment}
                  </Typography>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve'
            ? 'Approve Request'
            : actionType === 'reject'
            ? 'Reject Request'
            : 'Cancel Request'}
        </DialogTitle>
        <DialogContent>
          {(actionType === 'approve' || actionType === 'reject') && (
            <TextField
              autoFocus
              margin="dense"
              label="Comment"
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAction}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 