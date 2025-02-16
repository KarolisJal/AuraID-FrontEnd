import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
} from '@mui/material';
import {
  Refresh,
  FilterList,
  Info,
  Warning,
  Error as ErrorIcon,
  Timeline,
  LocationOn,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers';
import { LoadingScreen } from '../../../components/common';
import { auditService } from '../../../services/auditService';
import { toast } from 'react-toastify';

const actionColors = {
  LOGIN: 'primary',
  LOGOUT: 'secondary',
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  FAILED_LOGIN: 'error',
};

const actionIcons = {
  LOGIN: <Info color="primary" />,
  LOGOUT: <Info color="secondary" />,
  CREATE: <Info color="success" />,
  UPDATE: <Info color="info" />,
  DELETE: <ErrorIcon color="error" />,
  FAILED_LOGIN: <Warning color="error" />,
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activitySummary, setActivitySummary] = useState(null);
  const [filter, setFilter] = useState({
    action: '',
    username: '',
    entityType: '',
    ipAddress: '',
    startDate: null,
    endDate: null,
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const searchParams = {
        limit: rowsPerPage,
        username: filter.username || undefined,
        action: filter.action || undefined,
        entityType: filter.entityType || undefined,
        ipAddress: filter.ipAddress || undefined,
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined,
      };

      const data = await auditService.searchAuditLogs(searchParams);
      setLogs(data || []);

      // If username is filtered, fetch activity summary
      if (filter.username) {
        const summaryData = await auditService.getUserActivitySummary(filter.username);
        setActivitySummary(summaryData);
      } else {
        setActivitySummary(null);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast.error('Failed to fetch audit logs');
      setLogs([]);
      setActivitySummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [rowsPerPage, filter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilter({
      action: '',
      username: '',
      entityType: '',
      ipAddress: '',
      startDate: null,
      endDate: null,
    });
  };

  if (loading && !logs.length) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Activity Summary Card */}
      {activitySummary && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>User Activity Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Total Actions</Typography>
                <Typography variant="h4">{activitySummary.totalActions}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Common Actions</Typography>
                <Stack spacing={1}>
                  {activitySummary.commonActions?.map(action => (
                    <Chip
                      key={action.action}
                      label={`${action.action}: ${action.count}`}
                      size="small"
                      color={actionColors[action.action] || 'default'}
                    />
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">IP Addresses</Typography>
                <Stack spacing={1}>
                  {activitySummary.ipAddresses?.map(ip => (
                    <Chip
                      key={ip.ip}
                      icon={<LocationOn />}
                      label={`${ip.ip}: ${ip.count}`}
                      size="small"
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Audit Logs</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<FilterList />}
              size="small"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchLogs}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                name="action"
                value={filter.action}
                onChange={handleFilterChange}
                label="Action"
              >
                <MenuItem value="">All</MenuItem>
                {Object.keys(actionColors).map(action => (
                  <MenuItem key={action} value={action}>{action}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Username"
              name="username"
              value={filter.username}
              onChange={handleFilterChange}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Entity Type"
              name="entityType"
              value={filter.entityType}
              onChange={handleFilterChange}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="IP Address"
              name="ipAddress"
              value={filter.ipAddress}
              onChange={handleFilterChange}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <DatePicker
              label="Start Date"
              value={filter.startDate}
              onChange={(newValue) => handleDateChange('startDate', newValue)}
              renderInput={(params) => <TextField {...params} size="small" fullWidth />}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <DatePicker
              label="End Date"
              value={filter.endDate}
              onChange={(newValue) => handleDateChange('endDate', newValue)}
              renderInput={(params) => <TextField {...params} size="small" fullWidth />}
            />
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Entity Type</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow key={`${log.username}-${log.timestamp}`}>
                    <TableCell>
                      <Chip
                        icon={actionIcons[log.action]}
                        label={log.action}
                        color={actionColors[log.action] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>
                      <Tooltip title={log.userAgent || 'N/A'}>
                        <span>{log.ipAddress}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        color={log.status === 'SUCCESS' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.timestamp), 'PPpp')}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={logs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default AuditLog; 