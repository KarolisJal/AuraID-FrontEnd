import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  MenuItem,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Person,
  Settings,
  Logout,
  Security,
  History,
} from '@mui/icons-material';
import { authApi } from '../../services/api';
import Logo from '../common/Logo';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../theme/ThemeProvider';
import { themeConstants } from '../../theme/index';
import { toast } from 'react-toastify';

const pages = [
  { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  { name: 'Users', path: '/users', icon: <Person /> },
  { name: 'Audit Log', path: '/audit', icon: <History /> }
];

function Navbar() {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const muiTheme = useMuiTheme();
  const { currentTheme } = useTheme();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleCloseUserMenu();
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      toast.success('Successfully logged out!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: currentTheme === 'dark' ? '#2D3748' : '#FFFFFF',
          color: currentTheme === 'dark' ? '#FFFFFF' : '#1A202C',
          borderLeft: '4px solid #6B46C1'
        },
      });
      navigate('/login');
      handleCloseUserMenu();
    } catch (error) {
      toast.error('Error during logout. Please try again.');
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: currentTheme === 'light' 
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(45, 55, 72, 0.9)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        color: muiTheme.palette.text.primary,
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px' }}>
          <Box sx={{ cursor: 'pointer', mr: 4 }} onClick={() => navigate('/dashboard')}>
            <Logo size="small" showSubtext={false} color="default" />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.path}
                onClick={() => handleNavigation(page.path)}
                sx={{
                  mx: 1,
                  color: location.pathname === page.path 
                    ? 'primary.main'
                    : 'text.primary',
                  '&:hover': {
                    backgroundColor: currentTheme === 'light'
                      ? 'rgba(107, 70, 193, 0.04)'
                      : 'rgba(128, 90, 213, 0.04)'
                  }
                }}
                startIcon={page.icon}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }}>
                  {currentUser?.firstName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: {
                  background: currentTheme === 'light' 
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(45, 55, 72, 0.9)',
                  backdropFilter: 'blur(6px)',
                }
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" color="primary.main">
                  {currentUser?.firstName} {currentUser?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Box>
              <MenuItem onClick={() => handleNavigation('/profile')}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/settings')}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/security')}>
                <ListItemIcon>
                  <Security fontSize="small" />
                </ListItemIcon>
                Security
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;