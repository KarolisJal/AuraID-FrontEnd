// src/features/auth/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { authApi } from '../../../services/api';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../../../theme/ThemeProvider';
import { useAuth } from '../../../contexts/AuthContext';

const MotionPaper = motion(Paper);

function Profile() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phoneNumber: '',
    username: '', // Added username field
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await authApi.getCurrentUser();
        setUser(response.data);
        setError('');
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          country: response.data.country || '',
          phoneNumber: response.data.phoneNumber || '',
          username: response.data.username || '', // Added username
        });
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError(error.response?.data?.message || 'Failed to load profile');
        // Don't clear the user here, let the AuthContext handle token invalidation
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Remove username from update data if it exists
      const updateData = { ...formData };
      delete updateData.username; // Username shouldn't be updated
      
      const response = await authApi.updateProfile(updateData);
      
      if (response && response.data) {
        setUser(response.data);
        setSuccess('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Failed to update profile');
      } else if (error.request) {
        setError('No response received from server. Please try again.');
      } else {
        setError('An error occurred while updating your profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          User profile not found. Please try logging in again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          fontWeight: 600,
          background: isDark
            ? 'linear-gradient(45deg, #A5B4FC 30%, #C4B5FD 90%)'
            : 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Photo Section */}
        <Grid item xs={12} md={4}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ 
              p: 3,
              textAlign: 'center',
              background: isDark 
                ? 'rgba(45, 55, 72, 0.9)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto 16px',
                border: '4px solid',
                borderColor: 'primary.main',
                bgcolor: isDark ? 'rgba(99, 102, 241, 0.2)' : undefined,
              }}
            >
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="icon-button-file"
              type="file"
            />
            <label htmlFor="icon-button-file">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
              >
                <PhotoCameraIcon />
              </IconButton>
            </label>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography color="textSecondary">
              {user?.position || 'N/A'}
            </Typography>
          </MotionPaper>
        </Grid>

        {/* Profile Details Section */}
        <Grid item xs={12} md={8}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            sx={{ 
              p: 3,
              background: isDark 
                ? 'rgba(45, 55, 72, 0.9)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" color="primary">
                Profile Information
              </Typography>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={isEditing ? formData.firstName : user?.firstName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDark 
                          ? 'rgba(26, 32, 44, 0.5)'
                          : 'rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={isEditing ? formData.lastName : user?.lastName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDark 
                          ? 'rgba(26, 32, 44, 0.5)'
                          : 'rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={isEditing ? formData.email : user?.email || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    type="email"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDark 
                          ? 'rgba(26, 32, 44, 0.5)'
                          : 'rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={isEditing ? formData.country : user?.country || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDark 
                          ? 'rgba(26, 32, 44, 0.5)'
                          : 'rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={isEditing ? formData.phoneNumber : user?.phoneNumber || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDark 
                          ? 'rgba(26, 32, 44, 0.5)'
                          : 'rgba(255, 255, 255, 0.5)',
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{
                      backgroundImage: isDark
                        ? 'linear-gradient(to right, #A5B4FC, #C4B5FD)'
                        : 'linear-gradient(to right, #6B46C1, #805AD5)',
                      color: isDark ? '#1A202C' : '#FFFFFF',
                      '&:hover': {
                        backgroundImage: isDark
                          ? 'linear-gradient(to right, #8B9CF5, #B19EF9)'
                          : 'linear-gradient(to right, #553C9A, #6B46C1)',
                      }
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </form>
          </MotionPaper>
        </Grid>
      </Grid>

      <Divider 
        sx={{ 
          my: 4,
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.12)'
        }} 
      />

      <Box>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{
            color: isDark ? '#A5B4FC' : '#6B46C1'
          }}
        >
          Account Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Account Status
            </Typography>
            <Typography variant="body1" color="text.primary">
              {user?.status || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Member Since
            </Typography>
            <Typography variant="body1" color="text.primary">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Profile;