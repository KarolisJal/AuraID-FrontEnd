import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import { AdminPanelSettings, Person } from '@mui/icons-material';

const RoleBasedRoute = ({ adminComponent, userComponent }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState(user?.roles?.includes('ADMIN') ? 'admin' : 'user');

  const hasAdminRole = user?.roles?.includes('ADMIN');
  const hasUserRole = user?.roles?.includes('USER');
  const hasBothRoles = hasAdminRole && hasUserRole;

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  // If user has only admin role, show admin component
  if (hasAdminRole && !hasUserRole) {
    return adminComponent;
  }

  // If user has only user role, show user component
  if (!hasAdminRole && hasUserRole) {
    return userComponent;
  }

  // If user has both roles, show toggle and respective component
  return (
    <Box>
      {hasBothRoles && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Paper elevation={2} sx={{ p: 0.5 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              aria-label="dashboard view mode"
              size="small"
            >
              <ToggleButton 
                value="admin" 
                aria-label="admin view"
                sx={{ 
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <AdminPanelSettings sx={{ mr: 1 }} />
                Admin View
              </ToggleButton>
              <ToggleButton 
                value="user" 
                aria-label="user view"
                sx={{ 
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <Person sx={{ mr: 1 }} />
                User View
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Box>
      )}
      {viewMode === 'admin' ? adminComponent : userComponent}
    </Box>
  );
};

export default RoleBasedRoute; 