import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  ButtonGroup,
  Button,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import StatusChip from './StatusChip';

const SimpleTableView = ({
  users,
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

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'username'}
                direction={orderBy === 'username' ? order : 'asc'}
                onClick={createSortHandler('username')}
              >
                Username
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'email'}
                direction={orderBy === 'email' ? order : 'asc'}
                onClick={createSortHandler('email')}
              >
                Email
              </TableSortLabel>
            </TableCell>
            <TableCell>Status</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'createdAt'}
                direction={orderBy === 'createdAt' ? order : 'asc'}
                onClick={createSortHandler('createdAt')}
              >
                Created At
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <StatusChip status={user.status} />
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell align="right">
                <ButtonGroup size="small">
                  <Tooltip title="Edit User">
                    <Button
                      onClick={() => onEdit(user)}
                      startIcon={<EditIcon />}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <Button
                      onClick={() => onDelete(user)}
                      startIcon={<DeleteIcon />}
                      color="error"
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

SimpleTableView.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  orderBy: PropTypes.string.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func.isRequired,
};

export default SimpleTableView; 