import { Box, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import ViewSwitcher from './ViewSwitcher';
import { USER_STATUSES } from '../../constants/userConstants';

const UserFilters = ({ filters, onFiltersChange, viewMode, onViewModeChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value,
      // Reset page when filters change
      ...(key !== 'page' && { page: 0 })
    }));
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <ViewSwitcher value={viewMode} onChange={onViewModeChange} />
      
      <TextField
        size="small"
        placeholder="Search users..."
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={(e) => handleFilterChange('status', e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <FilterIcon />
            </InputAdornment>
          }
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(USER_STATUSES).map(([value, { label }]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

UserFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    orderBy: PropTypes.string.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(['table', 'detailed', 'catalog']).isRequired,
  onViewModeChange: PropTypes.func.isRequired,
};

export default UserFilters; 