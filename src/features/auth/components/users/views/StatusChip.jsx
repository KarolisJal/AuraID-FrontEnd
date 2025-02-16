import { Chip, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { USER_STATUSES } from '../../../constants/userConstants';

const StatusChip = ({ status }) => {
  const statusConfig = USER_STATUSES[status] || USER_STATUSES['ACTIVE'];
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

StatusChip.propTypes = {
  status: PropTypes.oneOf(Object.keys(USER_STATUSES)).isRequired
};

export default StatusChip; 