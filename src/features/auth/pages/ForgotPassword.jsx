import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { TextField, Button, Logo } from '../../../components/common';
import { authApi } from '../../../services/api';

// Reuse styled components from Login/Register
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 400,
  borderRadius: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const BackgroundBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100%',
  background: `url('/images/web-bg.jpg')`,
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
    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7))',
  }
});

const ContentBox = styled(Box)({
  position: 'relative',
  zIndex: 1,
  width: '100%',
  padding: '24px',
  display: 'flex',
  justifyContent: 'center'
});

const formAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(email);
      setEmailSent(true);
      toast.success('Password reset instructions have been sent to your email');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Logo size="large" />
              </Box>
              <Typography variant="h5" align="center" gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary" paragraph>
                We've sent password reset instructions to:
              </Typography>
              <Typography variant="body1" align="center" fontWeight="500" paragraph>
                {email}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" paragraph>
                If you don't see the email, check your spam folder.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/login')}
                startIcon={<ArrowBack />}
              >
                Back to Login
              </Button>
            </motion.div>
          </StyledPaper>
        </ContentBox>
      </BackgroundBox>
    );
  }

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
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Reset Password
              </Typography>

              <Typography variant="body1" color="text.secondary">
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                startAdornment={<Email />}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={!email}
                startIcon={<Email />}
              >
                Send Reset Instructions
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { 
                      textDecoration: 'underline'
                    } 
                  }}
                >
                  Back to Login
                </Link>
              </Box>
            </Box>
          </motion.div>
        </StyledPaper>
      </ContentBox>
    </BackgroundBox>
  );
}

export default ForgotPassword; 