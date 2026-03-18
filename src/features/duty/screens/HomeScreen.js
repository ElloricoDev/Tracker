/**
 * Dashboard Screen
 * Progress overview, summary, and quick actions.
 */

const React = require('react');
const { ScrollView, StyleSheet, View, Text } = require('react-native');
const { useFocusEffect } = require('@react-navigation/native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const ScreenHeader = require('../../../components/common/ScreenHeader');
const SectionCard = require('../../../components/common/SectionCard');
const ActionRow = require('../../../components/common/ActionRow');
const EmptyState = require('../../../components/common/EmptyState');
const Button = require('../../../components/common/Button');
const AppIcon = require('../../../components/common/AppIcon');
const ProgressSection = require('../components/ProgressSection');

function formatHoursAndMinutes(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function formatLongDate(dateKey) {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildSessionSummary(entry) {
  if (!entry) {
    return 'No entry logged yet.';
  }

  const sessions = [];
  if (entry.amIn && entry.amOut) {
    sessions.push(`AM ${entry.amIn} - ${entry.amOut}`);
  }
  if (entry.pmIn && entry.pmOut) {
    sessions.push(`PM ${entry.pmIn} - ${entry.pmOut}`);
  }

  return sessions.length > 0 ? sessions.join('  •  ') : 'Incomplete session saved.';
}

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
        styles.statCard,
        {
          backgroundColor: theme.colors.surfaceContainer || theme.colors.surface,
          borderColor: theme.colors.borderLight || theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function HomeScreen({
  navigation,
  totalDurationMs,
  requiredHours,
  recentEntries = [],
  todayEntry = null,
  onRefresh,
}) {
  const { theme } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const remainingMs = Math.max(0, (requiredHours * 3600000) - totalDurationMs);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Dashboard"
          title="OJT Hours Tracker"
          subtitle="Track progress quickly, then jump straight into today’s duty record."
        />

        <ProgressSection
          completedMs={totalDurationMs}
          requiredHours={requiredHours}
          formatHours={formatHoursAndMinutes}
        />

        <SectionCard
          title="Summary"
          subtitle="Your current standing at a glance."
          icon="summary"
        >
          <View style={styles.statsGrid}>
            <DashboardStat label="Completed" value={formatHoursAndMinutes(totalDurationMs)} />
            <DashboardStat label="Required" value={`${requiredHours}h`} />
            <DashboardStat
              label="Remaining"
              value={formatHoursAndMinutes(remainingMs)}
              tone={remainingMs > 0 ? 'warning' : 'success'}
            />
          </View>
        </SectionCard>

        <SectionCard
          title="Today"
          subtitle={todayEntry ? 'You already have a record for today.' : 'No entry has been saved for today yet.'}
          icon="quickAction"
        >
          <Text style={[styles.todayCopy, { color: theme.colors.textSecondary }]}>
            {todayEntry ? buildSessionSummary(todayEntry) : 'Open Entries to add your morning and afternoon sessions.'}
          </Text>
          <ActionRow stacked style={styles.actionRow}>
            <Button
              onPress={() => navigation.navigate('Entries')}
              icon={<AppIcon name={todayEntry ? 'edit' : 'save'} size="inline" color="#ffffff" />}
            >
              {todayEntry ? 'Manage Today\'s Entry' : 'Add Today\'s Entry'}
            </Button>
          </ActionRow>
        </SectionCard>

        <SectionCard
          title="Recent Activity"
          subtitle="Your latest saved duty records."
          icon="activity"
        >
          {recentEntries.length === 0 ? (
            <EmptyState
              title="No recent activity"
              message="Once you save your first entry, the latest records will appear here."
            />
          ) : (
            <View style={styles.activityList}>
              {recentEntries.map((entry) => (
                <View
                  key={entry.dateKey}
                  style={[
                    styles.activityItem,
                    {
                      backgroundColor: theme.colors.surfaceContainer || theme.colors.surface,
                      borderColor: theme.colors.borderLight || theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.activityCopy}>
                    <Text style={[styles.activityDate, { color: theme.colors.text }]}>
                      {formatLongDate(entry.dateKey)}
                    </Text>
                    <Text style={[styles.activityMeta, { color: theme.colors.textSecondary }]}>
                      {buildSessionSummary(entry)}
                    </Text>
                  </View>
                  <Button
                    variant="secondary"
                    size="small"
                    onPress={() => navigation.navigate('Entries')}
                    icon={<AppIcon name="next" size="inline" color={theme.colors.text} />}
                    iconPosition="right"
                  >
                    Open
                  </Button>
                </View>
              ))}
            </View>
          )}
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: designTokens.layout.screenPadding,
    gap: designTokens.layout.sectionGap,
    paddingBottom: designTokens.spacing.xxxl,
  },
  statsGrid: {
    gap: designTokens.spacing.sm,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.md,
    gap: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  todayCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: designTokens.spacing.md,
  },
  activityList: {
    gap: designTokens.spacing.sm,
  },
  activityItem: {
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
  activityCopy: {
    gap: 4,
  },
  activityDate: {
    fontSize: 15,
    fontWeight: '700',
  },
  activityMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
});

module.exports = HomeScreen;
