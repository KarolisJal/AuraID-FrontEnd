import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Link,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import { Person, Email, Lock, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TextField, PasswordInput, Button, Logo } from '../../../components/common';
import PasswordStrengthIndicator from '../../../components/common/PasswordStrengthIndicator';
import ValidationIndicator from '../../../components/common/ValidationIndicator';
import { authApi, userApi } from '../../../services/api';
import { countries } from '../../../utils/constants/countries';
import { debounce } from 'lodash';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [validations, setValidations] = useState({
    username: { status: 'idle', loading: false, message: '' },
    email: { status: 'idle', loading: false, message: '' },
    password: { status: 'idle', loading: false, message: '' },
    confirmPassword: { status: 'idle', loading: false, message: '' }
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  });

  const validatePassword = (password) => {
    if (!password) return { status: 'idle', message: '' };
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const requirements = [];
    if (password.length < minLength) requirements.push('at least 8 characters');
    if (!hasUpperCase) requirements.push('an uppercase letter');
    if (!hasLowerCase) requirements.push('a lowercase letter');
    if (!hasNumbers) requirements.push('a number');
    if (!hasSpecialChar) requirements.push('a special character');
    
    if (requirements.length === 0) {
      return { status: 'valid', message: 'Password meets all requirements' };
    }
    
    return {
      status: 'invalid',
      message: `Password must contain ${requirements.join(', ')}`
    };
  };

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (!username || !touched.username) {
        setValidations(prev => ({
          ...prev,
          username: { status: 'idle', loading: false, message: '' }
        }));
        return;
      }

      if (username.length < 3) {
        setValidations(prev => ({
          ...prev,
          username: { 
            status: 'invalid', 
            loading: false, 
            message: 'Username must be at least 3 characters'
          }
        }));
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setValidations(prev => ({
          ...prev,
          username: { 
            status: 'invalid', 
            loading: false, 
            message: 'Username can only contain letters, numbers, and underscores' 
          }
        }));
        return;
      }

      setValidations(prev => ({
        ...prev,
        username: { ...prev.username, loading: true, status: 'pending', message: 'Checking availability...' }
      }));

      try {
        const response = await userApi.checkUsername(username);
        
        setValidations(prev => ({
          ...prev,
          username: { 
            status: response.available ? 'valid' : 'invalid', 
            loading: false, 
            message: response.available ? 'Username is available' : response.message
          }
        }));
      } catch (error) {
        if (error.response?.status === 429) {
          setValidations(prev => ({
            ...prev,
            username: { status: 'invalid', loading: false, message: 'Too many requests. Please wait a moment.' }
          }));
        } else {
          console.error('Username check error:', error);
          setValidations(prev => ({
            ...prev,
            username: { status: 'invalid', loading: false, message: 'Unable to verify username availability' }
          }));
        }
      }
    }, 1000),
    [touched.username]
  );

  const checkEmail = useCallback(
    debounce(async (email) => {
      if (!email || !touched.email) {
        setValidations(prev => ({
          ...prev,
          email: { status: 'idle', loading: false, message: '' }
        }));
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setValidations(prev => ({
          ...prev,
          email: { status: 'invalid', loading: false, message: 'Please enter a valid email address' }
        }));
        return;
      }

      setValidations(prev => ({
        ...prev,
        email: { ...prev.email, loading: true, status: 'pending', message: 'Checking availability...' }
      }));

      try {
        const response = await userApi.checkEmail(email);
        
        setValidations(prev => ({
          ...prev,
          email: { 
            status: response.available ? 'valid' : 'invalid', 
            loading: false, 
            message: response.available ? 'Email is available' : response.message
          }
        }));
      } catch (error) {
        if (error.response?.status === 429) {
          setValidations(prev => ({
            ...prev,
            email: { status: 'invalid', loading: false, message: 'Too many requests. Please wait a moment.' }
          }));
        } else {
          console.error('Email check error:', error);
          setValidations(prev => ({
            ...prev,
            email: { status: 'invalid', loading: false, message: 'Unable to verify email availability' }
          }));
        }
      }
    }, 1000),
    [touched.email]
  );

  useEffect(() => {
    if (formData.username) {
      checkUsername(formData.username);
    }
    return () => {
      checkUsername.cancel();
    };
  }, [formData.username, checkUsername]);

  useEffect(() => {
    if (formData.email) {
      checkEmail(formData.email);
    }
    return () => {
      checkEmail.cancel();
    };
  }, [formData.email, checkEmail]);

  useEffect(() => {
    if (touched.password) {
      const passwordValidation = validatePassword(formData.password);
      setValidations(prev => ({
        ...prev,
        password: passwordValidation
      }));
    }
  }, [formData.password, touched.password]);

  useEffect(() => {
    if (touched.confirmPassword && formData.confirmPassword) {
      setValidations(prev => ({
        ...prev,
        confirmPassword: {
          status: formData.password === formData.confirmPassword ? 'valid' : 'invalid',
          message: formData.password === formData.confirmPassword ? '' : 'Passwords do not match'
        }
      }));
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // Validate all fields
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = {
      status: formData.password === formData.confirmPassword ? 'valid' : 'invalid',
      message: formData.password === formData.confirmPassword ? '' : 'Passwords do not match'
    };

    setValidations(prev => ({
      ...prev,
      password: passwordValidation,
      confirmPassword: confirmPasswordValidation
    }));

    // Check if there are any validation errors
    if (
      validations.username.status !== 'valid' ||
      validations.email.status !== 'valid' ||
      passwordValidation.status !== 'valid' ||
      confirmPasswordValidation.status !== 'valid'
    ) {
      setError('Please fix all validation errors before submitting');
      toast.error('Please fix all validation errors before submitting');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        country: formData.country
      };
      
      await authApi.register(registrationData);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error) {
      if (error.response?.status === 429) {
        setError('Too many registration attempts. Please try again later.');
        toast.error('Too many registration attempts. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Registration failed');
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("/images/web-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '20px',
          zIndex: 1,
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Registration Form */}
        <Box
          sx={{
            flex: '1 1 500px',
            maxWidth: '500px',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2196f3, #1976d2)',
              },
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Logo size="large" />
              </Box>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#1976d2',
                  }}
                >
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill in your details to create your account
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />

                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Box>

              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
                required
                fullWidth
                startAdornment={<Person />}
                error={touched.username && validations.username.status === 'invalid'}
                helperText={touched.username ? validations.username.message : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                required
                fullWidth
                startAdornment={<Email />}
                error={touched.email && validations.email.status === 'invalid'}
                helperText={touched.email ? validations.email.message : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />

              <PasswordInput
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                required
                fullWidth
                startAdornment={<Lock />}
                error={touched.password && validations.password.status === 'invalid'}
                helperText={touched.password ? validations.password.message : ''}
              />

              <PasswordInput
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                required
                fullWidth
                startAdornment={<Lock />}
                error={touched.confirmPassword && validations.confirmPassword.status === 'invalid'}
                helperText={touched.confirmPassword ? validations.confirmPassword.message : ''}
              />

              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  startAdornment={<LocationOn />}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                >
                  {countries.map(country => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
                sx={{
                  mt: 3,
                  bgcolor: '#1976d2',
                  '&:hover': {
                    bgcolor: '#1565c0',
                  },
                }}
              >
                Create Account
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link 
                  href="/login"
                  variant="body2"
                  sx={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Already have an account? Sign in
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Validation Section */}
        <Box
          sx={{
            flex: '0 0 350px',
            alignSelf: 'flex-start',
            position: 'sticky',
            top: '24px',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 3,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: '#1976d2',
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Lock fontSize="small" />
                Password Requirements
              </Typography>
              <PasswordStrengthIndicator password={formData.password} />
            </Box>
            
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: '#1976d2',
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Person fontSize="small" />
                Username Requirements
              </Typography>
              <ValidationIndicator
                title="Username Validation"
                status={validations.username.status}
                loading={validations.username.loading}
                message={validations.username.message}
                requirements={[
                  { label: 'At least 3 characters', met: formData.username.length >= 3 },
                  { label: 'Only letters, numbers, and underscores', met: /^[a-zA-Z0-9_]*$/.test(formData.username) }
                ]}
              />
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: '#1976d2',
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Email fontSize="small" />
                Email Requirements
              </Typography>
              <ValidationIndicator
                title="Email Validation"
                status={validations.email.status}
                loading={validations.email.loading}
                message={validations.email.message}
                requirements={[
                  { label: 'Valid email format', met: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) }
                ]}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;