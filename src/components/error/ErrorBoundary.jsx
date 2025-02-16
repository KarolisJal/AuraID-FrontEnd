import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { themeConstants } from '../../theme/index';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error}
        resetError={() => this.setState({ hasError: false })}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            mb: 2,
            background: isDark
              ? 'linear-gradient(45deg, #A5B4FC 30%, #C4B5FD 90%)'
              : 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Oops! Something went wrong
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {error?.message || 'An unexpected error occurred'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={resetError}
            sx={{
              backgroundImage: isDark
                ? 'linear-gradient(to right, #A5B4FC, #C4B5FD)'
                : 'linear-gradient(to right, #6B46C1, #805AD5)',
              color: isDark ? '#1A202C' : '#FFFFFF',
            }}
          >
            Try Again
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ErrorBoundary; 