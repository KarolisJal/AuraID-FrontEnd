import { Box, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check, Close, Info } from '@mui/icons-material';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
}));

const StatusIcon = ({ status, loading }) => {
  if (loading) return <CircularProgress size={16} />;
  if (status === 'valid') return <Check color="success" />;
  if (status === 'invalid') return <Close color="error" />;
  return <Info color="disabled" />;
};

const ValidationIndicator = ({ 
  title,
  status = 'pending',
  loading = false,
  message = '',
  requirements = []
}) => {
  // Calculate overall status based on requirements if they exist
  const calculateOverallStatus = () => {
    if (loading) return 'pending';
    if (requirements.length === 0) return status;

    const allRequirementsMet = requirements.every(req => req.met);
    if (allRequirementsMet) return 'valid';
    return 'invalid';
  };

  const overallStatus = calculateOverallStatus();

  const getColor = (currentStatus) => {
    if (loading) return 'text.secondary';
    switch (currentStatus) {
      case 'valid': return 'success.main';
      case 'invalid': return 'error.main';
      default: return 'text.secondary';
    }
  };

  return (
    <StyledBox>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <StatusIcon status={overallStatus} loading={loading} />
        <Typography variant="subtitle2" color={getColor(overallStatus)}>
          {title}
        </Typography>
      </Box>

      {message && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: 'block', 
            mb: 1,
            pl: 3 // Align with title
          }}
        >
          {message}
        </Typography>
      )}

      {requirements.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 3 }}>
          {requirements.map((req, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StatusIcon status={req.met ? 'valid' : 'invalid'} />
              <Typography variant="caption" color="text.secondary">
                {req.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </StyledBox>
  );
};

export default ValidationIndicator; 