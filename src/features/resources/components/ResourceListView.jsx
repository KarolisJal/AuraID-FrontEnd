import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { ResourceType } from '../../../services/resourceApi';
import { useResourceManagement } from '../hooks/useResourceManagement';

export const ResourceListView = ({
  onEdit,
  onView,
  onDelete,
  onManagePermissions
}) => {
  const {
    resources,
    loading,
    error,
    currentPage,
    totalPages,
    fetchResources,
    fetchResourcesByType
  } = useResourceManagement();

  const [filter, setFilter] = useState({
    search: '',
    type: ''
  });

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [debouncedFilter, setDebouncedFilter] = useState(filter);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePage = (event, newPage) => {
    if (filter.type) {
      fetchResourcesByType(filter.type, newPage);
    } else {
      fetchResources(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    if (filter.type) {
      fetchResourcesByType(filter.type, 0);
    } else {
      fetchResources(0);
    }
  };

  // Handle filter changes with debounce
  useEffect(() => {
    if (isInitialLoad) return; // Skip if it's the initial load
    
    const timer = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);
    return () => clearTimeout(timer);
  }, [filter, isInitialLoad]);

  // Fetch resources only when necessary
  useEffect(() => {
    const fetchData = async () => {
      if (isInitialLoad) {
        await fetchResources(0);
        setIsInitialLoad(false);
        return;
      }

      if (debouncedFilter.type) {
        await fetchResourcesByType(debouncedFilter.type, 0);
      } else {
        await fetchResources(0);
      }
    };

    fetchData();
  }, [debouncedFilter, fetchResources, fetchResourcesByType, isInitialLoad]);

  const getStatusChipColor = (resource) => {
    if (!resource.enabled) return 'error';
    if (resource.approvalWorkflowId) return 'warning';
    return 'success';
  };

  const getStatusLabel = (resource) => {
    if (!resource.enabled) return 'Disabled';
    if (resource.approvalWorkflowId) return 'Pending Approval';
    return 'Active';
  };

  const filteredResources = (resources || []).filter(resource => {
    if (!resource || typeof resource !== 'object') return false;
    
    const searchMatch = filter.search.toLowerCase();
    const name = resource.name || '';
    const description = resource.description || '';
    
    return (
      (filter.type === '' || resource.type === filter.type) &&
      (name.toLowerCase().includes(searchMatch) ||
       description.toLowerCase().includes(searchMatch))
    );
  });

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          name="search"
          label="Search Resources"
          variant="outlined"
          value={filter.search}
          onChange={handleFilterChange}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Resource Type</InputLabel>
          <Select
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            label="Resource Type"
          >
            <MenuItem value="">All Types</MenuItem>
            {Object.values(ResourceType).map(type => (
              <MenuItem key={type} value={type}>
                {type.replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredResources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No resources found
                </TableCell>
              </TableRow>
            ) : (
              filteredResources.map(resource => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={resource.type.replace('_', ' ')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{resource.description}</TableCell>
                  <TableCell>{resource.path}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(resource)}
                      size="small"
                      color={getStatusChipColor(resource)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onView(resource)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Resource">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(resource)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Permissions">
                      <IconButton
                        size="small"
                        onClick={() => onManagePermissions(resource)}
                      >
                        <SecurityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Resource">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(resource)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalPages * rowsPerPage}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}; 