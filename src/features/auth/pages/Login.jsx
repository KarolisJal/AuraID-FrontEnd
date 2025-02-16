import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { LoginOutlined, PersonOutline, LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TextField, PasswordInput, Button, Logo } from '../../../components/common';
import { useAuth } from '../../../contexts/AuthContext';
import { AUTH_ROUTES, AUTH_ERRORS } from '../constants/authConstants';
import { debounce } from 'lodash';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [validations, setValidations] = useState({
    username: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
  });

  const validateUsername = useCallback(
    debounce((username) => {
      if (!username) {
        setValidations(prev => ({
          ...prev,
          username: { isValid: false, message: '' }
        }));
        return;
      }

      // Only validate if username is 3+ characters
      if (username.length < 3) {
        setValidations(prev => ({
          ...prev,
          username: { isValid: false, message: username.length > 0 ? 'Username must be at least 3 characters' : '' }
        }));
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setValidations(prev => ({
          ...prev,
          username: { isValid: false, message: 'Username can only contain letters, numbers, and underscores' }
        }));
        return;
      }

      setValidations(prev => ({
        ...prev,
        username: { isValid: true, message: '' }
      }));
    }, 1000), // Increased to 1 second
    []
  );

  const validatePassword = useCallback(
    debounce((password) => {
      if (!password) {
        setValidations(prev => ({
          ...prev,
          password: { isValid: false, message: '' }
        }));
        return;
      }

      if (password.length < 8) {
        setValidations(prev => ({
          ...prev,
          password: { isValid: false, message: password.length > 0 ? 'Password must be at least 8 characters' : '' }
        }));
        return;
      }

      setValidations(prev => ({
        ...prev,
        password: { isValid: true, message: '' }
      }));
    }, 1000), // Increased to 1 second
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear any previous error message
    setError('');

    // Validate the field
    if (name === 'username') {
      validateUsername(value);
    } else if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submit
    validateUsername.flush();
    validatePassword.flush();

    if (!validations.username.isValid || !validations.password.isValid) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(formData);
    } catch (error) {
      if (error.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(error.response?.data?.message || AUTH_ERRORS.INVALID_CREDENTIALS);
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
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px',
          zIndex: 1,
        }}
      >
        <Box
          component="div"
          sx={{
            padding: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your credentials to access your account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
              autoComplete="username"
              startAdornment={<PersonOutline />}
              fullWidth
              error={!validations.username.isValid}
              helperText={validations.username.message}
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
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              autoComplete="current-password"
              startAdornment={<LockOutlined />}
              fullWidth
              error={!validations.password.isValid}
              helperText={validations.password.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading || !formData.username || !formData.password || !validations.username.isValid || !validations.password.isValid}
              startIcon={<LoginOutlined />}
              sx={{
                mt: 3,
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0',
                },
              }}
            >
              Login
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link 
                href={AUTH_ROUTES.FORGOT_PASSWORD} 
                variant="body2"
                sx={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link 
                href={AUTH_ROUTES.REGISTER}
                variant="body2"
                sx={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Don't have an account? Sign up
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;