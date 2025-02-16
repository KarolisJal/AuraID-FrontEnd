import PropTypes from 'prop-types';  // Ensure you keep this import for prop validation

import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

const Sidebar = ({ open, onClose }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Security', icon: <SecurityIcon />, path: '/security' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Audit Log', icon: <HistoryIcon />, path: '/audit' },
  ];

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text}>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

// PropTypes validation
Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,   // 'open' should be a boolean and is required
  onClose: PropTypes.func.isRequired, // 'onClose' should be a function and is required
};

export default Sidebar;
