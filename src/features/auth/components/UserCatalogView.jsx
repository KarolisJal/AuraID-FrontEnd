import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

const UserCatalogView = ({ user }) => {
  return (
    <Card>
      <CardContent>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            background: 'linear-gradient(45deg, #6B46C1 30%, #805AD5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {user.username}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmailIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
          <Typography variant="body2">{user.email}</Typography>
        </Box>
        
        {user.phoneNumber && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
            <Typography variant="body2">{user.phoneNumber}</Typography>
          </Box>
        )}
        
        {user.country && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
            <Typography variant="body2">{user.country}</Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          {user.roles?.map(role => (
            <Chip 
              key={role}
              label={role.replace('ROLE_', '')}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>

        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ display: 'block', mt: 2 }}
        >
          Joined {format(new Date(user.createdAt), 'PP')}
        </Typography>
      </CardContent>
    </Card>
  );
};

UserCatalogView.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phoneNumber: PropTypes.string,
    country: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default UserCatalogView;