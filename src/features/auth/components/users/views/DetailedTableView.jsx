import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Box,
  Typography,
  Chip,
  Grid,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  VpnKey as RoleIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import StatusChip from './StatusChip';
import { countries } from '../../../../../utils/constants/countries';
import { userApi } from '../../../../../services/api';

const DetailedTableView = ({ users, onEdit, onDelete, onStatusChange }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [userDetails, setUserDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [errorDetails, setErrorDetails] = useState({});

  const getCountryName = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  const fetchUserDetails = useCallback(async (user) => {
    setLoadingDetails(prev => ({ ...prev, [user.id]: true }));
    setErrorDetails(prev => ({ ...prev, [user.id]: null }));
    try {
      // Use the user object we already have as a fallback if the fetch fails
      setUserDetails(prev => ({ ...prev, [user.id]: user }));
      
      const response = await userApi.getUser(user.id);
      setUserDetails(prev => ({ ...prev, [user.id]: response.data }));
    } catch (error) {
      console.error('Error fetching user details:', error);
      setErrorDetails(prev => ({ 
        ...prev, 
        [user.id]: error.response?.data?.message || 'Failed to load user details'
      }));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [user.id]: false }));
    }
  }, []);

  const toggleRow = async (user) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(user.id)) {
      newExpandedRows.delete(user.id);
    } else {
      newExpandedRows.add(user.id);
      if (!userDetails[user.id]) {
        await fetchUserDetails(user);
      }
    }
    setExpandedRows(newExpandedRows);
  };

  const renderExpandedContent = (user) => {
    const details = userDetails[user.id];
    const isLoading = loadingDetails[user.id];
    const error = errorDetails[user.id];

    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">
            {error}
          </Typography>
        </Box>
      );
    }

    if (!details) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No details available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom color="primary">
            Personal Information
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Full Name: {`${details.firstName || '-'} ${details.lastName || '-'}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Email: {details.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Country: {details.country ? getCountryName(details.country) : '-'}
            </Typography>
          </Box>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom color="primary">
            Account Information
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Created: {format(new Date(details.createdAt), 'MMM dd, yyyy HH:mm')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Last Updated: {format(new Date(details.updatedAt), 'MMM dd, yyyy HH:mm')}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <RoleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Roles: {details.roles.join(', ')}
            </Typography>
          </Box>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton
              size="small"
              onClick={() => onEdit(details)}
              color="primary"
              title="Edit user"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onStatusChange(details)}
              color="warning"
              title="Change status"
            >
              <BlockIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(details)}
              color="error"
              title="Delete user"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>User Info</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell>Last Active</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <React.Fragment key={user.id}>
              <TableRow hover>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => toggleRow(user)}
                    aria-label={expandedRows.has(user.id) ? "Show less" : "Show more"}
                  >
                    {expandedRows.has(user.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2">{user.username}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusChip status={user.status} />
                </TableCell>
                <TableCell>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      icon={<RoleIcon />}
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {user.lastActiveAt ? 
                    format(new Date(user.lastActiveAt), 'MMM dd, yyyy HH:mm') :
                    'Never'
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                  <Collapse in={expandedRows.has(user.id)} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 2 }}>
                      {renderExpandedContent(user)}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

DetailedTableView.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      roles: PropTypes.arrayOf(PropTypes.string).isRequired,
      lastActiveAt: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default DetailedTableView; 