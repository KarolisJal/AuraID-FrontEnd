import { Search, Clear } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import TextField from './TextField';

const SearchInput = ({ value, onChange, onClear, placeholder = 'Search...', ...props }) => {
  return (
    <TextField
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      startAdornment={<Search />}
      endAdornment={
        value ? (
          <IconButton
            aria-label="clear search"
            onClick={onClear}
            edge="end"
            size="small"
          >
            <Clear />
          </IconButton>
        ) : null
      }
      {...props}
    />
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default SearchInput; 