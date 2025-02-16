import { Box, Toolbar, Container, CircularProgress } from '@mui/material';
import Navbar from './Navbar';
import PropTypes from 'prop-types';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { themeConstants } from '../../theme/index';

const MainLayout = ({ children }) => {
  const muiTheme = useMuiTheme();
  const { currentTheme } = useTheme();
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          minHeight: '100vh',
          background: currentTheme === 'light'
            ? `
              linear-gradient(135deg, rgba(107, 70, 193, 0.03) 0%, rgba(128, 90, 213, 0.03) 100%),
              radial-gradient(circle at 100% 100%, rgba(107, 70, 193, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 0% 0%, rgba(128, 90, 213, 0.05) 0%, transparent 50%)
            `
            : `
              linear-gradient(135deg, rgba(128, 90, 213, 0.05) 0%, rgba(107, 70, 193, 0.05) 100%),
              radial-gradient(circle at 100% 100%, rgba(128, 90, 213, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 0% 0%, rgba(107, 70, 193, 0.08) 0%, transparent 50%)
            `,
          backgroundColor: muiTheme.palette.background.default,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Toolbar /> {/* Spacing for fixed AppBar */}
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 4,
            position: 'relative',
            zIndex: 1
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout; 