import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Tooltip,
  CircularProgress,
  Chip,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragHandle as DragHandleIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useWorkflowManagement } from '../hooks/useWorkflowManagement';
import { userApi } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const WORKFLOW_TYPES = [
  'SINGLE_APPROVER',
  'UNANIMOUS_APPROVAL',
  'PERCENTAGE_APPROVAL'
];

const STEP_TYPES = [
  'APPROVAL'
];

const APPROVER_ROLES = [
  'ADMIN',
  'MANAGER',
  'SUPERVISOR',
  'APPROVER'
];

export const WorkflowBuilder = ({ workflow, onSave, onCancel }) => {
  const { user } = useAuth();
  const {
    addWorkflowStep,
    updateWorkflowStep,
    deleteWorkflowStep,
    reorderWorkflowSteps,
    createWorkflow
  } = useWorkflowManagement();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [availableRoles] = useState(APPROVER_ROLES);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [roleError, setRoleError] = useState(null);

  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    type: workflow?.type || '',
    steps: workflow?.steps || []
  });

  const [stepDialog, setStepDialog] = useState({
    open: false,
    editingStep: null,
    data: {
      name: '',
      description: '',
      type: 'APPROVAL', // Set default type
      approverRole: '',
      approvers: [],
      order: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add handleInputChange function
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Fetch users when approver role changes
  useEffect(() => {
    const fetchUsers = async () => {
      const role = stepDialog.data.approverRole;
      console.log('Effect triggered with role:', role);
      
      if (!role) {
        console.log('No role selected, skipping user fetch');
        setUsers([]);
        return;
      }
      
      setLoadingUsers(true);
      setError(null);
      
      try {
        const response = await userApi.getUsersByRole(role);
        console.log('Users fetched:', response);
        
        if (response && Array.isArray(response)) {
          setUsers(response);
        } else {
          console.error('Invalid response format:', response);
          setUsers([]);
          setError('Failed to load users: Invalid response format');
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(`Failed to load users for role ${role}`);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [stepDialog.data.approverRole]);

  const handleStepDialogOpen = (step = null) => {
    setStepDialog({
      open: true,
      editingStep: step,
      data: step ? {
        ...step,
        type: step.type || 'APPROVAL',
        approverRole: step.approverRole || '',
        approvers: step.approvers || []
      } : {
        name: '',
        description: '',
        type: 'APPROVAL',
        approverRole: '',
        approvers: [],
        order: formData.steps.length
      }
    });
  };

  const handleStepDialogClose = () => {
    setStepDialog({
      open: false,
      editingStep: null,
      data: {
        name: '',
        description: '',
        type: 'APPROVAL',
        approverRole: '',
        approvers: [],
        order: 0
      }
    });
    setError(null);
  };

  const handleStepSave = async () => {
    try {
      const { data } = stepDialog;
      
      // Validate step data
      if (!data.name) throw new Error('Step name is required');
      if (!data.approverRole) throw new Error('Approver role is required');
      if (!data.approvers || data.approvers.length === 0) {
        throw new Error('At least one approver must be selected');
      }

      const stepData = {
        name: data.name,
        description: data.description || '',
        type: data.type,
        approverRole: data.approverRole,
        approvers: data.approvers,
        order: stepDialog.editingStep ? data.order : formData.steps.length
      };

      let updatedSteps;
      if (stepDialog.editingStep) {
        updatedSteps = formData.steps.map(step =>
          step.id === stepDialog.editingStep.id ? { ...step, ...stepData } : step
        );
      } else {
        updatedSteps = [...formData.steps, { ...stepData, id: Date.now() }];
      }

      setFormData(prev => ({
        ...prev,
        steps: updatedSteps
      }));

      handleStepDialogClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name) throw new Error('Workflow name is required');
      if (!formData.type) throw new Error('Workflow type is required');
      if (formData.steps.length === 0) throw new Error('At least one step is required');

      const workflowData = {
        name: formData.name,
        description: formData.description || '',
        type: formData.type,
        active: true,
        steps: formData.steps.map((step, index) => ({
          stepOrder: index + 1,
          name: step.name,
          description: step.description || '',
          approvalThreshold: formData.type === 'PERCENTAGE_APPROVAL' ? 100 : null,
          approverIds: step.approvers.map(approver => approver.id),
          active: true
        }))
      };

      console.log('Creating workflow with:', workflowData);
      if (workflow) {
        // If editing existing workflow
        await onSave(workflowData);
      } else {
        // If creating new workflow
        const response = await createWorkflow(workflowData);
        if (onSave) {
          onSave(response);
        }
      }
    } catch (err) {
      console.error('Error creating workflow:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="name"
            label="Workflow Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            error={!!error && !formData.name}
            helperText={error && !formData.name ? 'Name is required' : ''}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Workflow Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              label="Workflow Type"
            >
              {WORKFLOW_TYPES.map(type => (
                <MenuItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Steps</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleStepDialogOpen()}
            >
              Add Step
            </Button>
          </Box>

          <List>
            {formData.steps.map((step, index) => (
              <ListItem key={step.id || index} divider>
                <ListItemText
                  primary={step.name}
                  secondary={`${step.type} - ${step.approverRole} (${step.approvers.length} approvers)`}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleStepDialogOpen(step)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      steps: prev.steps.filter((s, i) => i !== index)
                    }));
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Dialog open={stepDialog.open} onClose={handleStepDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {stepDialog.editingStep ? 'Edit Step' : 'Add Step'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              name="name"
              label="Step Name"
              value={stepDialog.data.name}
              onChange={(e) => setStepDialog(prev => ({
                ...prev,
                data: { ...prev.data, name: e.target.value }
              }))}
              required
            />

            <TextField
              fullWidth
              name="description"
              label="Description"
              value={stepDialog.data.description}
              onChange={(e) => setStepDialog(prev => ({
                ...prev,
                data: { ...prev.data, description: e.target.value }
              }))}
              multiline
              rows={2}
            />

            <FormControl fullWidth required>
              <InputLabel>Approver Role</InputLabel>
              <Select
                name="approverRole"
                value={stepDialog.data.approverRole}
                onChange={(e) => setStepDialog(prev => ({
                  ...prev,
                  data: { ...prev.data, approverRole: e.target.value, approvers: [] }
                }))}
                label="Approver Role"
              >
                {APPROVER_ROLES.map(role => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {stepDialog.data.approverRole && (
              <FormControl fullWidth required>
                <InputLabel>Approvers</InputLabel>
                <Select
                  multiple
                  name="approvers"
                  value={stepDialog.data.approvers}
                  onChange={(e) => setStepDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, approvers: e.target.value }
                  }))}
                  label="Approvers"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value.id} label={value.username} />
                      ))}
                    </Box>
                  )}
                >
                  {loadingUsers ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                      Loading users...
                    </MenuItem>
                  ) : users.length === 0 ? (
                    <MenuItem disabled>
                      No users found for this role
                    </MenuItem>
                  ) : (
                    users.map((user) => (
                      <MenuItem key={user.id} value={user}>
                        {user.username}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {roleError && (
                  <FormHelperText error>{roleError}</FormHelperText>
                )}
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStepDialogClose}>Cancel</Button>
          <Button onClick={handleStepSave} variant="contained" color="primary">
            {stepDialog.editingStep ? 'Update Step' : 'Add Step'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 