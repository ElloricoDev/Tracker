const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const IconBadge = require('../../../components/common/IconBadge');

const STREAK_MILESTONES = [2, 3, 5, 7, 14, 30];
const HOUR_MILESTONES = [10, 25, 50, 100];

function getNextMilestone(currentValue, milestones) {
  return milestones.find((milestone) => milestone > currentValue) || null;
}

function getPreviousMilestone(currentValue, milestones) {
  const unlockedMilestones = milestones.filter((milestone) => milestone <= currentValue);
  return unlockedMilestones.length > 0 ? unlockedMilestones[unlockedMilestones.length - 1] : 0;
}

function buildProgress(currentValue, milestones) {
  const nextMilestone = getNextMilestone(currentValue, milestones);
  const previousMilestone = getPreviousMilestone(currentValue, milestones);
  const progressRatio = nextMilestone
    ? Math.max(0, Math.min((currentValue - previousMilestone) / Math.max(nextMilestone - previousMilestone, 1), 1))
    : 1;

  return { nextMilestone, progressRatio };
}

function StreakAchievements({
  currentStreakDays = 0,
  totalDurationMs = 0,
  requiredHours = 0,
}) {
  const { theme } = useTheme();
  const totalHours = Math.floor(totalDurationMs / (60 * 60 * 1000));
  const { nextMilestone, progressRatio } = buildProgress(currentStreakDays, STREAK_MILESTONES);
  const hourProgress = buildProgress(totalHours, HOUR_MILESTONES);
  const targetReached = requiredHours > 0 && totalDurationMs >= requiredHours * 60 * 60 * 1000;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Streak Milestones</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {nextMilestone
            ? `${Math.max(nextMilestone - currentStreakDays, 0)} more day${nextMilestone - currentStreakDays === 1 ? '' : 's'} to ${nextMilestone}`
            : 'Top milestone reached'}
        </Text>
      </View>

      <View
        style={[
          styles.progressCard,
          {
            backgroundColor: theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer,
            borderColor: theme.colors.borderLight || theme.colors.border,
          },
        ]}
      >
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Next Milestone</Text>
          <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
            {nextMilestone ? `${currentStreakDays} / ${nextMilestone} days` : `${currentStreakDays} / ${currentStreakDays} days`}
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: theme.colors.surfaceElevated || theme.colors.surface,
              borderColor: theme.colors.borderLight || theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressRatio * 100}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressMeta, { color: theme.colors.textSecondary }]}>
          {nextMilestone
            ? `${Math.max(nextMilestone - currentStreakDays, 0)} more day${nextMilestone - currentStreakDays === 1 ? '' : 's'} to unlock the next badge`
            : 'All listed streak milestones unlocked'}
        </Text>
      </View>

      <View style={styles.badges}>
        {STREAK_MILESTONES.map((milestone) => {
          const unlocked = currentStreakDays >= milestone;
          return (
            <View
              key={milestone}
              style={[
                styles.badgeCard,
                {
                  backgroundColor: unlocked
                    ? (theme.colors.successBg || theme.colors.surfaceContainer)
                    : (theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer),
                  borderColor: unlocked
                    ? theme.colors.success
                    : (theme.colors.borderLight || theme.colors.border),
                },
              ]}
            >
              <IconBadge icon="streak" tone={unlocked ? 'success' : 'default'} />
              <Text style={[styles.badgeValue, { color: theme.colors.text }]}>{milestone}</Text>
              <Text style={[styles.badgeLabel, { color: unlocked ? theme.colors.success : theme.colors.textSecondary }]}>
                {unlocked ? 'Unlocked' : 'Locked'}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Hour Milestones</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {hourProgress.nextMilestone
            ? `${Math.max(hourProgress.nextMilestone - totalHours, 0)} more hour${hourProgress.nextMilestone - totalHours === 1 ? '' : 's'} to ${hourProgress.nextMilestone}h`
            : 'Top hour milestone reached'}
        </Text>
      </View>

      <View
        style={[
          styles.progressCard,
          {
            backgroundColor: theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer,
            borderColor: theme.colors.borderLight || theme.colors.border,
          },
        ]}
      >
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Hours Progress</Text>
          <Text style={[styles.progressValue, { color: theme.colors.primary }]}>
            {hourProgress.nextMilestone ? `${totalHours} / ${hourProgress.nextMilestone}h` : `${totalHours}h`}
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: theme.colors.surfaceElevated || theme.colors.surface,
              borderColor: theme.colors.borderLight || theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${hourProgress.progressRatio * 100}%`,
                backgroundColor: theme.colors.accent,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressMeta, { color: theme.colors.textSecondary }]}>
          {targetReached
            ? 'Required target reached'
            : requiredHours > 0
              ? `${Math.max(requiredHours - totalHours, 0)} more hour${requiredHours - totalHours === 1 ? '' : 's'} to hit your requirement`
              : 'Set a required hours target in Settings to unlock goal tracking'}
        </Text>
      </View>

      <View style={styles.badges}>
        {HOUR_MILESTONES.map((milestone) => {
          const unlocked = totalHours >= milestone;
          return (
            <View
              key={`hours-${milestone}`}
              style={[
                styles.badgeCard,
                {
                  backgroundColor: unlocked
                    ? (theme.colors.infoBg || theme.colors.surfaceContainer)
                    : (theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer),
                  borderColor: unlocked
                    ? theme.colors.info
                    : (theme.colors.borderLight || theme.colors.border),
                },
              ]}
            >
              <IconBadge icon="progress" tone={unlocked ? 'info' : 'default'} />
              <Text style={[styles.badgeValue, { color: theme.colors.text }]}>{milestone}h</Text>
              <Text style={[styles.badgeLabel, { color: unlocked ? theme.colors.info : theme.colors.textSecondary }]}>
                {unlocked ? 'Unlocked' : 'Locked'}
              </Text>
            </View>
          );
        })}
        {requiredHours > 0 ? (
          <View
            style={[
              styles.badgeCard,
              {
                backgroundColor: targetReached
                  ? (theme.colors.successBg || theme.colors.surfaceContainer)
                  : (theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer),
                borderColor: targetReached
                  ? theme.colors.success
                  : (theme.colors.borderLight || theme.colors.border),
              },
            ]}
          >
            <IconBadge icon="success" tone={targetReached ? 'success' : 'default'} />
            <Text style={[styles.badgeValue, { color: theme.colors.text }]}>Goal</Text>
            <Text style={[styles.badgeLabel, { color: targetReached ? theme.colors.success : theme.colors.textSecondary }]}>
              {targetReached ? 'Reached' : 'In Progress'}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: designTokens.spacing.sm,
    marginTop: designTokens.spacing.md,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTokens.spacing.sm,
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: designTokens.spacing.sm,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    minWidth: 10,
  },
  progressMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  badgeCard: {
    width: '31%',
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.lg,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.sm,
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

module.exports = StreakAchievements;
