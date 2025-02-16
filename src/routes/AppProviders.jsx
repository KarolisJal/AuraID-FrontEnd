import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeProvider';
import { AuthProvider } from '../contexts/AuthContext';
import { LoadingProvider } from '../contexts/LoadingContext';
import { ToastContainer } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, Box, Button } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Box sx={{ p: 3 }}>
    <Alert 
      severity="error" 
      action={
        <Button color="inherit" size="small" onClick={resetErrorBoundary}>
          Try again
        </Button>
      }
    >
      Something went wrong: {error.message}
    </Alert>
  </Box>
);

export const AppProviders = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <BrowserRouter>
      <LoadingProvider>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                theme="colored"
              />
            </AuthProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </LoadingProvider>
    </BrowserRouter>
  </ErrorBoundary>
); 