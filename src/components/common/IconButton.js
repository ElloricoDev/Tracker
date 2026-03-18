/**
 * Icon Button Component
 * Reusable icon button with material styling.
 */

const React = require('react');
const { Pressable, StyleSheet, Animated } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { useNeomorphismPress } = require('../../hooks/useNeomorphismAnimation');
const { getElevationStyle, designTokens } = require('../../theme/tokens');
const { Ionicons } = require('@expo/vector-icons');

/**
 * IconButton component
 * @param {object} props
 * @param {function} props.onPress - Press handler
 * @param {ReactNode} props.icon - Icon element
 * @param {string} props.size - 'small', 'medium', or 'large'
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {object} props.style - Additional styles
 * @param {string} props.accessibilityLabel - Accessibility label
 */
function IconButton({
  onPress,
  icon,
  size = 'medium',
  disabled = false,
  variant = 'default',
  style,
  accessibilityLabel,
}) {
  const { theme, isDarkMode } = useTheme();
  const { handlePressIn, handlePressOut, animatedStyle } = useNeomorphismPress();
  
  const buttonStyles = React.useMemo(() => {
    const sizeStyles = {
      small: styles.buttonSmall,
      medium: styles.buttonMedium,
      large: styles.buttonLarge,
    };
    
    return [
      styles.button,
      {
        backgroundColor: theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer || theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.outline || theme.colors.border,
      },
      variant === 'flat' ? styles.flatButton : getElevationStyle('medium', isDarkMode),
      sizeStyles[size],
      disabled && styles.disabled,
    ];
  }, [theme, isDarkMode, size, disabled, variant]);

  const iconElement = React.useMemo(() => {
    if (React.isValidElement(icon)) {
      return icon;
    }

    if (typeof icon === 'string') {
      const iconSizes = {
        small: 16,
        medium: 20,
        large: 24,
      };

      return <Ionicons name={icon} size={iconSizes[size]} color={theme.colors.icon} />;
    }

    return null;
  }, [icon, size, theme]);
  
  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        style={buttonStyles}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {iconElement}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: {
    width: designTokens.sizes.touchTarget,
    height: designTokens.sizes.touchTarget,
  },
  buttonMedium: {
    width: designTokens.sizes.iconButton,
    height: designTokens.sizes.iconButton,
  },
  buttonLarge: {
    width: 52,
    height: 52,
  },
  flatButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    opacity: designTokens.opacity.disabled,
  },
});

module.exports = IconButton;
