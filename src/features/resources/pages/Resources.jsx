import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { CreateResourceForm } from '../components/CreateResourceForm';
import { ResourceListView } from '../components/ResourceListView';
import { ResourcePermissionManager } from '../components/ResourcePermissionManager';
import { useResourceManagement } from '../hooks/useResourceManagement';

export const Resources = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const [dialogs, setDialogs] = useState({
    create: false,
    edit: false,
    delete: false,
    permissions: false
  });
  
  const [selectedResource, setSelectedResource] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const resourceManagement = useResourceManagement();
  const { deleteResource, createResource, updateResource } = resourceManagement;

  const handleOpenDialog = (dialog, resource = null) => {
    setSelectedResource(resource);
    setDialogs(prev => ({
      ...prev,
      [dialog]: true
    }));
  };

  const handleCloseDialog = (dialog) => {
    setDialogs(prev => ({
      ...prev,
      [dialog]: false
    }));
    if (dialog !== 'permissions') {
      setSelectedResource(null);
    }
  };

  const handleCreateSuccess = (resource) => {
    handleCloseDialog('create');
    setNotification({
      open: true,
      message: 'Resource created successfully',
      severity: 'success'
    });
  };

  const handleEditSuccess = (resource) => {
    handleCloseDialog('edit');
    setNotification({
      open: true,
      message: 'Resource updated successfully',
      severity: 'success'
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteResource(selectedResource.id);
      handleCloseDialog('delete');
      setNotification({
        open: true,
        message: 'Resource deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to delete resource',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Resource Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
        >
          Create Resource
        </Button>
      </Box>

      <ResourceListView
        onEdit={(resource) => handleOpenDialog('edit', resource)}
        onView={(resource) => handleOpenDialog('view', resource)}
        onDelete={(resource) => handleOpenDialog('delete', resource)}
        onManagePermissions={(resource) => handleOpenDialog('permissions', resource)}
      />

      {/* Create Resource Dialog */}
      <Dialog
        open={dialogs.create}
        onClose={() => handleCloseDialog('create')}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>Create New Resource</DialogTitle>
        <DialogContent>
          <CreateResourceForm 
            onSubmit={createResource} 
            onCancel={() => handleCloseDialog('create')}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog
        open={dialogs.edit}
        onClose={() => handleCloseDialog('edit')}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>Update Resource</DialogTitle>
        <DialogContent>
          {selectedResource && (
            <CreateResourceForm
              resource={selectedResource}
              onSubmit={(id, data) => updateResource(id, data)}
              onCancel={() => handleCloseDialog('edit')}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogs.delete}
        onClose={() => handleCloseDialog('delete')}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the resource "{selectedResource?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseDialog('delete')}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog
        open={dialogs.permissions}
        onClose={() => handleCloseDialog('permissions')}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>Manage Permissions</DialogTitle>
        <DialogContent>
          {selectedResource && (
            <ResourcePermissionManager
              resource={selectedResource}
              onClose={() => handleCloseDialog('permissions')}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseDialog('permissions')}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}; 