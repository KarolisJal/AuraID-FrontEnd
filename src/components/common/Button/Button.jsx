import { memo } from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';

const Button = ({ 
  children, 
  loading = false,
  startIcon,
  endIcon,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  sx = {}
}) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const getGradient = () => {
    if (variant !== 'contained') return undefined;
    
    return isDark
      ? 'linear-gradient(to right, #A5B4FC, #C4B5FD)'
      : 'linear-gradient(to right, #6B46C1, #805AD5)';
  };

  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      startIcon={!loading && startIcon}
      endIcon={!loading && endIcon}
      sx={{
        backgroundImage: getGradient(),
        position: 'relative',
        ...sx
      }}
    >
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            color: isDark ? 'primary.dark' : 'primary.light',
          }}
        />
      )}
      <span style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </span>
    </MuiButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  sx: PropTypes.object
};

export default memo(Button); 