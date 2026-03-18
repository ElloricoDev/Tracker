/**
 * Neomorphism Theme System
 * Provides color palettes, shadows, spacing, and typography for neomorphism design
 */

const lightTheme = {
  name: 'light',
  
  colors: {
    // Background colors
    background: '#e0e5ec',
    surface: '#e0e5ec',
    surfaceElevated: '#e8edf4',
    
    // Primary colors
    primary: '#5e81f4',
    primaryDark: '#4a67d9',
    primaryLight: '#7c9aff',
    
    // Accent colors
    accent: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // Text colors
    text: '#1e252b',
    textSecondary: '#5e6a73',
    textTertiary: '#8b95a1',
    textInverse: '#ffffff',
    
    // Icon colors
    icon: '#5e6a73',
    iconSecondary: '#8b95a1',
    
    // Border colors
    border: '#c5cdd6',
    borderLight: '#d4dce5',
    
    // Status colors
    info: '#3b82f6',
    infoBg: '#dbeafe',
    successBg: '#d1fae5',
    warningBg: '#fef3c7',
    errorBg: '#fee2e2',
  },
  
  shadows: {
    // Neomorphism shadows - light source from top-left
    pressed: {
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      // Inner shadow effect for pressed state
      innerShadow: 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
    },
    raised: {
      // Top-left light shadow
      light: {
        shadowColor: '#ffffff',
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      // Bottom-right dark shadow
      dark: {
        shadowColor: '#a3b1c6',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
    },
    raisedSoft: {
      light: {
        shadowColor: '#ffffff',
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
      },
      dark: {
        shadowColor: '#a3b1c6',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
    },
    floating: {
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 999,
  },
  
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 26,
    },
    body: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
    },
    bodyBold: {
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
};

const darkTheme = {
  name: 'dark',
  
  colors: {
    // Background colors
    background: '#1a1f2e',
    surface: '#1a1f2e',
    surfaceElevated: '#232936',
    
    // Primary colors
    primary: '#7c9aff',
    primaryDark: '#5e81f4',
    primaryLight: '#9db3ff',
    
    // Accent colors
    accent: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    
    // Text colors
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#1e252b',
    
    // Icon colors
    icon: '#cbd5e1',
    iconSecondary: '#94a3b8',
    
    // Border colors
    border: '#2d3748',
    borderLight: '#374151',
    
    // Status colors
    info: '#60a5fa',
    infoBg: '#1e3a5f',
    successBg: '#1a3d2e',
    warningBg: '#3d2e1a',
    errorBg: '#3d1a1a',
  },
  
  shadows: {
    // Neomorphism shadows for dark theme
    pressed: {
      shadowColor: '#0d1117',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
      innerShadow: 'inset 4px 4px 8px #0d1117, inset -4px -4px 8px #2d3748',
    },
    raised: {
      light: {
        shadowColor: '#2d3748',
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      dark: {
        shadowColor: '#0d1117',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
      },
    },
    raisedSoft: {
      light: {
        shadowColor: '#2d3748',
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      dark: {
        shadowColor: '#0d1117',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
      },
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 999,
  },
  
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 26,
    },
    body: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
    },
    bodyBold: {
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
};

module.exports = { themes, lightTheme, darkTheme };
