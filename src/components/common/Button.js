/**
 * Button Component
 * Reusable button with material styling and multiple variants.
 */

const React = require('react');
const { Pressable, Text, View, StyleSheet, Animated, ActivityIndicator } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { useNeomorphismPress } = require('../../hooks/useNeomorphismAnimation');
const { getElevationStyle, designTokens } = require('../../theme/tokens');

/**
 * Button component with reusable material styling
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
  const { handlePressIn, handlePressOut, animatedStyle } = useNeomorphismPress();
  
  const isDisabled = disabled || loading;
  
  const buttonStyles = React.useMemo(() => {
    const baseStyle = {
      ...styles.button,
      ...getElevationStyle('medium', isDarkMode),
      borderWidth: 1,
    };
    
    const sizeStyles = {
      small: styles.buttonSmall,
      medium: styles.buttonMedium,
      large: styles.buttonLarge,
    };
    
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primaryLight,
      },
      secondary: {
        backgroundColor: theme.colors.surfaceContainerHighest || theme.colors.surfaceContainerHigh || theme.colors.surface,
        borderColor: theme.colors.outline || theme.colors.border,
      },
      danger: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
      },
      success: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
      },
      accent: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
      },
      flat: {
        backgroundColor: theme.name === 'dark' ? 'rgba(110, 231, 161, 0.10)' : 'rgba(31, 138, 77, 0.08)',
        borderColor: theme.name === 'dark' ? 'rgba(110, 231, 161, 0.18)' : 'rgba(31, 138, 77, 0.12)',
        shadowOpacity: 0,
        elevation: 0,
      },
    };
    
    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      isDisabled && { ...styles.disabled, backgroundColor: theme.colors.surfaceContainer || theme.colors.border },
    ];
  }, [theme, isDarkMode, variant, size, isDisabled]);
  
  const contentColor = React.useMemo(() => {
    if (isDisabled) {
      return theme.colors.textSecondary;
    }

    if (variant === 'secondary') {
      return theme.colors.text;
    }

    if (variant === 'flat') {
      return theme.colors.primary;
    }

    return theme.colors.textInverse;
  }, [theme, variant, isDisabled]);

  const textStyles = React.useMemo(() => {
    const sizeStyles = {
      small: styles.textSmall,
      medium: styles.textMedium,
      large: styles.textLarge,
    };
    
    return [
      styles.text,
      sizeStyles[size],
      { color: contentColor },
    ];
  }, [size, contentColor]);

  const renderIcon = React.useCallback((iconElement) => {
    if (!iconElement) {
      return null;
    }

    if (!React.isValidElement(iconElement)) {
      return iconElement;
    }

    return React.cloneElement(iconElement, { color: contentColor });
  }, [contentColor]);
  
  const content = (
    <View style={styles.content}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={contentColor}
          style={styles.loader}
        />
      )}
      {!loading && icon && iconPosition === 'left' && <View style={styles.iconLeft}>{renderIcon(icon)}</View>}
      {typeof children === 'string' ? (
        <Text style={textStyles}>{children}</Text>
      ) : (
        children
      )}
      {!loading && icon && iconPosition === 'right' && <View style={styles.iconRight}>{renderIcon(icon)}</View>}
    </View>
  );
  
  return (
    <Animated.View style={[animatedStyle, style]}>
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
    borderRadius: designTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: designTokens.sizes.touchTarget,
  },
  buttonMedium: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: designTokens.sizes.button,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 54,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
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
    opacity: 0.7,
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
