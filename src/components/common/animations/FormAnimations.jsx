import { TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

export const AnimatedTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

// Using motion component directly
const MotionButton = motion(Button);
export const AnimatedButton = styled(MotionButton)({
  borderRadius: '8px',
  padding: '12px 24px',
  background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
  boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #553C9A 30%, #6B46C1 90%)',
  },
});

export const staggeredFormAnimations = {
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  },
}; 