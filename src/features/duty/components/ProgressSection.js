/**
 * Progress Section Component
 * Displays OJT hours progress with circular indicator
 */

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const SectionCard = require('../../../components/common/SectionCard');
const ProgressCircle = require('../../../components/common/ProgressCircle');

/**
 * ProgressSection component
 * @param {object} props
 * @param {number} props.completedMs - Completed time in milliseconds
 * @param {number} props.requiredHours - Required hours
 * @param {function} props.formatHours - Format hours function
 */
function ProgressSection({
  completedMs,
  requiredHours,
  formatHours,
}) {
  const { theme } = useTheme();
  
  const completedHours = completedMs / (1000 * 60 * 60);
  const progress = requiredHours > 0 ? Math.min(completedHours / requiredHours, 1) : 0;
  const remainingHours = Math.max(0, requiredHours - completedHours);

  const progressPercentStyles = React.useMemo(() => ({
    color: theme.colors.primary,
    ...styles.progressPercent,
  }), [theme]);
  
  const progressLabelStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.progressLabel,
  }), [theme]);
  
  const statValueStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.statValue,
  }), [theme]);
  
  const statLabelStyles = React.useMemo(() => ({
    color: theme.colors.textTertiary,
    ...styles.statLabel,
  }), [theme]);
  
  return (
    <SectionCard
      title="Progress"
      subtitle="Your completed hours against the current requirement."
      icon="progress"
    >
      <View style={styles.content}>
        <ProgressCircle progress={progress} size={140} strokeWidth={12}>
          <View style={styles.progressContent}>
            <Text style={progressPercentStyles}>
              {Math.round(progress * 100)}%
            </Text>
            <Text style={progressLabelStyles}>Complete</Text>
          </View>
        </ProgressCircle>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={statValueStyles}>{formatHours(completedMs)}</Text>
            <Text style={statLabelStyles}>Completed</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.colors.borderLight || theme.colors.border }]} />
          
          <View style={styles.statItem}>
            <Text style={statValueStyles}>{requiredHours}h</Text>
            <Text style={statLabelStyles}>Required</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.colors.borderLight || theme.colors.border }]} />
          
          <View style={styles.statItem}>
            <Text style={[statValueStyles, { color: theme.colors.warning }]}>
              {remainingHours.toFixed(1)}h
            </Text>
            <Text style={statLabelStyles}>Remaining</Text>
          </View>
        </View>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: designTokens.spacing.xl,
  },
  progressContent: {
    alignItems: 'center',
    gap: 4,
  },
  progressPercent: {
    fontSize: 32,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    opacity: 0.3,
  },
});

module.exports = ProgressSection;
