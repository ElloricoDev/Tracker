/**
 * Loading Screen Component
 * Full-screen loading indicator with neomorphism styling
 */

const React = require('react');
const { View, Text, StyleSheet, Animated } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { useNeomorphismPulse } = require('../../hooks/useNeomorphismAnimation');
const { designTokens } = require('../../theme/tokens');
const { Ionicons } = require('@expo/vector-icons');

/**
 * LoadingScreen component
 * @param {object} props
 * @param {string} props.message - Loading message
 */
function LoadingScreen({ message = 'Loading...' }) {
  const { theme, isDarkMode } = useTheme();
  const { animatedStyle } = useNeomorphismPulse(true);
  
  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      {
        backgroundColor: theme.colors.background,
      },
    ];
  }, [theme]);
  
  const cardStyles = React.useMemo(() => {
    return [
      styles.card,
      {
        backgroundColor: theme.colors.surface,
      },
    ];
  }, [theme]);
  
  const textStyles = React.useMemo(() => {
    return [
      styles.text,
      {
        color: theme.colors.text,
      },
    ];
  }, [theme]);
  
  return (
    <View style={containerStyles}>
      <Animated.View style={[cardStyles, animatedStyle]}>
        <Ionicons name="hourglass-outline" size={40} color={theme.colors.primary} />
        <Text style={textStyles}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.xxl,
    alignItems: 'center',
    gap: designTokens.spacing.md,
    minWidth: 170,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

module.exports = LoadingScreen;
