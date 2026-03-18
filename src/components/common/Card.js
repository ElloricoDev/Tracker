/**
 * Neomorphism Card Component
 * Reusable card with neomorphism shadows and elevation
 */

const React = require('react');
const { View, StyleSheet } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { getElevationStyle, designTokens } = require('../../theme/tokens');

/**
 * Card component with neomorphism styling
 * @param {object} props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.elevation - 'flat', 'low', 'medium', 'high', or 'floating'
 * @param {object} props.style - Additional styles
 * @param {object} props.contentStyle - Styles for content container
 */
function Card({
  children,
  elevation = 'medium',
  style,
  contentStyle,
}) {
  const { theme, isDarkMode } = useTheme();
  
  const cardStyles = React.useMemo(() => {
    return [
      styles.card,
      {
        backgroundColor: theme.colors.surface,
      },
      getElevationStyle(elevation, isDarkMode),
      style,
    ];
  }, [theme, isDarkMode, elevation, style]);
  
  return (
    <View style={cardStyles}>
      {contentStyle ? (
        <View style={contentStyle}>
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designTokens.layout.cardPadding,
    padding: designTokens.layout.cardPadding,
  },
});

module.exports = Card;
