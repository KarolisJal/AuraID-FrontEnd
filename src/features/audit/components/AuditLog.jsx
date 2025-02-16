import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { auditService } from '../../../services/auditService';

const actionColors = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  LOGIN: 'primary',
  LOGOUT: 'default',
  LOGIN_FAILED: 'error',
  SUSPICIOUS: 'warning',
};

const actionIcons = {
  CREATE: <SuccessIcon fontSize="small" />,
  UPDATE: <InfoIcon fontSize="small" />,
  DELETE: <ErrorIcon fontSize="small" />,
  LOGIN: <SuccessIcon fontSize="small" />,
  LOGOUT: <InfoIcon fontSize="small" />,
  LOGIN_FAILED: <ErrorIcon fontSize="small" />,
  SUSPICIOUS: <WarningIcon fontSize="small" />,
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    action: '',
    username: '',
    entityType: '',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (Object.values(filters).some(value => value)) {
        // If any filter is active, use search endpoint
        response = await auditService.searchAuditLogs({
          ...filters,
          limit: rowsPerPage,
        });
      } else {
        // Otherwise use recent logs endpoint
        response = await auditService.getRecentAuditLogs({
          page,
          size: rowsPerPage,
        });
      }

      setLogs(response || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Action"
          select
          value={filters.action}
          onChange={handleFilterChange('action')}
          sx={{ minWidth: 120 }}
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          {Object.keys(actionColors).map((action) => (
            <MenuItem key={action} value={action}>
              {action}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Username"
          value={filters.username}
          onChange={handleFilterChange('username')}
          size="small"
        />
        <TextField
          label="Entity Type"
          value={filters.entityType}
          onChange={handleFilterChange('entityType')}
          size="small"
        />
        <Tooltip title="Refresh">
          <IconButton onClick={fetchLogs} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ my: 4 }}>
          No audit logs found
        </Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Entity Type</TableCell>
                  <TableCell>Entity ID</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip
                        icon={actionIcons[log.action]}
                        label={log.action}
                        color={actionColors[log.action]}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell>{log.entityId}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={-1}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}
    </Box>
  );
};

export default AuditLog; 