import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import PropTypes from 'prop-types';
import TextField from './TextField';

const PasswordInput = ({ label = 'Password', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <TextField
      type={showPassword ? 'text' : 'password'}
      label={label}
      startAdornment={<Lock />}
      endAdornment={
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          edge="end"
          size="large"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      }
      {...props}
    />
  );
};

PasswordInput.propTypes = {
  label: PropTypes.string,
};

export default PasswordInput; 