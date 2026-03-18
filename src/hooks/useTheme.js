/**
 * Theme Hook and Context
 * Provides access to current theme and theme switching functionality
 */

const React = require('react');
const { themes } = require('../theme/theme');
const { getElevationStyle, getPressedStyle } = require('../theme/tokens');

const ThemeContext = React.createContext({
  theme: themes.light,
  isDarkMode: false,
  toggleTheme: () => {},
});

/**
 * Theme Provider Component
 * Wraps the app to provide theme context
 */
function ThemeProvider({ children, initialDarkMode = false }) {
  const [isDarkMode, setIsDarkMode] = React.useState(initialDarkMode);
  
  const theme = React.useMemo(() => {
    const baseTheme = isDarkMode ? themes.dark : themes.light;
    
    // Add elevation styles to theme
    return {
      ...baseTheme,
      elevations: {
        flat: getElevationStyle('flat', isDarkMode),
        low: getElevationStyle('low', isDarkMode),
        medium: getElevationStyle('medium', isDarkMode),
        high: getElevationStyle('high', isDarkMode),
        floating: getElevationStyle('floating', isDarkMode),
        pressed: getPressedStyle(isDarkMode),
      },
    };
  }, [isDarkMode]);
  
  const toggleTheme = React.useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);
  
  const setThemeMode = React.useCallback((mode) => {
    setIsDarkMode(mode === 'dark');
  }, []);
  
  const value = React.useMemo(
    () => ({
      theme,
      isDarkMode,
      toggleTheme,
      setThemeMode,
    }),
    [theme, isDarkMode, toggleTheme, setThemeMode]
  );
  
  return React.createElement(ThemeContext.Provider, { value }, children);
}

/**
 * Hook to access theme context
 * @returns {object} Theme context with theme, isDarkMode, and toggleTheme
 * @example
 * const { theme, isDarkMode, toggleTheme } = useTheme();
 * const textColor = theme.colors.text;
 */
function useTheme() {
  const context = React.useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

module.exports = { ThemeProvider, useTheme, ThemeContext };
