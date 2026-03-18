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
const DashboardStat = require('../components/DashboardStat');
const ProgressSection = require('../components/ProgressSection');
const MonthlyAttendanceHeatmap = require('../components/MonthlyAttendanceHeatmap');
const TrendBarChart = require('../components/TrendBarChart');
const { dateKeyFromDate } = require('../service');
const { startOfLocalWeekMonday } = require('../time');

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

function formatShortDate(dateKey) {
  if (!dateKey) {
    return 'Need more logs';
  }

  return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
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

function HomeScreen({
  navigation,
  totalDurationMs,
  requiredHours,
  recentEntries = [],
  todayEntry = null,
  dashboardInsights = null,
  onRefresh,
}) {
  const { theme } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const remainingMs = Math.max(0, (requiredHours * 3600000) - totalDurationMs);
  const todayDateKey = dateKeyFromDate(new Date());
  const currentWeekStartDateKey = dateKeyFromDate(startOfLocalWeekMonday(new Date()));
  const handleSelectDashboardDate = React.useCallback((selectedDateKey) => {
    navigation.navigate('Entries', { selectedDateKey, entryContextSource: 'dashboard' });
  }, [navigation]);
  const handleOpenDashboardWeek = React.useCallback((selectedDateKey) => {
    navigation.navigate('Entries', {
      selectedDateKey,
      entryContextSource: 'dashboard',
      entryContextMode: 'week',
    });
  }, [navigation]);

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
          subtitle="Check progress, spot gaps, and jump straight into the day you want to manage."
        />

        <ProgressSection
          completedMs={totalDurationMs}
          requiredHours={requiredHours}
          formatHours={formatHoursAndMinutes}
        />

        <SectionCard
          title="Summary"
          subtitle="The key numbers that matter right now."
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
          title="Monthly Insights"
          subtitle="Pace, streak, forecast, and attendance in one place."
          icon="calendarStats"
        >
          <View style={styles.statsGrid}>
            <DashboardStat
              label="This Month"
              value={formatHoursAndMinutes(dashboardInsights ? dashboardInsights.monthlyTotalMs : 0)}
            />
            <DashboardStat
              label="Duty Days"
              value={String(dashboardInsights ? dashboardInsights.monthlyEntryCount : 0)}
            />
            <DashboardStat
              label="Avg / Day"
              value={formatHoursAndMinutes(dashboardInsights ? dashboardInsights.monthlyAverageMs : 0)}
            />
            <DashboardStat
              label="Missing Days"
              value={String(dashboardInsights ? dashboardInsights.missedDays : 0)}
              tone={dashboardInsights && dashboardInsights.missedDays > 0 ? 'warning' : 'success'}
            />
          </View>

          <View style={styles.insightHighlights}>
            <View
              style={[
                styles.insightCard,
                {
                  backgroundColor: theme.colors.surfaceContainer || theme.colors.surface,
                  borderColor: theme.colors.borderLight || theme.colors.border,
                },
              ]}
            >
              <View style={styles.insightHeading}>
                <AppIcon name="streak" size="inline" color={theme.colors.warning} />
                <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>Current Streak</Text>
              </View>
              <Text style={[styles.insightValue, { color: theme.colors.text }]}>
                {dashboardInsights ? dashboardInsights.currentStreakDays : 0} day{dashboardInsights && dashboardInsights.currentStreakDays === 1 ? '' : 's'}
              </Text>
              <Text style={[styles.insightMeta, { color: theme.colors.textTertiary }]}>
                Best streak: {dashboardInsights ? dashboardInsights.longestStreakDays : 0} day{dashboardInsights && dashboardInsights.longestStreakDays === 1 ? '' : 's'}
              </Text>
            </View>

            <View
              style={[
                styles.insightCard,
                {
                  backgroundColor: theme.colors.surfaceContainer || theme.colors.surface,
                  borderColor: theme.colors.borderLight || theme.colors.border,
                },
              ]}
            >
              <View style={styles.insightHeading}>
                <AppIcon name="forecast" size="inline" color={theme.colors.primary} />
                <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>Projected Finish</Text>
              </View>
              <Text style={[styles.insightValue, { color: theme.colors.text }]}>
                {formatShortDate(dashboardInsights ? dashboardInsights.projectedCompletionDateKey : null)}
              </Text>
              <Text style={[styles.insightMeta, { color: theme.colors.textTertiary }]}>
                Estimated from your average logged hours per duty day.
              </Text>
            </View>
          </View>

          <View style={styles.calendarWrap}>
            <MonthlyAttendanceHeatmap
              calendar={dashboardInsights ? dashboardInsights.monthCalendar : null}
              onSelectDate={handleSelectDashboardDate}
            />
            <Text style={[styles.calendarHint, { color: theme.colors.textSecondary }]}>
              Tap a day to open it in Entries. Stronger fill means more logged hours.
            </Text>
          </View>

          <View style={styles.trendsWrap}>
            <TrendBarChart
              title="This Week"
              subtitle="Daily logged hours across the current week."
              bars={dashboardInsights ? dashboardInsights.weeklyTrend : []}
              onSelectBar={handleSelectDashboardDate}
            />
            <TrendBarChart
              title="This Month"
              subtitle="Weekly pace across the current month."
              bars={dashboardInsights ? dashboardInsights.monthlyTrend : []}
              onSelectBar={handleSelectDashboardDate}
            />
          </View>

          <ActionRow style={styles.drilldownActions}>
            <Button
              variant="secondary"
              size="small"
              onPress={() => handleSelectDashboardDate(todayDateKey)}
              icon={<AppIcon name="date" size="inline" color={theme.colors.text} />}
            >
              Jump to Today
            </Button>
            <Button
              variant="secondary"
              size="small"
              onPress={() => handleOpenDashboardWeek(currentWeekStartDateKey)}
              icon={<AppIcon name="calendarStats" size="inline" color={theme.colors.text} />}
            >
              Open This Week
            </Button>
          </ActionRow>
        </SectionCard>

        <SectionCard
          title="Today"
          subtitle={todayEntry ? 'Today already has a saved record.' : 'No record has been saved for today yet.'}
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
          subtitle="Your latest saved records."
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
                    onPress={() => handleSelectDashboardDate(entry.dateKey)}
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
  insightHighlights: {
    gap: designTokens.spacing.sm,
    marginTop: designTokens.spacing.md,
  },
  insightCard: {
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.sm,
  },
  insightHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  insightLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  insightValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  insightMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  calendarWrap: {
    gap: designTokens.spacing.sm,
    marginTop: designTokens.spacing.md,
  },
  calendarHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  trendsWrap: {
    gap: designTokens.spacing.lg,
    marginTop: designTokens.spacing.md,
  },
  drilldownActions: {
    marginTop: designTokens.spacing.md,
  },
  todayCopy: {
    fontSize: 14,
    lineHeight: 21,
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
    padding: designTokens.spacing.lg,
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
