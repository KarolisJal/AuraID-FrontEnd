import PropTypes from 'prop-types';
import { Paper, Box, Typography, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { Circle } from '@mui/icons-material';

function ActivityCard({ activities }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <List>
        {activities.map((activity, index) => (
          <Box key={activity.id}>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Circle sx={{ color: activity.color, fontSize: 12 }} />
              </ListItemIcon>
              <ListItemText
                primary={activity.action}
                secondary={activity.timestamp}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
            {index < activities.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}

ActivityCard.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      action: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ActivityCard;