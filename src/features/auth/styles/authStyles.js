import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const StyledPaper = styled(Paper)({
  padding: '32px',
  width: '100%',
  maxWidth: 400,
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
});

export const BackgroundBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100%',
  background: `url('/images/web-bg.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7))',
  }
});

export const ContentBox = styled(Box)({
  position: 'relative',
  zIndex: 1,
  width: '100%',
  padding: '24px',
  display: 'flex',
  justifyContent: 'center'
});

export const formAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const gradientTextStyles = {
  fontWeight: 700,
  background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}; 