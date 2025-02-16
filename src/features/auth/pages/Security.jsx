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
  ListItemSecondaryAction,
  Divider,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Password as PasswordIcon,
  PhoneAndroid as MFAIcon,
  VpnKey as APIKeyIcon,
  History as HistoryIcon,
  NotificationsActive as NotificationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../../../theme/ThemeProvider';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { userApi } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const MotionPaper = motion(Paper);

// Password strength calculation
const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'None' };
  
  let score = 0;
  if (password.length >= 6) score += 20;
  if (password.length >= 10) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  let label = 'Weak';
  if (score >= 80) label = 'Strong';
  else if (score >= 60) label = 'Good';
  else if (score >= 40) label = 'Fair';
  else if (score >= 20) label = 'Weak';

  return { score, label };
};

function Security() {
  const { currentTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    apiAccess: false,
    sessionTimeout: true,
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'None' });

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleNewPasswordChange = (e) => {
    const newPassword = e.target.value;
    setPasswordForm(prev => ({ ...prev, newPassword }));
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handlePasswordChange = async () => {
    try {
      // Validate passwords
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast.error('All password fields are required');
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('New password and confirmation do not match');
        return;
      }

      if (passwordForm.newPassword.length < 6 || passwordForm.newPassword.length > 40) {
        toast.error('New password must be between 6 and 40 characters');
        return;
      }

      // Call API to change password
      await userApi.changePassword(user.username, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      // Clear form and close dialog
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength({ score: 0, label: 'None' });
      setIsPasswordDialogOpen(false);
      
      toast.success('Password changed successfully');
    } catch (error) {
      // Error is already handled by the API interceptor
      console.error('Failed to change password:', error);
    }
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
        Security Settings
      </Typography>

      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Password Section */}
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
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PasswordIcon color="primary" /> Password & Authentication
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary={<Typography color="text.primary">Change Password</Typography>}
                secondary={<Typography variant="body2" color="text.secondary">Update your account password</Typography>}
              />
              <Button 
                variant="outlined" 
                onClick={() => setIsPasswordDialogOpen(true)}
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
                Change Password
              </Button>
            </ListItem>
            <Divider sx={{ 
              borderColor: currentTheme === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.12)'
            }} />
            <ListItem>
              <ListItemText 
                primary={<Typography color="text.primary">Two-Factor Authentication</Typography>}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {settings.twoFactorAuth ? "Enabled" : "Disabled"}
                  </Typography>
                }
              />
              <Switch
                checked={settings.twoFactorAuth}
                onChange={() => handleSettingChange('twoFactorAuth')}
                color="primary"
              />
            </ListItem>
          </List>
        </MotionPaper>

        {/* Security Preferences */}
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
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="primary" /> Security Preferences
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <NotificationIcon />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography color="text.primary">Login Notifications</Typography>}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Get notified of new login attempts
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.loginNotifications}
                  onChange={() => handleSettingChange('loginNotifications')}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ 
              borderColor: currentTheme === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.12)'
            }} />
            <ListItem>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <APIKeyIcon />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography color="text.primary">API Access</Typography>}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Enable API access for your account
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.apiAccess}
                  onChange={() => handleSettingChange('apiAccess')}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider sx={{ 
              borderColor: currentTheme === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.12)'
            }} />
            <ListItem>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText 
                primary={<Typography color="text.primary">Session Timeout</Typography>}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Automatically logout after period of inactivity
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={settings.sessionTimeout}
                  onChange={() => handleSettingChange('sessionTimeout')}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </MotionPaper>

        {/* Recent Security Activity */}
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
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" /> Recent Security Activity
          </Typography>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              bgcolor: currentTheme === 'dark' 
                ? 'rgba(2, 136, 209, 0.1)'
                : undefined,
            }}
          >
            No suspicious activity detected in the last 30 days
          </Alert>
        </MotionPaper>
      </Box>

      {/* Password Change Dialog */}
      <Dialog 
        open={isPasswordDialogOpen} 
        onClose={() => setIsPasswordDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            bgcolor: currentTheme === 'dark' 
              ? 'rgba(45, 55, 72, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(6px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: currentTheme === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.12)',
        }}>
          Change Password
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Password Requirements:</Typography>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>Must be between 6 and 40 characters</li>
              <li>Both current and new password are required</li>
              <li>Current password must match your existing password</li>
            </ul>
          </Alert>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: currentTheme === 'dark' 
                  ? 'rgba(26, 32, 44, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)'
              }
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={handleNewPasswordChange}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: currentTheme === 'dark' 
                  ? 'rgba(26, 32, 44, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)'
              }
            }}
          />
          {passwordForm.newPassword && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Password Strength: {passwordStrength.label}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.score}
                color={
                  passwordStrength.score >= 80 ? 'success' :
                  passwordStrength.score >= 60 ? 'info' :
                  passwordStrength.score >= 40 ? 'warning' : 'error'
                }
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
            error={passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword}
            helperText={
              passwordForm.confirmPassword !== '' && 
              passwordForm.newPassword !== passwordForm.confirmPassword ? 
              'Passwords do not match' : ''
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: currentTheme === 'dark' 
                  ? 'rgba(26, 32, 44, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setIsPasswordDialogOpen(false)}
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
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained" 
            color="primary"
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Security; 