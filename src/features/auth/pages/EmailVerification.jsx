import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { MarkEmailRead, Error } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { authApi } from '../../../services/api';
import { Button, Logo } from '../../../components/common';
import { StyledPaper, BackgroundBox, ContentBox, gradientTextStyles } from '../styles/authStyles';
import { AUTH_ROUTES } from '../constants/authConstants';

function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Verification token is missing');
      setVerifying(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        setSuccess(true);
      } catch (error) {
        setError(error.response?.data?.message || 'Email verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <BackgroundBox>
      <ContentBox>
        <StyledPaper elevation={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Logo size="large" />
            </Box>

            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={gradientTextStyles}
            >
              Email Verification
            </Typography>

            {verifying ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : success ? (
              <Box sx={{ textAlign: 'center' }}>
                <MarkEmailRead 
                  sx={{ 
                    fontSize: 64, 
                    color: 'success.main',
                    mb: 2 
                  }} 
                />
                <Typography variant="h6" gutterBottom>
                  Email Verified Successfully!
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Your email has been verified. You can now log in to your account.
                </Typography>
                <Button
                  fullWidth
                  onClick={() => navigate(AUTH_ROUTES.LOGIN)}
                  sx={{ mt: 2 }}
                >
                  Go to Login
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Error 
                  sx={{ 
                    fontSize: 64, 
                    color: 'error.main',
                    mb: 2 
                  }} 
                />
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Button
                  fullWidth
                  onClick={() => navigate(AUTH_ROUTES.LOGIN)}
                  sx={{ mt: 2 }}
                >
                  Back to Login
                </Button>
              </Box>
            )}
          </motion.div>
        </StyledPaper>
      </ContentBox>
    </BackgroundBox>
  );
}

export default EmailVerification; 