import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  AccessTime as TimeZoneIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../../../theme/ThemeProvider';
import { themeConstants } from '../../../theme/index';
import { userApi } from '../../../services/api';
import { useTheme as useMuiTheme } from '@mui/material/styles';

const MotionPaper = motion(Paper);

function Settings() {
  const muiTheme = useMuiTheme();
  const { currentTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    language: localStorage.getItem('language') || 'en',
    theme: localStorage.getItem('theme') || 'light',
    timezone: localStorage.getItem('timezone') || 'UTC',
    emailNotifications: localStorage.getItem('emailNotifications') === 'true',
    dashboardView: localStorage.getItem('dashboardView') || 'detailed',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));

    if (setting === 'theme') {
      setTheme(value);
    }

    localStorage.setItem(setting, value.toString());
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // Save to backend
      await userApi.updateSettings(settings);

      // Save all settings to localStorage
      Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString());
      });

      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = () => {
    const defaultSettings = {
      language: 'en',
      theme: 'light',
      timezone: 'UTC',
      emailNotifications: true,
      dashboardView: 'detailed',
    };

    setSettings(defaultSettings);

    // Save defaults to localStorage
    Object.entries(defaultSettings).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString());
    });

    setSnackbar({
      open: true,
      message: 'Settings reset to defaults',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const menuProps = {
    PaperProps: {
      sx: {
        bgcolor: currentTheme === 'dark' ? 'background.paper' : 'background.paper',
        backgroundImage: 'none',
        '& .MuiMenuItem-root': {
          px: 2,
          py: 1,
          borderRadius: 1,
          '&:hover': {
            bgcolor: currentTheme === 'dark' 
              ? 'rgba(128, 90, 213, 0.15)' 
              : 'rgba(107, 70, 193, 0.08)',
          },
        },
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          fontWeight: 600,
          background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Account Settings
      </Typography>

      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Preferences */}
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ 
            p: 3,
            background: currentTheme === 'dark' 
              ? 'rgba(45, 55, 72, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Preferences
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <LanguageIcon />
              </ListItemIcon>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: currentTheme === 'dark' 
                      ? 'rgba(26, 32, 44, 0.5)'
                      : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider sx={{ 
              borderColor: currentTheme === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.12)'
            }} />
            <ListItem>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <ThemeIcon />
              </ListItemIcon>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  label="Theme"
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: currentTheme === 'dark' 
                      ? 'rgba(26, 32, 44, 0.5)'
                      : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <Divider sx={{ 
              borderColor: currentTheme === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.12)'
            }} />
            <ListItem>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <TimeZoneIcon />
              </ListItemIcon>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  label="Timezone"
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: currentTheme === 'dark' 
                      ? 'rgba(26, 32, 44, 0.5)'
                      : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">EST</MenuItem>
                  <MenuItem value="PST">PST</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
        </MotionPaper>

        {/* Notifications */}
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          sx={{ 
            p: 3,
            background: currentTheme === 'dark' 
              ? 'rgba(45, 55, 72, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Notifications
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography color="text.primary">Email Notifications</Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Receive email updates about your account
                  </Typography>
                }
              />
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                color="primary"
              />
            </ListItem>
          </List>
        </MotionPaper>

        {/* Dashboard Preferences */}
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ 
            p: 3,
            background: currentTheme === 'dark' 
              ? 'rgba(45, 55, 72, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Dashboard Preferences
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <DashboardIcon />
              </ListItemIcon>
              <FormControl fullWidth>
                <InputLabel>Default View</InputLabel>
                <Select
                  value={settings.dashboardView}
                  label="Default View"
                  onChange={(e) => handleSettingChange('dashboardView', e.target.value)}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: currentTheme === 'dark' 
                      ? 'rgba(26, 32, 44, 0.5)'
                      : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <MenuItem value="simple">Simple</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                  <MenuItem value="compact">Compact</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
        </MotionPaper>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleResetDefaults}
            disabled={loading}
            sx={{
              borderColor: currentTheme === 'dark' 
                ? 'rgba(255, 255, 255, 0.23)'
                : undefined,
              '&:hover': {
                borderColor: currentTheme === 'dark'
                  ? 'rgba(255, 255, 255, 0.4)'
                  : undefined,
              }
            }}
          >
            Reset to Defaults
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveAll}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            bgcolor: currentTheme === 'dark' 
              ? 'rgba(45, 55, 72, 0.9)'
              : undefined,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Settings; 