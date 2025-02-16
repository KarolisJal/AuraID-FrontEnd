import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import PropTypes from 'prop-types';
import { TextField, Button } from '../../../../../components/common';
import { useUserEditForm } from '../../../hooks/useUserEditForm';
import { USER_ROLES } from '../../../constants/authConstants';
import { userApi } from '../../../../../services/api';
import { countries } from '../../../../../utils/constants/countries';
import { toast } from 'react-toastify';
import { AdminPanelSettings } from '@mui/icons-material';

const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED'
};

const USER_STATUS_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  BLOCKED: 'Blocked'
};

const EditUserDialog = ({ open, user, onClose, onSave }) => {
  const {
    formState: {
      values,
      errors,
      touched,
      isSubmitting,
      isValid,
      isDirty
    },
    handleChange,
    handleSubmit,
    resetForm
  } = useUserEditForm(user, onSave);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleStatusChange = async (newStatus) => {
    try {
      await userApi.updateUserStatus(user.username, newStatus);
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleRolesChange = async (event) => {
    const newRoles = event.target.value;
    
    if (newRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    try {
      await userApi.updateUserRoles(user.username, newRoles);
      handleChange(event); // Update form state
      toast.success('User roles updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user roles');
    }
  };

  if (!user) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { opacity: isSubmitting ? 0.7 : 1 }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit User - {user.username}</DialogTitle>
        <DialogContent>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                required
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                fullWidth
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                error={touched.firstName && Boolean(errors.firstName)}
                helperText={touched.firstName && errors.firstName}
                fullWidth
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
                fullWidth
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Country</InputLabel>
                <Select
                  name="country"
                  value={values.country}
                  onChange={handleChange}
                  label="Country"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                User Status
              </Typography>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={values.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  label="Status"
                >
                  {Object.keys(USER_STATUSES).map((status) => (
                    <MenuItem key={status} value={USER_STATUSES[status]}>
                      {USER_STATUS_LABELS[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                User Roles
              </Typography>
              <FormControl fullWidth required disabled={isSubmitting}>
                <InputLabel>Roles</InputLabel>
                <Select
                  name="roles"
                  multiple
                  value={values.roles}
                  onChange={handleRolesChange}
                  label="Roles"
                  startAdornment={<AdminPanelSettings sx={{ mr: 1 }} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={USER_ROLES[value]?.label}
                          size="small"
                          color={USER_ROLES[value]?.color}
                          sx={{ 
                            '& .MuiChip-label': { 
                              color: USER_ROLES[value]?.color === 'default' ? 'inherit' : 'white' 
                            } 
                          }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.entries(USER_ROLES).map(([key, role]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={role.label}
                          size="small"
                          color={role.color}
                          sx={{ 
                            mr: 1,
                            '& .MuiChip-label': { 
                              color: role.color === 'default' ? 'inherit' : 'white' 
                            } 
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Read-only fields */}
            <Grid item xs={6}>
              <TextField
                label="Created At"
                value={new Date(values.createdAt).toLocaleString()}
                InputProps={{ readOnly: true }}
                fullWidth
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Updated At"
                value={new Date(values.updatedAt).toLocaleString()}
                InputProps={{ readOnly: true }}
                fullWidth
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={!isValid || !isDirty || isSubmitting || !values.roles.length}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

EditUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    country: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditUserDialog; 