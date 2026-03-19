const React = require('react');
const { View, Text, StyleSheet, Pressable } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const EmptyState = require('../../../components/common/EmptyState');

function formatCompactHours(totalMs) {
  const totalHours = totalMs / (60 * 60 * 1000);
  if (totalHours === 0) {
    return '0h';
  }

  return totalHours % 1 === 0 ? `${totalHours}h` : `${totalHours.toFixed(1)}h`;
}

function TrendBarChart({
  title,
  subtitle,
  bars = [],
  onSelectBar,
}) {
  const { theme } = useTheme();
  const maxMs = bars.length > 0 ? Math.max(...bars.map((bar) => bar.totalMs), 0) : 0;
  const hasData = maxMs > 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>

      {hasData ? (
        <View style={styles.chart}>
          {bars.map((bar) => {
            const ratio = Math.max(bar.totalMs / maxMs, 0.08);
            const isSelectable = typeof onSelectBar === 'function' && Boolean(bar.targetDateKey);
            return (
              <View key={bar.key} style={styles.column}>
                <Text style={[styles.value, { color: theme.colors.textTertiary }]}>
                  {formatCompactHours(bar.totalMs)}
                </Text>
                <Pressable
                  style={[
                    styles.track,
                    {
                      backgroundColor: theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer,
                      borderColor: theme.colors.borderLight || theme.colors.border,
                    },
                    isSelectable ? styles.trackPressable : null,
                  ]}
                  onPress={isSelectable ? () => onSelectBar(bar.targetDateKey) : undefined}
                  accessibilityRole={isSelectable ? 'button' : undefined}
                  accessibilityLabel={isSelectable ? `Open entries for ${bar.label}` : undefined}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${ratio * 100}%`,
                        backgroundColor: bar.isToday ? theme.colors.accent : theme.colors.primary,
                      },
                    ]}
                  />
                </Pressable>
                <Text
                  style={[
                    styles.label,
                    { color: bar.isToday ? theme.colors.primary : theme.colors.textSecondary },
                  ]}
                >
                  {bar.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <EmptyState
          icon="trends"
          title={`No data for ${title.toLowerCase()}`}
          message="Log some hours first, then your pace chart will appear here."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: designTokens.spacing.sm,
  },
  copy: {
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: designTokens.spacing.sm,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    height: 112,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    justifyContent: 'flex-end',
    padding: 4,
  },
  trackPressable: {
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    minHeight: 8,
    borderRadius: designTokens.borderRadius.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});

module.exports = TrendBarChart;
