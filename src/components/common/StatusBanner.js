const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { designTokens } = require('../../theme/tokens');
const AppIcon = require('./AppIcon');

function StatusBanner({
  tone = 'info',
  message,
  style,
}) {
  const { theme } = useTheme();

  const tones = {
    info: {
      icon: 'info',
      backgroundColor: theme.colors.infoBg,
      borderColor: theme.colors.info,
      color: theme.colors.info,
    },
    warning: {
      icon: 'warning',
      backgroundColor: theme.colors.warningBg,
      borderColor: theme.colors.warning,
      color: theme.colors.warning,
    },
    success: {
      icon: 'success',
      backgroundColor: theme.colors.successBg,
      borderColor: theme.colors.success,
      color: theme.colors.success,
    },
  };

  const toneStyles = tones[tone] || tones.info;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: toneStyles.backgroundColor,
          borderColor: toneStyles.borderColor,
        },
        style,
      ]}
    >
      <AppIcon name={toneStyles.icon} size="inline" color={toneStyles.color} />
      <Text style={[styles.message, { color: toneStyles.color }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.md,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs + 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});

module.exports = StatusBanner;
