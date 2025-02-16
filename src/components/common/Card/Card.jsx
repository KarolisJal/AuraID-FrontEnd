import { memo } from 'react';
import { Card as MuiCard, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useTheme } from '../../../theme/ThemeProvider';

const MotionCard = motion(MuiCard);

const Card = ({ 
  title, 
  subtitle,
  icon,
  children,
  onClick,
  elevation = 1,
  animate = true,
  sx = {}
}) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const cardProps = animate ? {
    component: MotionCard,
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <MuiCard
      {...cardProps}
      elevation={elevation}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        background: isDark ? 'rgba(45, 55, 72, 0.5)' : 'white',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease-in-out',
        ...sx
      }}
    >
      <CardContent>
        {(title || icon) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            {icon && (
              <Box sx={{ color: 'primary.main' }}>
                {icon}
              </Box>
            )}
            {title && (
              <Typography variant="h6" component="div">
                {title}
              </Typography>
            )}
          </Box>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        {children}
      </CardContent>
    </MuiCard>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node,
  onClick: PropTypes.func,
  elevation: PropTypes.number,
  animate: PropTypes.bool,
  sx: PropTypes.object
};

export default memo(Card); 