import PropTypes from 'prop-types';  // Ensure you keep this import for prop validation
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Storage as ResourceIcon,
  AccountTree as WorkflowIcon,
  AdminPanelSettings,
  Timeline as WorkflowTrackingIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const userMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Resources', icon: <ResourceIcon />, path: '/resources' },
    { text: 'Access Requests', icon: <WorkflowTrackingIcon />, path: '/access-requests' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Security', icon: <SecurityIcon />, path: '/security' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const adminMenuItems = [
    { text: 'Workflows', icon: <WorkflowIcon />, path: '/workflows' },
    { text: 'Users', icon: <PersonIcon />, path: '/users' },
    { text: 'Audit Log', icon: <HistoryIcon />, path: '/audit' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

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
          {/* User menu items */}
          {userMenuItems.map((item) => (
            <ListItem button key={item.text} onClick={() => handleNavigation(item.path)}>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}

          {/* Admin menu items */}
          {isAdmin && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ px: 3, py: 1, display: 'flex', alignItems: 'center' }}>
                <AdminPanelSettings sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="primary.main">
                  Admin
                </Typography>
              </Box>
              {adminMenuItems.map((item) => (
                <ListItem button key={item.text} onClick={() => handleNavigation(item.path)}>
                  <ListItemIcon sx={{ color: 'primary.main' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </>
          )}
        </List>
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
