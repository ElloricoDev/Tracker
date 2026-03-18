/**
 * Material-inspired Theme System
 * Provides color palettes, shadows, spacing, and typography.
 */

const lightTheme = {
  name: 'light',
  
  colors: {
    // Background colors
    background: '#f5f7fb',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceContainer: '#e9eef7',
    surfaceContainerHigh: '#dde6f3',
    surfaceContainerHighest: '#d2ddec',
    
    // Primary colors
    primary: '#2f5fa7',
    primaryDark: '#244a82',
    primaryLight: '#6f95d4',
    
    // Accent colors
    accent: '#4c8db5',
    success: '#1f9d68',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // Text colors
    text: '#1e252b',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
    textInverse: '#ffffff',
    
    // Icon colors
    icon: '#4b5563',
    iconSecondary: '#6b7280',
    
    // Border colors
    border: '#c6d2e1',
    borderLight: '#dbe4ef',
    outline: '#9eb4cc',
    scrim: 'rgba(17, 24, 39, 0.42)',
    
    // Status colors
    info: '#4c8db5',
    infoBg: '#deedf7',
    successBg: '#daf3e7',
    warningBg: '#fef3c7',
    errorBg: '#fee2e2',
  },
  
  shadows: {
    // Neomorphism shadows - light source from top-left
    pressed: {
      shadowColor: '#a5b3c7',
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
        shadowColor: '#b0bfd2',
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
        shadowColor: '#b6c4d6',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
    },
    floating: {
      shadowColor: '#a9b8cb',
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
    background: '#0f1724',
    surface: '#182130',
    surfaceElevated: '#1d2938',
    surfaceContainer: '#223042',
    surfaceContainerHigh: '#2a3950',
    surfaceContainerHighest: '#324561',
    
    // Primary colors
    primary: '#7da6ff',
    primaryDark: '#5f87de',
    primaryLight: '#adc4ff',
    
    // Accent colors
    accent: '#67c6d9',
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
    border: '#31435a',
    borderLight: '#40526a',
    outline: '#6581a4',
    scrim: 'rgba(2, 6, 23, 0.62)',
    
    // Status colors
    info: '#67c6d9',
    infoBg: '#183446',
    successBg: '#173e28',
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
        shadowColor: '#2d3b50',
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
        shadowColor: '#33455c',
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
