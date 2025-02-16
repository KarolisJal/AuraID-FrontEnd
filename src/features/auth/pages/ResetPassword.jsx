import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { LockReset } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PasswordInput, Button, Logo } from '../../../components/common';
import { authApi } from '../../../services/api';
import { StyledPaper, BackgroundBox, ContentBox, gradientTextStyles, formAnimations } from '../styles/authStyles';
import { AUTH_ROUTES, AUTH_ERRORS, AUTH_SUCCESS_MESSAGES } from '../constants/authConstants';
import { useForm } from '../hooks/useForm';

function ResetPassword() {
  const navigate = useNavigate();
  const { token: urlToken } = useParams();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const queryToken = searchParams.get('token');
  const token = urlToken || queryToken;
  
  const {
    formData,
    loading,
    error,
    handleChange,
    setFieldError,
    startLoading,
    stopLoading
  } = useForm({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      toast.error('Reset password token is missing');
      navigate(AUTH_ROUTES.LOGIN);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setFieldError(AUTH_ERRORS.PASSWORD_MISMATCH);
      return;
    }

    startLoading();
    try {
      await authApi.resetPassword(token, formData.password);
      toast.success(AUTH_SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
      navigate(AUTH_ROUTES.LOGIN);
    } catch (error) {
      setFieldError(error.response?.data?.message || AUTH_ERRORS.SERVER_ERROR);
    } finally {
      stopLoading();
    }
  };

  return (
    <BackgroundBox>
      <ContentBox>
        <StyledPaper elevation={3}>
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={formAnimations}
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

              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={gradientTextStyles}
              >
                Reset Password
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Please enter your new password
              </Typography>

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <PasswordInput
                name="password"
                label="New Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <PasswordInput
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
                error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                helperText={
                  formData.confirmPassword !== '' && 
                  formData.password !== formData.confirmPassword ? 
                  AUTH_ERRORS.PASSWORD_MISMATCH : ''
                }
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={!formData.password || !formData.confirmPassword}
                startIcon={<LockReset />}
              >
                Reset Password
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="text"
                  onClick={() => navigate(AUTH_ROUTES.LOGIN)}
                  sx={{ mt: 2 }}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          </motion.div>
        </StyledPaper>
      </ContentBox>
    </BackgroundBox>
  );
}

export default ResetPassword; 