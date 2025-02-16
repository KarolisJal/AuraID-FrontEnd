import { useState } from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ManageAccounts as ManageAccountsIcon,
} from '@mui/icons-material';
import { USER_STATUSES } from './UserStatusChip';
import PropTypes from 'prop-types';

const UserActionCell = ({ user, onEdit, onDelete, onStatusChange }) => {
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const isStatusMenuOpen = Boolean(statusMenuAnchor);

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <ButtonGroup size="small" variant="outlined">
        <Tooltip title="Edit User Details">
          <Button
            onClick={() => onEdit(user)}
            startIcon={<EditIcon />}
            color="primary"
          >
            Edit
          </Button>
        </Tooltip>
        
        <Tooltip title="Manage Status">
          <Button
            onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
            startIcon={<ManageAccountsIcon />}
            color="info"
          >
            Status
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

      <Menu
        anchorEl={statusMenuAnchor}
        open={isStatusMenuOpen}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {Object.entries(USER_STATUSES).map(([status, { label, icon: Icon, color }]) => (
          <MenuItem
            key={status}
            onClick={() => {
              onStatusChange(user.username, status);
              handleStatusMenuClose();
            }}
            selected={user.status === status}
          >
            <ListItemIcon>
              <Icon color={color} fontSize="small" />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

UserActionCell.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default UserActionCell; 