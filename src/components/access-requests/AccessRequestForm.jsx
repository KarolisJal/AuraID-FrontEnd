import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import { accessRequestService } from '../../services/accessRequestService';
import { PermissionTypeId } from '../../services/permissionApi';
import { toast } from 'react-toastify';

/**
 * @typedef {Object} AccessRequest
 * @property {number} resourceId
 * @property {number} permissionId - Numeric ID (1 for READ, 2 for WRITE, etc.)
 * @property {string} justification
 */

export const AccessRequestForm = ({ resources, permissions, onRequestSubmitted }) => {
  const [formData, setFormData] = useState({
    resourceId: '',
    permissionId: '',
    justification: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.resourceId || !formData.permissionId || !formData.justification) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Find the selected permission from the permissions array
      const selectedPermission = permissions?.find(p => p.name === formData.permissionId);
      
      if (!selectedPermission) {
        toast.error('Invalid permission selected');
        return;
      }

      const request = {
        resourceId: parseInt(formData.resourceId, 10),
        permissionId: selectedPermission.id,
        justification: formData.justification.trim()
      };

      // Validate data types
      if (isNaN(request.resourceId) || isNaN(request.permissionId)) {
        toast.error('Invalid resource or permission selected');
        return;
      }

      // Add debug logs
      console.log('Submitting access request with data:', {
        resourceId: request.resourceId,
        permissionId: request.permissionId,
        justification: request.justification,
        selectedPermission: selectedPermission
      });

      // Create the access request
      const response = await accessRequestService.createRequest(request);
      
      // Check if the request was created successfully
      if (response?.data) {
        toast.success('Access request submitted successfully');
        setFormData({
          resourceId: '',
          permissionId: '',
          justification: ''
        });
        
        // Notify the parent component
        if (onRequestSubmitted) {
          onRequestSubmitted(response.data);
        }
      } else {
        throw new Error('Failed to create access request');
      }
    } catch (error) {
      console.error('Access request submission error details:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      const errorMessage = error.response?.data?.message || 'Failed to submit access request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionStatusColor = (enabled) => enabled ? 'success' : 'error';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Request Access
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Resource</InputLabel>
          <Select
            name="resourceId"
            value={formData.resourceId}
            label="Resource"
            onChange={handleChange}
            required
          >
            {resources?.map((resource) => (
              <MenuItem key={resource.id} value={resource.id}>
                {resource.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Permission</InputLabel>
          <Select
            name="permissionId"
            value={formData.permissionId}
            label="Permission"
            onChange={handleChange}
            required
          >
            {permissions?.map((permission) => (
              <MenuItem 
                key={permission.id} 
                value={permission.name}
                disabled={!permission.enabled}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {permission.name}
                  <Chip
                    label={permission.enabled ? 'Enabled' : 'Disabled'}
                    color={getPermissionStatusColor(permission.enabled)}
                    size="small"
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          name="justification"
          label="Justification"
          multiline
          rows={4}
          value={formData.justification}
          onChange={handleChange}
          required
          inputProps={{ maxLength: 500 }}
          helperText={`${formData.justification.length}/500 characters`}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </Box>
    </Paper>
  );
}; 