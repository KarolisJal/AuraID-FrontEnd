import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  FormHelperText,
} from '@mui/material';
import { Person, Email, Lock, LocationOn, VerifiedUser } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { TextField, PasswordInput, Button } from '../../../../../components/common';
import { countries } from '../../../../../utils/constants/countries';
import { userApi } from '../../../../../services/api';
import { USER_STATUS_OPTIONS } from '../../../constants/userConstants';
import { debounce } from 'lodash';

function CreateUserDialog({ open, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validations, setValidations] = useState({
    username: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    firstName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    status: { isValid: true, message: '' },
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    status: '',
  });

  // Validation functions
  const validateUsername = useCallback(
    debounce(async (username) => {
      if (!username) {
        setValidations(prev => ({
          ...prev,
          username: { isValid: false, message: 'Username is required' }
        }));
        return;
      }

      if (username.length < 3 || username.length > 20) {
        setValidations(prev => ({
          ...prev,
          username: { isValid: false, message: 'Username must be between 3 and 20 characters' }
        }));
        return;
      }

      try {
        const response = await userApi.checkUsername(username);
        setValidations(prev => ({
          ...prev,
          username: { 
            isValid: response.available,
            message: response.available ? '' : response.message
          }
        }));
      } catch (error) {
        setValidations(prev => ({
          ...prev,
          username: { 
            isValid: false, 
            message: 'Unable to verify username availability'
          }
        }));
      }
    }, 500),
    []
  );

  const validateEmail = useCallback(
    debounce(async (email) => {
      if (!email) {
        setValidations(prev => ({
          ...prev,
          email: { isValid: false, message: 'Email is required' }
        }));
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 50) {
        setValidations(prev => ({
          ...prev,
          email: { isValid: false, message: 'Invalid email format or too long (max 50 characters)' }
        }));
        return;
      }

      try {
        const response = await userApi.checkEmail(email);
        setValidations(prev => ({
          ...prev,
          email: { 
            isValid: response.available,
            message: response.available ? '' : response.message
          }
        }));
      } catch (error) {
        setValidations(prev => ({
          ...prev,
          email: { 
            isValid: false, 
            message: 'Unable to verify email availability'
          }
        }));
      }
    }, 500),
    []
  );

  const validateName = (name, field) => {
    if (!name) {
      setValidations(prev => ({
        ...prev,
        [field]: { isValid: false, message: `${field} is required` }
      }));
      return false;
    }

    if (name.length < 2 || name.length > 50) {
      setValidations(prev => ({
        ...prev,
        [field]: { isValid: false, message: `${field} must be between 2 and 50 characters` }
      }));
      return false;
    }

    setValidations(prev => ({
      ...prev,
      [field]: { isValid: true, message: '' }
    }));
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setValidations(prev => ({
        ...prev,
        password: { isValid: false, message: 'Password is required' }
      }));
      return false;
    }

    if (password.length < 6 || password.length > 40) {
      setValidations(prev => ({
        ...prev,
        password: { isValid: false, message: 'Password must be between 6 and 40 characters' }
      }));
      return false;
    }

    setValidations(prev => ({
      ...prev,
      password: { isValid: true, message: '' }
    }));
    return true;
  };

  const validateStatus = (status) => {
    if (!status) {
      setValidations(prev => ({
        ...prev,
        status: { isValid: false, message: 'Status is required' }
      }));
      return false;
    }

    setValidations(prev => ({
      ...prev,
      status: { isValid: true, message: '' }
    }));
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Trigger validation
    switch (name) {
      case 'username':
        validateUsername(value);
        break;
      case 'email':
        validateEmail(value);
        break;
      case 'firstName':
        validateName(value, 'firstName');
        break;
      case 'lastName':
        validateName(value, 'lastName');
        break;
      case 'password':
        validatePassword(value);
        break;
      case 'status':
        validateStatus(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isFirstNameValid = validateName(formData.firstName, 'firstName');
    const isLastNameValid = validateName(formData.lastName, 'lastName');
    const isPasswordValid = validatePassword(formData.password);
    const isStatusValid = validateStatus(formData.status);

    // Wait for async validations to complete
    await Promise.all([
      validateUsername(formData.username),
      validateEmail(formData.email)
    ]);

    if (!isFirstNameValid || !isLastNameValid || !isPasswordValid ||
        !validations.username.isValid || !validations.email.isValid || 
        !isStatusValid) {
      toast.error('Please fix the validation errors');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        country: formData.country || undefined,
        status: formData.status,
      };
      
      await onSave(userData);
      toast.success('User created successfully');
      handleClose();
    } catch (error) {
      console.error('Create user error:', error);
      setError(error.response?.data?.message || 'Failed to create user');
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      status: '',
    });
    setError('');
    setValidations({
      username: { isValid: true, message: '' },
      email: { isValid: true, message: '' },
      firstName: { isValid: true, message: '' },
      lastName: { isValid: true, message: '' },
      password: { isValid: true, message: '' },
      status: { isValid: true, message: '' },
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
          color: 'white',
          fontWeight: 700 
        }}
      >
        Create New User
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              error={!validations.firstName.isValid}
              helperText={validations.firstName.message}
              startAdornment={<Person />}
            />

            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              error={!validations.lastName.isValid}
              helperText={validations.lastName.message}
              startAdornment={<Person />}
            />

            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              error={!validations.username.isValid}
              helperText={validations.username.message}
              startAdornment={<Person />}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={!validations.email.isValid}
              helperText={validations.email.message}
              startAdornment={<Email />}
            />

            <FormControl fullWidth required error={!validations.status.isValid}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
                startAdornment={<VerifiedUser sx={{ mr: 1 }} />}
              >
                {USER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
              {!validations.status.isValid && (
                <FormHelperText>{validations.status.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="country-label">Country</InputLabel>
              <Select
                labelId="country-label"
                name="country"
                value={formData.country}
                onChange={handleChange}
                label="Country"
                startAdornment={<LocationOn sx={{ mr: 1 }} />}
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Optional</FormHelperText>
            </FormControl>

            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={!validations.password.isValid}
              helperText={validations.password.message}
            />

            <PasswordInput
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
              helperText={
                formData.confirmPassword !== '' && 
                formData.password !== formData.confirmPassword ? 
                'Passwords do not match' : ''
              }
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={
              !formData.username || 
              !formData.password || 
              !formData.status ||
              !validations.username.isValid || 
              !validations.email.isValid || 
              !validations.firstName.isValid || 
              !validations.lastName.isValid || 
              !validations.password.isValid ||
              !validations.status.isValid
            }
            startIcon={<Person />}
          >
            Create User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreateUserDialog;