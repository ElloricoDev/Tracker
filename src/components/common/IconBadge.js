const React = require('react');
const { View, StyleSheet } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { designTokens } = require('../../theme/tokens');
const AppIcon = require('./AppIcon');

function IconBadge({
  icon,
  tone = 'default',
  size = designTokens.sizes.badge,
}) {
  const { theme } = useTheme();

  const colorsByTone = {
    default: {
      backgroundColor: theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer,
      color: theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.successBg,
      color: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.warningBg,
      color: theme.colors.warning,
    },
    info: {
      backgroundColor: theme.colors.infoBg,
      color: theme.colors.info,
    },
  };

  const toneColors = colorsByTone[tone] || colorsByTone.default;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: toneColors.backgroundColor,
          borderWidth: 1,
          borderColor: tone === 'default'
            ? (theme.colors.outline || theme.colors.border)
            : toneColors.color,
        },
      ]}
    >
      <AppIcon name={icon} size="inline" color={toneColors.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

module.exports = IconBadge;
