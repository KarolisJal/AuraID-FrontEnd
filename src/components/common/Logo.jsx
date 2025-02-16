import { Box, Typography, styled } from '@mui/material';
import PropTypes from 'prop-types';
import { themeConstants } from '../../theme/index';
import { styled as muiStyled } from '@mui/material/styles';

const LogoContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
});

const LogoMainContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

const LogoIcon = styled('div')({
  width: '40px',
  height: '40px',
  background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '24px',
    height: '24px',
    background: 'white',
    borderRadius: '8px',
    opacity: 0.9,
    transform: 'rotate(45deg)',
    transition: 'background-color 0.3s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '16px',
    height: '16px',
    background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
    borderRadius: '6px',
    transform: 'rotate(45deg)',
  }
});

const LogoText = muiStyled(Typography)({
  fontWeight: 700,
  fontSize: '1.5rem',
  color: '#6366F1',
  textDecoration: 'none',
  letterSpacing: 1,
});

const LogoSubtext = styled(Typography)({
  color: 'rgba(0, 0, 0, 0.7)',
  fontSize: '0.875rem',
  fontWeight: 500,
  fontFamily: "'Space Grotesk', sans-serif",
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  transition: 'color 0.3s ease',
});

const Logo = ({ showSubtext = true, size = 'medium', color = 'default' }) => {
  const sizes = {
    small: {
      icon: '32px',
      text: '1.5rem'
    },
    medium: {
      icon: '40px',
      text: '2.5rem'
    },
    large: {
      icon: '48px',
      text: '3rem'
    }
  };

  const getColorStyles = () => {
    if (color === 'white') {
      return {
        icon: {
          background: 'white',
          '&::before': {
            background: 'rgba(255, 255, 255, 0.9)',
          },
          '&::after': {
            background: 'white',
          }
        },
        text: {
          color: 'white',
        },
        subtext: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      };
    }
    return {};
  };

  const currentSize = sizes[size] || sizes.medium;
  const colorStyles = getColorStyles();

  return (
    <LogoContainer>
      <LogoMainContent>
        <LogoIcon
          sx={{
            width: currentSize.icon,
            height: currentSize.icon,
            ...colorStyles.icon,
          }}
        />
        <LogoText
          variant="h1"
          sx={{
            fontSize: currentSize.text,
            ...colorStyles.text,
          }}
        >
          AuraID
        </LogoText>
      </LogoMainContent>
      {showSubtext && (
        <LogoSubtext sx={colorStyles.subtext}>
          Secure Authentication
        </LogoSubtext>
      )}
    </LogoContainer>
  );
};

Logo.propTypes = {
  showSubtext: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['default', 'white']),
};

export default Logo; 