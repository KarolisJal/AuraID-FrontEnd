import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import { ResourceType } from '../../../services/resourceApi';
import { useResourceManagement } from '../hooks/useResourceManagement';
import { useWorkflowManagement } from '../../workflows/hooks/useWorkflowManagement';

const resourceTypeFields = {
  [ResourceType.APPLICATION]: [
    { name: 'url', label: 'Application URL', required: true },
    { name: 'authDetails', label: 'Authentication Details', multiline: true }
  ],
  [ResourceType.FOLDER]: [
    { name: 'path', label: 'File System Path', required: true }
  ],
  [ResourceType.SYSTEM]: [
    { name: 'systemId', label: 'System Identifier', required: true },
    { name: 'networkDetails', label: 'Network Details', multiline: true }
  ],
  [ResourceType.DATABASE]: [
    { name: 'connectionString', label: 'Connection String', required: true },
    { name: 'schema', label: 'Schema/Table Specifications', multiline: true }
  ],
  [ResourceType.API]: [
    { name: 'endpoint', label: 'API Endpoint', required: true },
    { name: 'documentation', label: 'API Documentation URL' }
  ],
  [ResourceType.NETWORK_RESOURCE]: [
    { name: 'location', label: 'Network Location', required: true },
    { name: 'securityDetails', label: 'VPN/Security Details', multiline: true }
  ]
};

export const CreateResourceForm = ({ onSubmit, onCancel, resource }) => {
  const { createResource } = useResourceManagement();
  const { workflows, fetchWorkflows } = useWorkflowManagement();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    path: '',
    workflowId: '',
    enabled: true,
    // Type-specific fields will be added dynamically
  });

  // Fetch available workflows when component mounts
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        if (mounted) {
          // Fetch workflows and resources concurrently
          await Promise.all([
            fetchWorkflows(0),
            // Add any other necessary data fetching here
          ]);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        if (mounted) {
          setError('Failed to load required data. Please try again.');
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []); // Dependencies array empty to load only once

  // If editing, populate form with resource data
  useEffect(() => {
    if (resource) { // resource prop for editing
      console.log('Populating form with resource data:', resource); // Add debug log
      setFormData({
        name: resource.name || '',
        description: resource.description || '',
        type: resource.type || '',
        path: resource.path || '',
        workflowId: resource.workflowId || '', // Ensure workflowId is properly set
        enabled: resource.enabled !== false,
        ...(resource.type && {
          url: resource.url,
          systemId: resource.systemId,
          connectionString: resource.connectionString,
          endpoint: resource.endpoint,
          location: resource.location,
          authDetails: resource.authDetails,
          networkDetails: resource.networkDetails,
          schema: resource.schema,
          documentation: resource.documentation,
          securityDetails: resource.securityDetails
        })
      });
    }
  }, [resource]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);

    // If changing type, reset all type-specific fields but preserve other fields
    if (name === 'type') {
      const typeFields = resourceTypeFields[value] || [];
      const resetFields = {};
      typeFields.forEach(field => {
        resetFields[field.name] = '';
      });
      setFormData(prev => ({
        ...prev,
        [name]: value,
        path: prev.path,
        enabled: prev.enabled,
        workflowId: prev.workflowId,
        ...resetFields
      }));
    }
  };

  const getTypeSpecificFields = () => {
    if (!formData.type) return null;
    
    const fields = resourceTypeFields[formData.type] || [];
    return fields.map(field => (
      <Grid item xs={12} key={field.name}>
        <TextField
          fullWidth
          name={field.name}
          label={field.label}
          value={formData[field.name] || ''}
          onChange={handleChange}
          required={field.required}
          multiline={field.multiline}
          rows={field.multiline ? 4 : 1}
          error={!!error && field.required && !formData[field.name]}
          helperText={
            error && field.required && !formData[field.name]
              ? `${field.label} is required`
              : ''
          }
        />
      </Grid>
    ));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create the resource data
      const resourceData = {
        ...formData,
        workflowId: formData.workflowId ? formData.workflowId.toString() : null, // Ensure workflowId is string or null
        enabled: formData.enabled
      };

      console.log('Submitting resource data:', resourceData); // Add debug log

      // Map path to type-specific field if needed
      if (formData.type === ResourceType.APPLICATION) {
        resourceData.url = formData.path;
      } else if (formData.type === ResourceType.FOLDER) {
        // path is already set
      } else if (formData.type === ResourceType.SYSTEM) {
        resourceData.systemId = formData.path;
      } else if (formData.type === ResourceType.DATABASE) {
        resourceData.connectionString = formData.path;
      } else if (formData.type === ResourceType.API) {
        resourceData.endpoint = formData.path;
      } else if (formData.type === ResourceType.NETWORK_RESOURCE) {
        resourceData.location = formData.path;
      }

      let response;
      if (resource?.id) {
        // Update existing resource
        console.log('Updating resource with ID:', resource.id, 'Data:', resourceData); // Add debug log
        response = await onSubmit(resource.id, resourceData);
      } else {
        // Create new resource
        console.log('Creating new resource with data:', resourceData); // Add debug log
        response = await onSubmit(resourceData);
      }
      
      // Only reset form for new resource creation
      if (!resource) {
        setFormData({
          name: '',
          description: '',
          type: '',
          path: '',
          workflowId: '',
          enabled: true
        });
      }
      
    } catch (err) {
      console.error('Error creating/updating resource:', err);
      setError(err.message || 'Failed to create/update resource');
    } finally {
      setLoading(false);
    }
  };

  // Update the path field label based on resource type
  const getPathLabel = () => {
    switch (formData.type) {
      case ResourceType.APPLICATION:
        return 'Application URL';
      case ResourceType.FOLDER:
        return 'File System Path';
      case ResourceType.SYSTEM:
        return 'System Identifier';
      case ResourceType.DATABASE:
        return 'Connection String';
      case ResourceType.API:
        return 'API Endpoint';
      case ResourceType.NETWORK_RESOURCE:
        return 'Network Location';
      default:
        return 'Resource Path';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {resource ? 'Update Resource' : 'Create Resource'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="name"
              label="Resource Name"
              value={formData.name}
              onChange={handleChange}
              required
              error={!!error && !formData.name}
              helperText={error && !formData.name ? 'Name is required' : ''}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required error={!!error && !formData.type}>
              <InputLabel>Resource Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Resource Type"
              >
                {Object.values(ResourceType).map(type => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
              {error && !formData.type && (
                <FormHelperText>Resource type is required</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="path"
              label={getPathLabel()}
              value={formData.path}
              onChange={handleChange}
              required
              error={!!error && !formData.path}
              helperText={error && !formData.path ? `${getPathLabel()} is required` : ''}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Approval Workflow</InputLabel>
              <Select
                name="workflowId"
                value={formData.workflowId}
                onChange={handleChange}
                label="Approval Workflow"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {workflows.map(workflow => (
                  <MenuItem key={workflow.id} value={workflow.id}>
                    {workflow.name} ({workflow.type})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select an approval workflow for this resource (optional)
              </FormHelperText>
            </FormControl>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : resource ? 'Update Resource' : 'Create Resource'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}; 