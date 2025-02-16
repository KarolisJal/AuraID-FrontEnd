import { Box, Typography, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check, Close } from '@mui/icons-material';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
}));

const RequirementItem = styled(Box)(({ theme, met }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: met ? theme.palette.success.main : theme.palette.text.secondary,
  '& svg': {
    fontSize: '1rem',
  },
}));

const getPasswordStrength = (password) => {
  let strength = 0;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  strength += Object.values(requirements).filter(Boolean).length;
  
  return {
    score: (strength / 5) * 100,
    requirements,
  };
};

const getStrengthColor = (score) => {
  if (score < 40) return 'error';
  if (score < 70) return 'warning';
  return 'success';
};

const getStrengthLabel = (score) => {
  if (score < 40) return 'Weak';
  if (score < 70) return 'Medium';
  return 'Strong';
};

const PasswordStrengthIndicator = ({ password }) => {
  const { score, requirements } = getPasswordStrength(password);
  const strengthColor = getStrengthColor(score);
  const strengthLabel = getStrengthLabel(score);

  return (
    <StyledBox>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        Password Strength: <span style={{ color: `var(--mui-palette-${strengthColor}-main)` }}>{strengthLabel}</span>
      </Typography>
      
      <LinearProgress
        variant="determinate"
        value={score}
        color={strengthColor}
        sx={{ mb: 2, mt: 1 }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 3 }}>
        <RequirementItem met={requirements.length}>
          {requirements.length ? <Check /> : <Close />}
          <Typography variant="caption">At least 8 characters</Typography>
        </RequirementItem>
        
        <RequirementItem met={requirements.uppercase}>
          {requirements.uppercase ? <Check /> : <Close />}
          <Typography variant="caption">One uppercase letter</Typography>
        </RequirementItem>
        
        <RequirementItem met={requirements.lowercase}>
          {requirements.lowercase ? <Check /> : <Close />}
          <Typography variant="caption">One lowercase letter</Typography>
        </RequirementItem>
        
        <RequirementItem met={requirements.number}>
          {requirements.number ? <Check /> : <Close />}
          <Typography variant="caption">One number</Typography>
        </RequirementItem>
        
        <RequirementItem met={requirements.special}>
          {requirements.special ? <Check /> : <Close />}
          <Typography variant="caption">One special character</Typography>
        </RequirementItem>
      </Box>
    </StyledBox>
  );
};

export default PasswordStrengthIndicator; 