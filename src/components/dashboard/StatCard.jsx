import { Card, CardContent, Typography, Box, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

const MotionCard = motion(Card);

const StatCard = ({ title, value, subtitle, icon, color = 'primary', onClick }) => {
  const cardStyles = {
    height: '100%',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': onClick ? {
      transform: 'translateY(-4px)',
      boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette[color].main, 0.25)}`,
    } : {},
  };

  const iconWrapperStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: (theme) => alpha(theme.palette[color].main, 0.1),
    color: `${color}.main`,
    marginBottom: 2,
  };

  return (
    <MotionCard
      sx={cardStyles}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardContent>
        <Box sx={iconWrapperStyles}>
          {icon}
        </Box>

        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 600 }}>
          {value}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>

        {subtitle && (
          <Tooltip title={subtitle}>
            <Typography
              variant="caption"
              sx={{
                color: `${color}.main`,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </Typography>
          </Tooltip>
        )}
      </CardContent>
    </MotionCard>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'error',
    'warning',
    'info',
    'success',
  ]),
  onClick: PropTypes.func,
};

export default StatCard;