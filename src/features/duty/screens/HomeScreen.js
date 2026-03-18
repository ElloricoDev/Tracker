/**
 * Home Screen Component
 * Displays progress circle and duty hour statistics
 */

const React = require('react');
const { ScrollView, StyleSheet, View, Text } = require('react-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const ProgressSection = require('../components/ProgressSection');
const IconButton = require('../../../components/common/IconButton');

function formatHoursAndMinutes(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * HomeScreen component
 * @param {object} props
 * @param {object} props.navigation - Navigation prop
 * @param {object} props.route - Route prop with params
 */
function HomeScreen({ navigation, route }) {
  const { theme } = useTheme();
  const {
    dutyService,
    settingsRepository,
    totalDurationMs,
    requiredHours,
    onRefresh,
  } = route.params;

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // Initial data load
  React.useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <IconButton
          icon="menu"
          onPress={() => navigation.openDrawer()}
          variant="flat"
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          OJT Hours Tracker
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProgressSection
          completedMs={totalDurationMs}
          requiredHours={requiredHours}
          formatHours={formatHoursAndMinutes}
        />
        
        <View style={[styles.statsCard, theme.elevations.medium, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
            Summary
          </Text>
          <View style={styles.statsRow}>
            <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
              Total Hours:
            </Text>
            <Text style={[styles.statsValue, { color: theme.colors.primary }]}>
              {formatHoursAndMinutes(totalDurationMs)}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
              Required Hours:
            </Text>
            <Text style={[styles.statsValue, { color: theme.colors.primary }]}>
              {requiredHours}h
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={[styles.statsLabel, { color: theme.colors.textSecondary }]}>
              Remaining:
            </Text>
            <Text style={[styles.statsValue, { color: totalDurationMs >= requiredHours * 3600000 ? theme.colors.success : theme.colors.warning }]}>
              {formatHoursAndMinutes(Math.max(0, (requiredHours * 3600000) - totalDurationMs))}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.xxxl,
  },
  statsCard: {
    marginTop: designTokens.spacing.xl,
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: designTokens.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: designTokens.spacing.sm,
  },
  statsLabel: {
    fontSize: 16,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '600',
  },
});

module.exports = HomeScreen;
