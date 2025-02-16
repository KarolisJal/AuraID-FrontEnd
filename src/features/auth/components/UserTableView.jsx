import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Typography,
  Skeleton,
} from '@mui/material';
import UserStatusChip from './UserStatusChip';
import UserActionCell from './UserActionCell';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const UserTableView = ({
  users,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
  orderBy,
  order,
  onSort,
}) => {
  const createSortHandler = (property) => () => {
    onSort(property);
  };

  const renderTableHeader = (id, label) => (
    <TableCell key={id}>
      <TableSortLabel
        active={orderBy === id}
        direction={orderBy === id ? order : 'asc'}
        onClick={createSortHandler(id)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  const headers = [
    { id: 'username', label: 'Username' },
    { id: 'email', label: 'Email' },
    { id: 'fullName', label: 'Full Name' },
    { id: 'status', label: 'Status' },
    { id: 'roles', label: 'Roles' },
    { id: 'createdAt', label: 'Created' },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header.id}>{header.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header.id}>
                    <Skeleton animation="wave" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!users.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No users found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header) =>
              header.sortable === false ? (
                <TableCell key={header.id}>{header.label}</TableCell>
              ) : (
                renderTableHeader(header.id, header.label)
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.username}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {`${user.firstName} ${user.lastName}`}
              </TableCell>
              <TableCell>
                <UserStatusChip status={user.status} />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {user.roles?.map((role) => (
                    <Typography
                      key={role}
                      variant="caption"
                      sx={{
                        bgcolor: 'action.selected',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {role.replace('ROLE_', '')}
                    </Typography>
                  ))}
                </Box>
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), 'PP')}
              </TableCell>
              <TableCell>
                <UserActionCell
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

UserTableView.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  orderBy: PropTypes.string,
  order: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
};

export default UserTableView; 