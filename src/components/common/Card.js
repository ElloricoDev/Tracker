/**
 * Card Component
 * Reusable material-style card with elevation.
 */

const React = require('react');
const { View, StyleSheet } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { getElevationStyle, designTokens } = require('../../theme/tokens');

/**
 * Card component with reusable material styling
 * @param {object} props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.elevation - 'flat', 'low', 'medium', 'high', or 'floating'
 * @param {object} props.style - Additional styles
 * @param {object} props.contentStyle - Styles for content container
 */
function Card({
  children,
  elevation = 'medium',
  variant = 'default',
  style,
  contentStyle,
}) {
  const { theme, isDarkMode } = useTheme();

  const cardStyles = React.useMemo(() => {
    const variantStyles = {
      default: {
        backgroundColor: theme.colors.surfaceContainer || theme.colors.surfaceElevated,
        borderColor: theme.colors.borderLight || theme.colors.border,
      },
      section: {
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: theme.colors.outline || theme.colors.border,
      },
    };

    return [
      styles.card,
      variantStyles[variant] || variantStyles.default,
      getElevationStyle(elevation, isDarkMode),
      style,
    ];
  }, [theme, isDarkMode, elevation, style, variant]);

  return (
    <View style={cardStyles}>
      {contentStyle ? <View style={contentStyle}>{children}</View> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designTokens.borderRadius.lg,
    borderWidth: 1,
    padding: designTokens.layout.cardPadding,
  },
});

module.exports = Card;
