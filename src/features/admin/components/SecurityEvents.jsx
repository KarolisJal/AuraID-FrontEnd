import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import {
  Security,
  Warning,
  Error as ErrorIcon,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

const severityConfig = {
  high: {
    icon: <ErrorIcon color="error" />,
    color: 'error',
  },
  medium: {
    icon: <Warning color="warning" />,
    color: 'warning',
  },
  low: {
    icon: <Info color="info" />,
    color: 'info',
  },
  success: {
    icon: <CheckCircle color="success" />,
    color: 'success',
  },
};

const SecurityEvents = ({ events = [] }) => {
  if (!events.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No security events to display
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {events.map((event, index) => (
        <ListItem
          key={event.id || index}
          alignItems="flex-start"
          sx={{
            borderBottom: index < events.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <ListItemIcon>
            {severityConfig[event.severity]?.icon || <Security />}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography component="span" variant="subtitle2">
                  {event.title}
                </Typography>
                <Chip
                  label={event.severity}
                  size="small"
                  color={severityConfig[event.severity]?.color || 'default'}
                  sx={{ ml: 1 }}
                />
              </Box>
            }
            secondary={
              <>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {event.description}
                </Typography>
                <Typography
                  component="div"
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {format(new Date(event.timestamp), 'PPpp')}
                  {event.location && (
                    <span> • Location: {event.location}</span>
                  )}
                  {event.user && (
                    <span> • User: {event.user}</span>
                  )}
                </Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

SecurityEvents.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      severity: PropTypes.oneOf(['high', 'medium', 'low', 'success']).isRequired,
      timestamp: PropTypes.string.isRequired,
      location: PropTypes.string,
      user: PropTypes.string,
    })
  ),
};

export default SecurityEvents; 