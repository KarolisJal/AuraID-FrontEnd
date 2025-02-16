import { TextField as MuiTextField, InputAdornment } from '@mui/material';
import PropTypes from 'prop-types';

const TextField = ({ 
  startAdornment,
  endAdornment,
  ...props 
}) => {
  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      InputProps={{
        startAdornment: startAdornment && (
          <InputAdornment position="start">
            {startAdornment}
          </InputAdornment>
        ),
        endAdornment: endAdornment && (
          <InputAdornment position="end">
            {endAdornment}
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

TextField.propTypes = {
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
};

export default TextField; 