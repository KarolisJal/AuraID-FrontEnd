import { Chip, Tooltip } from '@mui/material';
import {
  CheckCircle as ActiveIcon,
  Block as BlockIcon,
  PauseCircle as InactiveIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

export const USER_STATUSES = {
  ACTIVE: {
    label: 'Active',
    color: 'success',
    icon: ActiveIcon,
    description: 'User can log in and access the system'
  },
  INACTIVE: {
    label: 'Inactive',
    color: 'warning',
    icon: InactiveIcon,
    description: 'User account is temporarily disabled'
  },
  BLOCKED: {
    label: 'Blocked',
    color: 'error',
    icon: BlockIcon,
    description: 'User is blocked from accessing the system'
  },
  PENDING: {
    label: 'Pending',
    color: 'info',
    icon: PendingIcon,
    description: 'User has registered but not verified email'
  }
};

const UserStatusChip = ({ status }) => {
  const statusConfig = USER_STATUSES[status] || USER_STATUSES.ACTIVE;
  const IconComponent = statusConfig.icon;

  return (
    <Tooltip title={statusConfig.description} arrow>
      <Chip
        label={statusConfig.label}
        color={statusConfig.color}
        icon={<IconComponent />}
        size="small"
        sx={{ minWidth: 100 }}
      />
    </Tooltip>
  );
};

UserStatusChip.propTypes = {
  status: PropTypes.oneOf(Object.keys(USER_STATUSES)).isRequired,
};

export default UserStatusChip; 