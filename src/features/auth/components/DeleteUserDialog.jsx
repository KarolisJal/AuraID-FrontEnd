import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const DeleteUserDialog = ({ user, open, onClose, onConfirm, loading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        Confirm Delete User
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="body1">
            Are you sure you want to delete the user <strong>{user?.username}</strong>?
            This action cannot be undone.
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          All data associated with this user will be permanently removed from the system.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(user?.username)}
          color="error"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DeleteUserDialog.propTypes = {
  user: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default DeleteUserDialog; 