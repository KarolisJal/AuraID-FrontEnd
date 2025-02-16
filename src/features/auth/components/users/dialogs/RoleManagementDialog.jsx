import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from '@mui/material';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../../components/common/Button/Button';

const AVAILABLE_ROLES = [
  { id: 'ROLE_ADMIN', label: 'Administrator', description: 'Full system access' },
  { id: 'ROLE_MANAGER', label: 'Manager', description: 'Can manage users and content' },
  { id: 'ROLE_USER', label: 'User', description: 'Basic access rights' },
];

const RoleManagementDialog = ({ open, user, onClose, onSave }) => {
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.roles) {
      setSelectedRoles(new Set(user.roles));
    }
  }, [user]);

  const handleRoleToggle = (roleId) => {
    const newSelectedRoles = new Set(selectedRoles);
    if (newSelectedRoles.has(roleId)) {
      newSelectedRoles.delete(roleId);
    } else {
      newSelectedRoles.add(roleId);
    }
    setSelectedRoles(newSelectedRoles);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(user.username, Array.from(selectedRoles));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Manage Roles - {user.username}
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          {AVAILABLE_ROLES.map((role) => (
            <Box key={role.id} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedRoles.has(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1">{role.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          loading={loading}
          disabled={selectedRoles.size === 0}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

RoleManagementDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default RoleManagementDialog; 