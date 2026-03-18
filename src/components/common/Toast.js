/**
 * Toast Notification Component
 * Displays temporary notifications with material styling.
 */

const React = require('react');
const { View, Text, StyleSheet, Animated } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { useNeomorphismFade } = require('../../hooks/useNeomorphismAnimation');
const { getElevationStyle, designTokens } = require('../../theme/tokens');
const { Ionicons } = require('@expo/vector-icons');

/**
 * Toast component with reusable material styling
 * @param {object} props
 * @param {string} props.message - Toast message
 * @param {string} props.type - 'success', 'error', 'info', or 'warning'
 * @param {boolean} props.visible - Whether toast is visible
 * @param {object} props.style - Additional styles
 */
function Toast({
  message,
  type = 'success',
  visible = false,
  style,
}) {
  const { theme, isDarkMode } = useTheme();
  const { animatedStyle } = useNeomorphismFade(visible);
  
  const icons = {
    success: 'checkmark-circle',
    error: 'close-circle',
    info: 'information-circle',
    warning: 'warning',
  };
  
  const iconColors = {
    success: theme.colors.success,
    error: theme.colors.error,
    info: theme.colors.info,
    warning: theme.colors.warning,
  };
  
  const textStyles = React.useMemo(() => {
    return [
      styles.text,
      {
        color: theme.colors.text,
      },
    ];
  }, [theme]);
  
  if (!visible && !message) {
    return null;
  }

  const toastStyles = [
    styles.toast,
    {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.outline || theme.colors.border,
    },
    getElevationStyle('floating', isDarkMode),
    style,
  ];
  
  return (
    <Animated.View style={[styles.toastContainer, animatedStyle]}>
      <View style={toastStyles}>
        <View style={styles.content}>
          <Ionicons
            name={icons[type]}
            size={20}
            color={iconColors[type]}
            style={styles.icon}
          />
          <Text style={textStyles}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    maxWidth: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});

module.exports = Toast;
