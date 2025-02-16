import { createTheme } from '@mui/material/styles';

// Common components configuration shared between themes
const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 500,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
        },
      },
    },
  },
};

// Common typography configuration
const commonTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontWeight: 600,
    fontSize: '2.5rem',
  },
  h2: {
    fontWeight: 600,
    fontSize: '2rem',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  button: {
    textTransform: 'none',
    fontWeight: 500,
  },
};

// Light Theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6B46C1',
      light: '#9F7AEA',
      dark: '#553C9A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4FD1C5',
      light: '#76E4F7',
      dark: '#38B2AC',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F7FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3748',
      secondary: '#4A5568',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: commonTypography,
  components: {
    ...commonComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Dark Theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#805AD5',
      light: '#9F7AEA',
      dark: '#6B46C1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4FD1C5',
      light: '#76E4F7',
      dark: '#38B2AC',
      contrastText: '#ffffff',
    },
    background: {
      default: '#1A202C',
      paper: '#2D3748',
    },
    text: {
      primary: '#F7FAFC',
      secondary: '#E2E8F0',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: commonTypography,
  components: {
    ...commonComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(45, 55, 72, 0.9)',
          backdropFilter: 'blur(6px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Custom theme utilities
export const getThemeTokens = (mode) => ({
  shadows: mode === 'dark' 
    ? ['none', '0 4px 6px rgba(0, 0, 0, 0.3)']
    : ['none', '0 4px 6px rgba(0, 0, 0, 0.1)'],
  transitions: {
    smooth: 'all 0.3s ease-in-out',
  },
});

// Theme type definitions (if using TypeScript)
export const themeConstants = {
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
}; 