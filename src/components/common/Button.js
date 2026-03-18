/**
 * Neomorphism Button Component
 * Reusable button with neomorphism styling and multiple variants
 */

const React = require('react');
const { Pressable, Text, View, StyleSheet, Animated, ActivityIndicator } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { useNeomorphismPress } = require('../../hooks/useNeomorphismAnimation');
const { getElevationStyle, designTokens } = require('../../theme/tokens');

/**
 * Button component with neomorphism styling
 * @param {object} props
 * @param {function} props.onPress - Press handler
 * @param {string} props.variant - 'primary', 'secondary', 'danger', 'success', or 'flat'
 * @param {string} props.size - 'small', 'medium', or 'large'
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether to show loading indicator
 * @param {ReactNode} props.icon - Icon element to display
 * @param {string} props.iconPosition - 'left' or 'right'
 * @param {ReactNode} props.children - Button text or content
 * @param {object} props.style - Additional styles
 * @param {string} props.accessibilityLabel - Accessibility label
 */
function Button({
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  children,
  style,
  accessibilityLabel,
}) {
  const { theme, isDarkMode } = useTheme();
  const { animatedValue, handlePressIn, handlePressOut, animatedStyle } = useNeomorphismPress();
  
  const isDisabled = disabled || loading;
  
  const buttonStyles = React.useMemo(() => {
    const baseStyle = {
      ...styles.button,
      ...getElevationStyle('medium', isDarkMode),
    };
    
    const sizeStyles = {
      small: styles.buttonSmall,
      medium: styles.buttonMedium,
      large: styles.buttonLarge,
    };
    
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
      },
      danger: {
        backgroundColor: theme.colors.error,
      },
      success: {
        backgroundColor: theme.colors.success,
      },
      accent: {
        backgroundColor: theme.colors.accent,
      },
      flat: {
        backgroundColor: theme.colors.surface,
        shadowOpacity: 0,
        elevation: 0,
      },
    };
    
    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      isDisabled && { ...styles.disabled, backgroundColor: theme.colors.border },
      style,
    ];
  }, [theme, isDarkMode, variant, size, isDisabled, style]);
  
  const textStyles = React.useMemo(() => {
    const sizeStyles = {
      small: styles.textSmall,
      medium: styles.textMedium,
      large: styles.textLarge,
    };
    
    const variantTextColor = {
      primary: theme.colors.textInverse,
      secondary: theme.colors.text,
      danger: theme.colors.textInverse,
      success: theme.colors.textInverse,
      accent: theme.colors.textInverse,
      flat: theme.colors.text,
    };
    
    return [
      styles.text,
      sizeStyles[size],
      { color: variantTextColor[variant] },
      isDisabled && styles.textDisabled,
    ];
  }, [theme, variant, size, isDisabled]);
  
  const content = (
    <View style={styles.content}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'flat' ? theme.colors.primary : theme.colors.textInverse}
          style={styles.loader}
        />
      )}
      {!loading && icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
      {typeof children === 'string' ? (
        <Text style={textStyles}>{children}</Text>
      ) : (
        children
      )}
      {!loading && icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
    </View>
  );
  
  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        style={buttonStyles}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: designTokens.layout.cardPadding,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 13,
  },
  textMedium: {
    fontSize: 15,
  },
  textLarge: {
    fontSize: 17,
  },
  disabled: {
    opacity: designTokens.opacity.disabled,
  },
  textDisabled: {
    opacity: 0.6,
  },
  loader: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

module.exports = Button;
