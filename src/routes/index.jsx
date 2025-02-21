import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';
import RoleBasedRoute from '../components/auth/RoleBasedRoute';
import { AuditPage } from '../features/audit';
import { Resources } from '../features/resources/pages/Resources';
import { Workflows } from '../features/workflows';
import { WorkflowTrackingDashboard } from '../features/dashboard/pages/Dashboard';
import AdminDashboard from '../features/dashboard/pages/AdminDashboard';
import UserDashboard from '../features/dashboard/pages/UserDashboard';

// Pages
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import VerifyEmail from '../features/auth/pages/VerifyEmail';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import Users from '../features/auth/pages/Users';
import Profile from '../features/auth/pages/Profile';
import Security from '../features/auth/pages/Security';
import Settings from '../features/auth/pages/Settings';
import { AccessRequests } from '../features/access-requests/pages/AccessRequests';

const Router = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={<Login />} />

      {/* Protected routes with MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={
          <MainLayout>
            <Outlet />
          </MainLayout>
        }>
          {/* Main dashboard routes */}
          <Route 
            path="/dashboard" 
            element={
              <RoleBasedRoute
                adminComponent={<AdminDashboard />}
                userComponent={<UserDashboard />}
              />
            } 
          />
          
          {/* Regular routes */}
          <Route path="/resources" element={<Resources />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/access-requests" element={<AccessRequests />} />
          
          {/* Admin-only routes */}
          <Route 
            path="/users" 
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } 
          />
          <Route 
            path="/workflows" 
            element={
              <AdminRoute>
                <Workflows />
              </AdminRoute>
            } 
          />
          <Route 
            path="/audit" 
            element={
              <AdminRoute>
                <AuditPage />
              </AdminRoute>
            } 
          />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default Router; 