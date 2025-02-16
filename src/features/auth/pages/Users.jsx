import { useState, useCallback, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import MainLayout from '../../../components/layout/MainLayout';
import { useUserManagement } from '../hooks/useUserManagement';
import { authApi } from '../../../services/api';
import UserFilters from '../components/users/UserFilters';
import UserActions from '../components/users/UserActions';
import CatalogView from '../components/users/views/CatalogView';
import SimpleTableView from '../components/users/views/SimpleTableView';
import DetailedTableView from '../components/users/views/DetailedTableView';
import CreateUserDialog from '../components/users/dialogs/CreateUserDialog';
import DeleteUserDialog from '../components/users/dialogs/DeleteUserDialog';
import EditUserDialog from '../components/users/dialogs/EditUserDialog';
import RoleManagementDialog from '../components/users/dialogs/RoleManagementDialog';
import UserDetailsDialog from '../components/users/dialogs/UserDetailsDialog';
import LoadingScreen from '../../../components/common/Loading/LoadingScreen';

const MotionContainer = styled(motion.div)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
}));

const Users = () => {
  console.log('1. Users component rendering');

  // Add this state to track component mounting
  const [isMounted, setIsMounted] = useState(false);

  // State for view mode and filters
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 0,
    rowsPerPage: 10,
    orderBy: 'username',
    order: 'asc'
  });

  const {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRoles,
  } = useUserManagement();

  console.log('2. Current state:', { users, loading, error });

  useEffect(() => {
    console.log('3. Component mount effect running');
    setIsMounted(true);

    // Check current user and roles
    authApi.getCurrentUser()
      .then(response => {
        console.log('4. Current user data:', response.data);
        console.log('5. User roles:', response.data.roles);
      })
      .catch(error => {
        console.error('6. Error getting current user:', error);
      });

    // Manual fetch users call
    fetchUsers()
      .then(() => {
        console.log('7. fetchUsers completed');
      })
      .catch(error => {
        console.error('8. Error in fetchUsers:', error);
      });

    return () => {
      console.log('9. Component unmounting');
      setIsMounted(false);
    };
  }, [fetchUsers]);

  // Log when users data changes
  useEffect(() => {
    console.log('10. Users data changed:', users);
  }, [users]);

  // Dialog states
  const [dialogs, setDialogs] = useState({
    create: false,
    edit: false,
    delete: false,
    details: false,
    roles: false
  });

  const [selectedUser, setSelectedUser] = useState(null);

  // Dialog handlers
  const handleOpenDialog = (dialog, user = null) => {
    setSelectedUser(user);
    setDialogs(prev => ({ ...prev, [dialog]: true }));
  };

  const handleCloseDialog = (dialog) => {
    setDialogs(prev => ({ ...prev, [dialog]: false }));
    setSelectedUser(null);
  };

  // Filter handlers
  const handleSort = (property) => {
    setFilters(prev => ({
      ...prev,
      orderBy: property,
      order: prev.orderBy === property && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
                          user.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || user.status === filters.status;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const order = filters.order === 'asc' ? 1 : -1;
      return a[filters.orderBy] > b[filters.orderBy] ? order : -order;
    });

  // Action handlers
  const handleCreateUser = async (userData) => {
    await createUser(userData);
    handleCloseDialog('create');
  };

  const handleUpdateUser = async (username, userData) => {
    await updateUser(username, userData);
    handleCloseDialog('edit');
  };

  const handleDeleteUser = async (username) => {
    await deleteUser(username);
    handleCloseDialog('delete');
  };

  const handleUpdateRoles = async (username, roles) => {
    await updateUserRoles(username, roles);
    handleCloseDialog('roles');
  };

  // Render the appropriate view component
  const renderView = () => {
    const viewProps = {
      users: filteredUsers,
      onEdit: (user) => handleOpenDialog('edit', user),
      onDelete: (user) => handleOpenDialog('delete', user),
      onStatusChange: updateUserStatus,
      orderBy: filters.orderBy,
      order: filters.order,
      onSort: handleSort,
    };

    switch (viewMode) {
      case 'catalog':
        return <CatalogView {...viewProps} onRoleChange={(user) => handleOpenDialog('roles', user)} />;
      case 'detailed':
        return <DetailedTableView {...viewProps} />;
      default:
        return <SimpleTableView {...viewProps} />;
    }
  };

  if (loading) {
    console.log('11. Rendering loading state');
    return <LoadingScreen />;
  }

  if (error) {
    console.log('12. Rendering error state:', error);
    // You might want to add error handling UI here
  }

  return (
    <MainLayout>
      <Container maxWidth="xl">
        <MotionContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <UserFilters
              filters={filters}
              onFiltersChange={setFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <UserActions
              onRefresh={fetchUsers}
              onExport={() => {}} // Implement if needed
              onCreate={() => handleOpenDialog('create')}
            />
          </Box>

          {renderView()}

          {/* Dialogs */}
          <CreateUserDialog
            open={dialogs.create}
            onClose={() => handleCloseDialog('create')}
            onSave={handleCreateUser}
          />

          <EditUserDialog
            open={dialogs.edit}
            user={selectedUser}
            onClose={() => handleCloseDialog('edit')}
            onSave={handleUpdateUser}
          />

          <DeleteUserDialog
            open={dialogs.delete}
            user={selectedUser}
            onClose={() => handleCloseDialog('delete')}
            onConfirm={handleDeleteUser}
          />

          <RoleManagementDialog
            open={dialogs.roles}
            user={selectedUser}
            onClose={() => handleCloseDialog('roles')}
            onSave={handleUpdateRoles}
          />

          <UserDetailsDialog
            open={dialogs.details}
            user={selectedUser}
            onClose={() => handleCloseDialog('details')}
          />
        </MotionContainer>
      </Container>
    </MainLayout>
  );
};

export default Users;