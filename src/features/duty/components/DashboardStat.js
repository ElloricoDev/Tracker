const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');

function DashboardStat({ label, value, tone = 'default' }) {
  const { theme } = useTheme();

  const valueColor = tone === 'warning'
    ? theme.colors.warning
    : tone === 'success'
      ? theme.colors.success
      : theme.colors.text;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceContainer || theme.colors.surface,
          borderColor: theme.colors.borderLight || theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
});

module.exports = DashboardStat;
