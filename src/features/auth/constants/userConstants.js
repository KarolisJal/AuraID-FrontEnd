import {
  CheckCircle as ActiveIcon,
  Block as BlockIcon,
  PauseCircle as InactiveIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';

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

// Array format for Select component options
export const USER_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: USER_STATUSES.ACTIVE.label },
  { value: 'INACTIVE', label: USER_STATUSES.INACTIVE.label },
  { value: 'BLOCKED', label: USER_STATUSES.BLOCKED.label },
  { value: 'PENDING', label: USER_STATUSES.PENDING.label }
]; 