import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Box,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  VpnKey as RoleIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Button from '../../../../../components/common/Button/Button';
import StatusChip from '../views/StatusChip';

const InfoRow = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Icon sx={{ mr: 2, color: 'text.secondary' }} />
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value || 'Not provided'}</Typography>
    </Box>
  </Box>
);

const UserDetailsDialog = ({ open, user, onClose }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                src={user.avatar}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">{user.username}</Typography>
              <StatusChip status={user.status} />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <InfoRow
              icon={PersonIcon}
              label="Full Name"
              value={`${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined}
            />
            <InfoRow
              icon={EmailIcon}
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={CalendarIcon}
              label="Created At"
              value={format(new Date(user.createdAt), 'PPpp')}
            />
            {user.lastActiveAt && (
              <InfoRow
                icon={CalendarIcon}
                label="Last Active"
                value={format(new Date(user.lastActiveAt), 'PPpp')}
              />
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Roles
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {user.roles.map((role) => (
                <Box
                  key={role}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'action.selected',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <RoleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">{role}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

InfoRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

UserDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    status: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    lastActiveAt: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default UserDetailsDialog; 