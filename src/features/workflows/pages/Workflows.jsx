import React, { useState, useCallback } from 'react';
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
import { WorkflowBuilder } from '../components/WorkflowBuilder';
import { useWorkflowManagement } from '../hooks/useWorkflowManagement';
import { useAuth } from '../../../contexts/AuthContext';
import { WorkflowList } from '../components/WorkflowList';
import { Navigate } from 'react-router-dom';

export const Workflows = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const {
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    loading: workflowLoading
  } = useWorkflowManagement();
  
  const [dialogs, setDialogs] = useState({
    create: false,
    edit: false,
    delete: false,
    view: false,
    assign: false
  });
  
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpenDialog = useCallback((dialog, workflow = null) => {
    setSelectedWorkflow(workflow);
    setDialogs(prev => ({
      ...prev,
      [dialog]: true
    }));
  }, []);

  const handleCloseDialog = useCallback((dialog) => {
    setDialogs(prev => ({
      ...prev,
      [dialog]: false
    }));
    setSelectedWorkflow(null);
  }, []);

  const handleCreateSuccess = useCallback(async (workflowData) => {
    try {
      await createWorkflow(workflowData);
      handleCloseDialog('create');
      setNotification({
        open: true,
        message: 'Workflow created successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to create workflow',
        severity: 'error'
      });
    }
  }, [createWorkflow]);

  const handleEditSuccess = useCallback(async (workflowData) => {
    try {
      await updateWorkflow(selectedWorkflow.id, workflowData);
      handleCloseDialog('edit');
      setNotification({
        open: true,
        message: 'Workflow updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to update workflow',
        severity: 'error'
      });
    }
  }, [selectedWorkflow, updateWorkflow]);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteWorkflow(selectedWorkflow.id);
      handleCloseDialog('delete');
      setNotification({
        open: true,
        message: 'Workflow deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to delete workflow',
        severity: 'error'
      });
    }
  }, [selectedWorkflow, deleteWorkflow]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Workflow Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
        >
          Create Workflow
        </Button>
      </Box>

      <WorkflowList
        onEdit={(workflow) => handleOpenDialog('edit', workflow)}
        onView={(workflow) => handleOpenDialog('view', workflow)}
        onDelete={(workflow) => handleOpenDialog('delete', workflow)}
        onAssign={(workflow) => handleOpenDialog('assign', workflow)}
      />

      {/* Create Workflow Dialog */}
      <Dialog
        open={dialogs.create}
        onClose={() => handleCloseDialog('create')}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <WorkflowBuilder
            onSave={handleCreateSuccess}
            onCancel={() => handleCloseDialog('create')}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog
        open={dialogs.edit}
        onClose={() => handleCloseDialog('edit')}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle>Edit Workflow</DialogTitle>
        <DialogContent>
          {selectedWorkflow && (
            <WorkflowBuilder
              workflow={selectedWorkflow}
              onSave={handleEditSuccess}
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
        <DialogTitle>Delete Workflow</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the workflow "{selectedWorkflow?.name}"?
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

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}; 