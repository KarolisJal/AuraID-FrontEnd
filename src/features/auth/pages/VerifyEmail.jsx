import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { authApi } from '../../../services/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        return;
      }

      try {
        await authApi.verifyEmail(token);  // Removed unused response variable
        setStatus('success');
        setMessage('Email verified successfully! You can now login.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Verifying your email...</Typography>
          </>
        )}

        {status === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default VerifyEmail;