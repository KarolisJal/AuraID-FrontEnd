import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme, themeConstants } from './index';
import { GlobalStyles } from '@mui/material';

const ThemeContext = createContext({
  currentTheme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  themeConstants: {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const theme = currentTheme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider 
      value={{ 
        currentTheme, 
        toggleTheme, 
        setTheme: setCurrentTheme,
        themeConstants 
      }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            '*': {
              transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
              boxSizing: 'border-box',
            },
            'body': {
              minHeight: '100vh',
            },
            ':root': {
              ...Object.entries(themeConstants).reduce((acc, [key, value]) => ({
                ...acc,
                [`--${key}`]: value,
              }), {}),
            },
          }}
        />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
} 