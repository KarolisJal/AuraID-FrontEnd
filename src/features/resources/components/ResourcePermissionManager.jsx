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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { PermissionType } from '../../../services/permissionApi';

const PERMISSION_TYPES = Object.values(PermissionType);

export const ResourcePermissionManager = ({ resource, onClose }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true
  });

  useEffect(() => {
    if (resource) {
      fetchPermissions();
    }
  }, [resource]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await permissionApi.getAllPermissions();
      setPermissions(response.data.content);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (permission = null) => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description,
        enabled: permission.enabled
      });
      setEditingPermission(permission);
    } else {
      setFormData({
        name: '',
        description: '',
        enabled: true
      });
      setEditingPermission(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPermission(null);
    setFormData({
      name: '',
      description: '',
      enabled: true
    });
  };

  const handleInputChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'enabled' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      if (editingPermission) {
        await permissionApi.updatePermission(editingPermission.id, formData);
      } else {
        await permissionApi.createPermission(formData);
      }
      await fetchPermissions();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to manage permission:', err);
      setError('Failed to save permission');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermission = async (permission) => {
    setLoading(true);
    try {
      await permissionApi.deletePermission(permission.id);
      await fetchPermissions();
    } catch (err) {
      console.error('Failed to delete permission:', err);
      setError('Failed to delete permission');
    } finally {
      setLoading(false);
    }
  };

  if (!resource) return null;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Permissions for {resource.name}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Permission
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Permission</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No permissions configured
                </TableCell>
              </TableRow>
            ) : (
              permissions.map(permission => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell>
                    <Switch
                      checked={permission.enabled}
                      onChange={() => {
                        const updatedPermission = {
                          ...permission,
                          enabled: !permission.enabled
                        };
                        permissionApi.updatePermission(permission.id, updatedPermission)
                          .then(() => fetchPermissions())
                          .catch(err => {
                            console.error('Failed to update permission status:', err);
                            setError('Failed to update permission status');
                          });
                      }}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Permission">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(permission)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Permission">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePermission(permission)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingPermission ? 'Edit Permission' : 'Add Permission'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Permission Type</InputLabel>
                <Select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  label="Permission Type"
                  required
                >
                  {PERMISSION_TYPES.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                required
                multiline
                rows={3}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleInputChange}
                  color="primary"
                />
                <Typography>Enabled</Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {editingPermission ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 