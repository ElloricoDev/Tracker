/**
 * App Navigator
 * Premium tab-led shell with shared app state.
 */

const React = require('react');
const { StyleSheet } = require('react-native');
const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
const { NavigationContainer } = require('@react-navigation/native');
const { createNativeStackNavigator } = require('@react-navigation/native-stack');
const { useSafeAreaInsets } = require('react-native-safe-area-context');
const { useTheme } = require('../hooks/useTheme');
const { useToast } = require('../hooks/useToast');
const { designTokens } = require('../theme/tokens');
const AppIcon = require('../components/common/AppIcon');
const StreakCelebrationModal = require('../components/common/StreakCelebrationModal');
const Toast = require('../components/common/Toast');
const HomeScreen = require('../features/duty/screens/HomeScreen');
const LogsScreen = require('../features/duty/screens/LogsScreen');
const SettingsScreen = require('../features/settings/screens/SettingsScreen');
const { dateKeyFromDate } = require('../features/duty/service');

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function createNavigationTheme(theme) {
  return {
    dark: theme.name === 'dark',
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.borderLight || theme.colors.border,
      notification: theme.colors.accent,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '800',
      },
    },
  };
}

function AppTabs({
  dutyService,
  settingsRepository,
  backupService,
  sharedState,
  onRefresh,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, designTokens.spacing.sm);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          height: designTokens.sizes.tabBarHeight + bottomInset,
          paddingTop: designTokens.spacing.xs,
          paddingBottom: bottomInset,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderLight || theme.colors.border,
          backgroundColor: theme.colors.surfaceElevated || theme.colors.surface,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: theme.name === 'dark' ? 0.18 : 0.08,
          shadowRadius: 18,
          elevation: 12,
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        tabBarIcon: ({ color }) => (
          <AppIcon name={route.name.toLowerCase()} size="navigation" color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard">
        {(props) => (
          <HomeScreen
            {...props}
            totalDurationMs={sharedState.totalDurationMs}
            requiredHours={sharedState.requiredHours}
            recentEntries={sharedState.recentEntries}
            todayEntry={sharedState.todayEntry}
            dashboardInsights={sharedState.dashboardInsights}
            onRefresh={onRefresh}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Entries">
        {(props) => (
          <LogsScreen
            {...props}
            dutyService={dutyService}
            onRefresh={onRefresh}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {(props) => (
          <SettingsScreen
            {...props}
            settingsRepository={settingsRepository}
            backupService={backupService}
            requiredHours={sharedState.requiredHours}
            lastBackupAt={sharedState.lastBackupAt}
            onRefresh={onRefresh}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppNavigator({ dutyService, settingsRepository, backupService }) {
  const { theme } = useTheme();
  const { toastMessage, toastType, toastVisible } = useToast();
  const hasLoadedStreakRef = React.useRef(false);
  const lastCelebratedStreakRef = React.useRef(0);

  const [sharedState, setSharedState] = React.useState({
    totalDurationMs: 0,
    requiredHours: 0,
    lastBackupAt: '',
    recentEntries: [],
    todayEntry: null,
    dashboardInsights: null,
  });
  const [celebrationStreakDays, setCelebrationStreakDays] = React.useState(0);
  const [celebrationVisible, setCelebrationVisible] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    const todayKey = dateKeyFromDate(new Date());
    const [totalMs, targetHours, latestBackupAt, recentEntries, todayEntry] = await Promise.all([
      dutyService.getTotalDurationMs(),
      settingsRepository.getRequiredHours(),
      settingsRepository.getSetting('last_backup_at'),
      dutyService.repository.listRecentEntries(3, 0),
      dutyService.repository.getEntryByDate(todayKey),
    ]);
    const dashboardInsights = await dutyService.getDashboardInsights(targetHours);
    const currentStreakDays = dashboardInsights ? dashboardInsights.currentStreakDays : 0;

    if (!hasLoadedStreakRef.current) {
      hasLoadedStreakRef.current = true;
      lastCelebratedStreakRef.current = currentStreakDays >= 2 ? currentStreakDays : 0;
    } else {
      if (currentStreakDays < lastCelebratedStreakRef.current) {
        lastCelebratedStreakRef.current = currentStreakDays >= 2 ? currentStreakDays : 0;
      }

      if (currentStreakDays >= 2 && currentStreakDays > lastCelebratedStreakRef.current) {
        lastCelebratedStreakRef.current = currentStreakDays;
        setCelebrationStreakDays(currentStreakDays);
        setCelebrationVisible(true);
      }
    }

    setSharedState({
      totalDurationMs: totalMs,
      requiredHours: targetHours,
      lastBackupAt: latestBackupAt || '',
      recentEntries,
      todayEntry,
      dashboardInsights,
    });
  }, [dutyService, settingsRepository]);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <>
      <NavigationContainer theme={createNavigationTheme(theme)}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs">
            {() => (
              <AppTabs
                dutyService={dutyService}
                settingsRepository={settingsRepository}
                backupService={backupService}
                sharedState={sharedState}
                onRefresh={handleRefresh}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>

      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
      />

      <StreakCelebrationModal
        visible={celebrationVisible}
        streakDays={celebrationStreakDays}
        onClose={() => setCelebrationVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});

module.exports = AppNavigator;
