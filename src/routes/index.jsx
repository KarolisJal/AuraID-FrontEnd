import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AuthProvider } from '../contexts/AuthContext';
import { LoadingProvider } from '../contexts/LoadingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';
import RoleBasedRoute from '../components/auth/RoleBasedRoute';
import { AuditPage } from '../features/audit';

// Pages
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import VerifyEmail from '../features/auth/pages/VerifyEmail';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import AdminDashboard from '../features/dashboard/pages/AdminDashboard';
import UserDashboard from '../features/dashboard/pages/UserDashboard';
import Users from '../features/auth/pages/Users';
import Profile from '../features/auth/pages/Profile';
import Security from '../features/auth/pages/Security';
import Settings from '../features/auth/pages/Settings';

export const AppProviders = ({ children }) => (
  <BrowserRouter>
    <LoadingProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </ThemeProvider>
    </LoadingProvider>
  </BrowserRouter>
);

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
          <Route 
            path="/dashboard" 
            element={
              <RoleBasedRoute
                adminComponent={<AdminDashboard />}
                userComponent={<UserDashboard />}
              />
            } 
          />
          <Route 
            path="/users" 
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } 
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit" element={<AuditPage />} />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default Router; 