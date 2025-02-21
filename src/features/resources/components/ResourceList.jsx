import React, { useState } from 'react';
import { FixedSizeList as VirtualList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useResourceQueries } from '../../../hooks/queries/useResourceQueries';
import { ResourceType } from '../../../services/resourceApi';
import PropTypes from 'prop-types';

const ROW_HEIGHT = 100;

const ResourceRow = React.memo(({ resource, style, onView, onEdit, onDelete, onManagePermissions }) => {
  if (!resource) return null;

  const getStatusChipColor = (resource) => {
    if (!resource.active) return 'error';
    if (resource.inUse) return 'success';
    return 'default';
  };

  const getStatusLabel = (resource) => {
    if (!resource.active) return 'Inactive';
    if (resource.inUse) return 'In Use';
    return 'Available';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
      style={style}
    >
      <Box sx={{ flex: 2 }}>
        <Typography variant="subtitle1">{resource.name}</Typography>
        <Chip
          label={resource.type}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </Box>
      
      <Box sx={{ flex: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {resource.description}
        </Typography>
      </Box>

      <Box sx={{ flex: 2 }}>
        {resource.permissions && resource.permissions.length > 0 ? (
          <List dense sx={{ p: 0 }}>
            {resource.permissions.slice(0, 2).map((permission, index) => (
              <ListItem key={permission?.id || index} sx={{ p: 0 }}>
                <ListItemText
                  primary={permission?.name}
                  secondary={permission?.type}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
            {resource.permissions.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{resource.permissions.length - 2} more permissions
              </Typography>
            )}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No permissions assigned
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Chip
          label={getStatusLabel(resource)}
          size="small"
          color={getStatusChipColor(resource)}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Tooltip title="View Details">
          <IconButton 
            size="small" 
            onClick={() => onView?.(resource)}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Resource">
          <IconButton 
            size="small" 
            onClick={() => onEdit?.(resource)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Manage Permissions">
          <IconButton 
            size="small" 
            onClick={() => onManagePermissions?.(resource)}
          >
            <SecurityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Resource">
          <IconButton 
            size="small" 
            onClick={() => onDelete?.(resource)} 
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
});

const LoadingSkeleton = React.memo(() => (
  <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Skeleton variant="text" width="20%" height={24} sx={{ mb: 1 }} />
    <Box sx={{ display: 'flex', mt: 1, gap: 2, alignItems: 'center' }}>
      <Skeleton variant="rectangular" width={80} height={32} />
      <Skeleton variant="text" width="40%" />
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
    </Box>
  </Box>
));

const ResourceListSkeleton = () => (
  <Box>
    {[...Array(3)].map((_, index) => (
      <LoadingSkeleton key={index} />
    ))}
  </Box>
);

export const ResourceList = ({
  onEdit,
  onView,
  onDelete,
  onManagePermissions
}) => {
  const [filter, setFilter] = useState({
    search: '',
    type: ''
  });

  const { useResources, useDeleteResource } = useResourceQueries();
  const { data, isLoading, error } = useResources();
  const deleteResource = useDeleteResource();

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (resource) => {
    try {
      await deleteResource.mutateAsync(resource.id);
      if (onDelete) {
        onDelete(resource);
      }
    } catch (error) {
      console.error('Delete resource error:', error);
    }
  };

  const filteredResources = React.useMemo(() => {
    if (!Array.isArray(data?.content)) {
      console.warn('Resources data is not an array:', data);
      return [];
    }
    
    return data.content.filter(resource => {
      if (!resource) return false;
      
      const searchMatch = filter.search.toLowerCase();
      const name = (resource.name || '').toLowerCase();
      const description = (resource.description || '').toLowerCase();
      const type = resource.type || '';
      
      return (
        (filter.type === '' || type === filter.type) &&
        (name.includes(searchMatch) || description.includes(searchMatch))
      );
    });
  }, [data?.content, filter]);

  if (isLoading) {
    return <ResourceListSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" align="center">
          {error.message || 'Failed to load resources'}
        </Typography>
      </Box>
    );
  }

  if (!Array.isArray(data?.content) || data.content.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="textSecondary" align="center">
          No resources found.
        </Typography>
      </Box>
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
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 'calc(100vh - 250px)', overflow: 'hidden' }}>
        {deleteResource.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : filteredResources.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No resources found
            </Typography>
          </Box>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <VirtualList
                height={height}
                width={width}
                itemCount={filteredResources.length}
                itemSize={ROW_HEIGHT}
              >
                {({ index, style }) => (
                  <ResourceRow
                    resource={filteredResources[index]}
                    style={style}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onManagePermissions={onManagePermissions}
                  />
                )}
              </VirtualList>
            )}
          </AutoSizer>
        )}
      </Box>
    </Box>
  );
};

ResourceRow.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    active: PropTypes.bool,
    inUse: PropTypes.bool,
    permissions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      type: PropTypes.string
    }))
  }),
  style: PropTypes.object,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onManagePermissions: PropTypes.func
};

ResourceRow.defaultProps = {
  resource: null,
  style: {},
  onView: () => {},
  onEdit: () => {},
  onDelete: () => {},
  onManagePermissions: () => {}
}; 