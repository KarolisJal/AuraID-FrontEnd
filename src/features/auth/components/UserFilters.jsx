import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  Paper,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { USER_STATUSES } from './UserStatusChip';
import PropTypes from 'prop-types';

const UserFilters = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters || {
    search: '',
    status: [],
    roles: [],
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      status: [],
      roles: [],
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setShowAdvanced(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => handleChange('search', '')}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          color="inherit"
          startIcon={<FilterIcon />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          sx={{ minWidth: 130 }}
        >
          Filters
          {(filters.status.length > 0 || filters.roles.length > 0) && (
            <Chip
              label={filters.status.length + filters.roles.length}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Button>
      </Box>

      <Collapse in={showAdvanced}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                label="Status"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={USER_STATUSES[value].label}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {Object.entries(USER_STATUSES).map(([value, { label }]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={filters.roles}
                onChange={(e) => handleChange('roles', e.target.value)}
                label="Roles"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((role) => (
                      <Chip
                        key={role}
                        label={role.replace('ROLE_', '')}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {['ROLE_USER', 'ROLE_ADMIN'].map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.replace('ROLE_', '')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
            >
              Clear Filters
            </Button>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

UserFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
};

export default UserFilters; 