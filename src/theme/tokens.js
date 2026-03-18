/**
 * Design Tokens for Neomorphism UI
 * Centralized design constants for consistent styling
 */

const designTokens = {
  // Elevation levels for neomorphism depth
  elevation: {
    flat: 0,
    low: 1,
    medium: 2,
    high: 3,
    floating: 4,
  },
  
  // Shadow configurations for different elevations
  elevationShadows: {
    flat: {
      // No shadow
      light: null,
      dark: null,
    },
    low: {
      // Subtle depth
      light: {
        shadowColor: '#ffffff',
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.7,
        shadowRadius: 4,
      },
      dark: {
        shadowColor: '#a3b1c6',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    },
    medium: {
      // Standard neomorphism depth
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
    high: {
      // More prominent depth
      light: {
        shadowColor: '#ffffff',
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      dark: {
        shadowColor: '#a3b1c6',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
    },
    floating: {
      // Elevated floating effect
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Dark theme elevation shadows
  elevationShadowsDark: {
    flat: {
      light: null,
      dark: null,
    },
    low: {
      light: {
        shadowColor: '#2d3748',
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      dark: {
        shadowColor: '#0d1117',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
      },
    },
    medium: {
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
    high: {
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
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Pressed state shadows (inset effect)
  pressedShadow: {
    light: {
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
    },
    dark: {
      shadowColor: '#0d1117',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
    },
  },
  
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Border radius scale
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 999,
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Transition easing
  easing: {
    standard: 'ease-in-out',
    enter: 'ease-out',
    exit: 'ease-in',
  },
  
  // Opacity levels
  opacity: {
    pressed: 0.7,
    disabled: 0.4,
    overlay: 0.5,
    subtle: 0.1,
  },
  
  // Standard sizes for components
  sizes: {
    iconButton: 40,
    button: 44,
    input: 48,
    card: {
      small: 120,
      medium: 240,
      large: 360,
    },
  },
  
  // Grid and layout
  layout: {
    containerPadding: 20,
    cardPadding: 16,
    sectionGap: 16,
    contentGap: 12,
  },
};

/**
 * Helper function to get elevation styles for a given level
 * @param {string} level - 'flat', 'low', 'medium', 'high', or 'floating'
 * @param {boolean} isDark - whether dark mode is active
 * @returns {object} Style object with shadow properties
 */
function getElevationStyle(level = 'medium', isDark = false) {
  const shadows = isDark ? designTokens.elevationShadowsDark : designTokens.elevationShadows;
  const shadowConfig = shadows[level];
  
  if (!shadowConfig) {
    return {};
  }
  
  // For floating, return single shadow
  if (level === 'floating') {
    return {
      ...shadowConfig,
      elevation: shadowConfig.elevation || 0,
    };
  }
  
  // For neomorphism, we can only apply one shadow in React Native
  // We'll use the dark shadow as primary and add elevation for Android
  if (shadowConfig.dark) {
    return {
      ...shadowConfig.dark,
      elevation: designTokens.elevation[level] || 0,
    };
  }
  
  return {};
}

/**
 * Helper function to get pressed state styles
 * @param {boolean} isDark - whether dark mode is active
 * @returns {object} Style object for pressed state
 */
function getPressedStyle(isDark = false) {
  const shadow = isDark ? designTokens.pressedShadow.dark : designTokens.pressedShadow.light;
  return {
    ...shadow,
    opacity: designTokens.opacity.pressed,
  };
}

/**
 * Helper function to create neomorphism card style
 * @param {boolean} isDark - whether dark mode is active
 * @param {string} elevation - elevation level
 * @returns {object} Complete card style object
 */
function createNeomorphismCard(isDark = false, elevation = 'medium') {
  const theme = isDark ? 'dark' : 'light';
  return {
    backgroundColor: isDark ? '#1a1f2e' : '#e0e5ec',
    borderRadius: designTokens.layout.cardPadding,
    padding: designTokens.layout.cardPadding,
    ...getElevationStyle(elevation, isDark),
  };
}

/**
 * Helper function to create neomorphism button style
 * @param {boolean} isDark - whether dark mode is active
 * @param {boolean} isPressed - whether button is pressed
 * @returns {object} Complete button style object
 */
function createNeomorphismButton(isDark = false, isPressed = false) {
  if (isPressed) {
    return {
      backgroundColor: isDark ? '#1a1f2e' : '#e0e5ec',
      ...getPressedStyle(isDark),
    };
  }
  
  return {
    backgroundColor: isDark ? '#1a1f2e' : '#e0e5ec',
    ...getElevationStyle('medium', isDark),
  };
}

module.exports = {
  designTokens,
  getElevationStyle,
  getPressedStyle,
  createNeomorphismCard,
  createNeomorphismButton,
};
