import React, { useState } from 'react';
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
  TextField,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as RolesIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { useUserQueries } from '../../../hooks/queries/useUserQueries';
import PropTypes from 'prop-types';

const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'LOCKED'];

export const UserList = ({
  onEdit,
  onDelete,
  onManageRoles,
  onToggleStatus
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState({
    search: '',
    status: ''
  });

  const { useUsers, useDeleteUser, useUpdateUserStatus } = useUserQueries();
  const { data, isLoading, error } = useUsers({ page, size: rowsPerPage });
  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (user) => {
    try {
      await deleteUser.mutateAsync(user.id);
      if (onDelete) {
        onDelete(user);
      }
    } catch (error) {
      console.error('Delete user error:', error);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateStatus.mutateAsync({ userId: user.id, status: newStatus });
      if (onToggleStatus) {
        onToggleStatus(user, newStatus);
      }
    } catch (error) {
      console.error('Toggle user status error:', error);
    }
  };

  const filteredUsers = React.useMemo(() => {
    if (!Array.isArray(data?.content)) {
      console.warn('Users data is not an array:', data);
      return [];
    }
    
    return data.content.filter(user => {
      if (!user) return false;
      
      const searchMatch = filter.search.toLowerCase();
      const username = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const status = user.status || '';
      
      return (
        (filter.status === '' || status === filter.status) &&
        (username.includes(searchMatch) || email.includes(searchMatch))
      );
    });
  }, [data?.content, filter]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" align="center">
          {error.message || 'Failed to load users'}
        </Typography>
      </Box>
    );
  }

  if (!Array.isArray(data?.content) || data.content.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="textSecondary" align="center">
          No users found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          name="search"
          label="Search Users"
          variant="outlined"
          value={filter.search}
          onChange={handleFilterChange}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={filter.status}
            onChange={handleFilterChange}
            label="Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            {USER_STATUSES.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {user.roles?.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    size="small"
                    color={user.status === 'ACTIVE' ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit User">
                      <IconButton
                        size="small"
                        onClick={() => onEdit?.(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Roles">
                      <IconButton
                        size="small"
                        onClick={() => onManageRoles?.(user)}
                      >
                        <RolesIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(user)}
                        color={user.status === 'ACTIVE' ? 'error' : 'success'}
                      >
                        {user.status === 'ACTIVE' ? <BlockIcon /> : <ActiveIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.totalElements || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

UserList.propTypes = {
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onManageRoles: PropTypes.func,
  onToggleStatus: PropTypes.func
};

UserList.defaultProps = {
  onEdit: () => {},
  onDelete: () => {},
  onManageRoles: () => {},
  onToggleStatus: () => {}
}; 