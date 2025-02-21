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
  Assignment as AssignIcon
} from '@mui/icons-material';
import { useWorkflowQueries } from '../../../hooks/queries/useWorkflowQueries';
import PropTypes from 'prop-types';

const WORKFLOW_TYPES = [
  'APPROVAL',
  'REVIEW',
  'NOTIFICATION',
  'VALIDATION'
];

const ROW_HEIGHT = 100;

const validateWorkflow = (workflow) => {
  if (!workflow) return null;
  
  return {
    ...workflow,
    id: workflow.id ? String(workflow.id) : null,
    steps: Array.isArray(workflow.steps) 
      ? workflow.steps.map(step => ({
          ...step,
          id: step.id ? String(step.id) : null,
          approvers: Array.isArray(step.approvers)
            ? step.approvers.map(approver => ({
                ...approver,
                id: approver.id ? String(approver.id) : null
              }))
            : []
        }))
      : []
  };
};

const WorkflowRow = React.memo(({ workflow: rawWorkflow, style, onView, onEdit, onDelete, onAssign }) => {
  const workflow = validateWorkflow(rawWorkflow);
  if (!workflow) return null;

  const getStatusChipColor = (workflow) => {
    if (!workflow) return 'default';
    if (typeof workflow.enabled === 'boolean' && !workflow.enabled) return 'error';
    if (typeof workflow.inUse === 'boolean' && workflow.inUse) return 'success';
    return 'default';
  };

  const getStatusLabel = (workflow) => {
    if (!workflow) return 'Unknown';
    if (typeof workflow.enabled === 'boolean' && !workflow.enabled) return 'Disabled';
    if (typeof workflow.inUse === 'boolean' && workflow.inUse) return 'In Use';
    return 'Available';
  };

  const {
    name = 'Untitled Workflow',
    type = 'Unknown Type',
    description = 'No description available',
    steps = []
  } = workflow || {};

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
        <Typography variant="subtitle1">{name}</Typography>
        <Chip
          label={type}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </Box>
      
      <Box sx={{ flex: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>

      <Box sx={{ flex: 2 }}>
        {Array.isArray(steps) && steps.length > 0 ? (
          <List dense sx={{ p: 0 }}>
            {steps.slice(0, 2).map((step, index) => (
              <ListItem key={step?.id || index} sx={{ p: 0 }}>
                <ListItemText
                  primary={step?.name || `Step ${index + 1}`}
                  secondary={step?.type || 'Unknown Type'}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
            {steps.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                +{steps.length - 2} more steps
              </Typography>
            )}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No steps defined
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Chip
          label={getStatusLabel(workflow)}
          size="small"
          color={getStatusChipColor(workflow)}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Tooltip title="View Details">
          <IconButton 
            size="small" 
            onClick={() => onView?.(workflow)}
            disabled={!workflow?.id}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Workflow">
          <IconButton 
            size="small" 
            onClick={() => onEdit?.(workflow)}
            disabled={!workflow?.id}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Assign Workflow">
          <IconButton 
            size="small" 
            onClick={() => onAssign?.(workflow)}
            disabled={!workflow?.id}
          >
            <AssignIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Workflow">
          <IconButton 
            size="small" 
            onClick={() => onDelete?.(workflow)} 
            color="error"
            disabled={!workflow?.id}
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

const WorkflowListSkeleton = () => (
  <Box>
    {[...Array(3)].map((_, index) => (
      <LoadingSkeleton key={index} />
    ))}
  </Box>
);

export const WorkflowList = ({
  onEdit,
  onView,
  onDelete,
  onAssign
}) => {
  const [filter, setFilter] = useState({
    search: '',
    type: ''
  });

  const { useWorkflows, useDeleteWorkflow } = useWorkflowQueries();
  const { data, isLoading, error } = useWorkflows();
  const deleteWorkflow = useDeleteWorkflow();

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (workflow) => {
    try {
      await deleteWorkflow.mutateAsync(workflow.id);
      if (onDelete) {
        onDelete(workflow);
      }
    } catch (error) {
      // Error is handled by the mutation
      console.error('Delete workflow error:', error);
    }
  };

  const filteredWorkflows = React.useMemo(() => {
    if (!Array.isArray(data?.content)) {
      console.warn('Workflows data is not an array:', data);
      return [];
    }
    
    return data.content.filter(workflow => {
      if (!workflow) return false;
      
      const searchMatch = filter.search.toLowerCase();
      const name = (workflow.name || '').toLowerCase();
      const description = (workflow.description || '').toLowerCase();
      const type = workflow.type || '';
      
      return (
        (filter.type === '' || type === filter.type) &&
        (name.includes(searchMatch) || description.includes(searchMatch))
      );
    });
  }, [data?.content, filter]);

  if (isLoading) {
    return <WorkflowListSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" align="center">
          {error.message || 'Failed to load workflows'}
        </Typography>
      </Box>
    );
  }

  if (!Array.isArray(data?.content) || data.content.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="textSecondary" align="center">
          No workflows found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          name="search"
          label="Search Workflows"
          variant="outlined"
          value={filter.search}
          onChange={handleFilterChange}
          sx={{ flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Workflow Type</InputLabel>
          <Select
            name="type"
            value={filter.type}
            onChange={handleFilterChange}
            label="Workflow Type"
          >
            <MenuItem value="">All Types</MenuItem>
            {WORKFLOW_TYPES.map(type => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 'calc(100vh - 250px)', overflow: 'hidden' }}>
        {deleteWorkflow.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : filteredWorkflows.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No workflows found
            </Typography>
          </Box>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <VirtualList
                height={height}
                width={width}
                itemCount={filteredWorkflows.length}
                itemSize={ROW_HEIGHT}
              >
                {({ index, style }) => (
                  <WorkflowRow
                    workflow={filteredWorkflows[index]}
                    style={style}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onAssign={onAssign}
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

WorkflowRow.propTypes = {
  workflow: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    enabled: PropTypes.bool,
    inUse: PropTypes.bool,
    steps: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      type: PropTypes.string,
      status: PropTypes.string,
      order: PropTypes.number,
      approvers: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        role: PropTypes.string
      }))
    }))
  }),
  style: PropTypes.object,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onAssign: PropTypes.func
};

WorkflowRow.defaultProps = {
  workflow: null,
  style: {},
  onView: () => {},
  onEdit: () => {},
  onDelete: () => {},
  onAssign: () => {}
}; 