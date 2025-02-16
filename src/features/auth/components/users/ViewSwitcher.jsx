import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import {
  ViewList as SimpleViewIcon,
  ViewHeadline as DetailedViewIcon,
  ViewModule as CatalogViewIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const ViewSwitcher = ({ value, onChange }) => {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, newValue) => newValue && onChange(newValue)}
      size="small"
    >
      <ToggleButton value="table">
        <Tooltip title="Simple View">
          <SimpleViewIcon />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="detailed">
        <Tooltip title="Detailed View">
          <DetailedViewIcon />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="catalog">
        <Tooltip title="Catalog View">
          <CatalogViewIcon />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

ViewSwitcher.propTypes = {
  value: PropTypes.oneOf(['table', 'detailed', 'catalog']).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ViewSwitcher; 