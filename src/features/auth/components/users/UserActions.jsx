import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  FileDownload as ExportIcon,
  Add as AddIcon 
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const UserActions = ({ onRefresh, onExport, onCreate }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Tooltip title="Refresh">
        <IconButton onClick={onRefresh} size="small">
          <RefreshIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Export Users">
        <IconButton onClick={onExport} size="small">
          <ExportIcon />
        </IconButton>
      </Tooltip>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreate}
        size="small"
      >
        Create User
      </Button>
    </Box>
  );
};

UserActions.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default UserActions; 