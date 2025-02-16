import { memo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';

const LoadingScreen = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullScreen = false,
  transparent = false 
}) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const sizes = {
    small: { spinner: 30, height: '200px' },
    medium: { spinner: 40, height: '400px' },
    large: { spinner: 50, height: '100vh' }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : sizes[size].height,
        gap: 2,
        backgroundColor: transparent ? 'transparent' : 
          isDark ? 'rgba(26, 32, 44, 0.8)' : 'rgba(247, 250, 252, 0.8)',
        backdropFilter: transparent ? 'none' : 'blur(8px)',
      }}
    >
      <CircularProgress
        size={sizes[size].spinner}
        sx={{
          color: isDark ? '#A5B4FC' : '#6B46C1',
        }}
      />
      {message && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

LoadingScreen.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullScreen: PropTypes.bool,
  transparent: PropTypes.bool
};

export default memo(LoadingScreen); 