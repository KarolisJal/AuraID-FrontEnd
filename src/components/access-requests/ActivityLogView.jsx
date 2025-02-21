import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Info as InfoIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { workflowApi } from '../../services/workflowApi';
import { toast } from 'react-toastify';

const activityTypeColors = {
  CREATED: 'primary',
  UPDATED: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

export const ActivityLogView = ({ onViewRequest }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const response = await workflowApi.getAdminActivities(page, rowsPerPage);
        setActivities(response.data.content || []);
        setTotalElements(response.data.totalElements || 0);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('Failed to load activity log');
        toast.error('Failed to load activity log');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Activity Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <Chip
                    label={activity.type}
                    color={activityTypeColors[activity.type]}
                    size="small"
                    icon={<TimeIcon />}
                  />
                </TableCell>
                <TableCell>{activity.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    {activity.actorName}
                  </Box>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </TableCell>
                <TableCell align="right">
                  {activity.requestId && (
                    <Tooltip title="View Request Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewRequest(activity.requestId)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}; 