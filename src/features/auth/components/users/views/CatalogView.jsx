import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  VpnKey as RoleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import StatusChip from './StatusChip';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const UserCard = ({ user, onEdit, onDelete, onStatusChange, onRoleChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    switch (action) {
      case 'edit':
        onEdit(user);
        break;
      case 'delete':
        onDelete(user);
        break;
      case 'roles':
        onRoleChange(user);
        break;
      default:
        break;
    }
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      elevation={2}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            src={user.avatar}
            alt={user.username}
            sx={{ width: 56, height: 56 }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <IconButton onClick={handleClick}>
            <MoreIcon />
          </IconButton>
        </Box>

        <Typography variant="h6" gutterBottom>
          {user.username}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {user.firstName} {user.lastName}
          </Typography>
        </Box>

        <StatusChip status={user.status} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" color="text.secondary" display="block">
          Created: {format(new Date(user.createdAt), 'MMM dd, yyyy')}
        </Typography>
        {user.lastActiveAt && (
          <Typography variant="caption" color="text.secondary" display="block">
            Last active: {format(new Date(user.lastActiveAt), 'MMM dd, yyyy HH:mm')}
          </Typography>
        )}
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('roles')}>
          <ListItemIcon>
            <RoleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Roles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>
    </MotionCard>
  );
};

const CatalogView = ({ users, onEdit, onDelete, onStatusChange, onRoleChange }) => {
  return (
    <Grid container spacing={3}>
      {users.map((user) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
          <UserCard
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onRoleChange={onRoleChange}
          />
        </Grid>
      ))}
    </Grid>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    status: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    lastActiveAt: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func.isRequired,
};

CatalogView.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape(UserCard.propTypes.user)).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onRoleChange: PropTypes.func.isRequired,
};

export default CatalogView; 