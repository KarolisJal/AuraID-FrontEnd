import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { AdminWorkflowDashboard } from '../../workflows/components/AdminWorkflowDashboard';
import { UserWorkflowDashboard } from '../../workflows/components/UserWorkflowDashboard';

export const WorkflowTrackingDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          Access Requests
        </Typography>
      </Box>

      {isAdmin ? (
        <AdminWorkflowDashboard />
      ) : (
        <UserWorkflowDashboard />
      )}
    </Container>
  );
}; 