/**
 * App Navigator with Drawer
 * Configures drawer navigation with neomorphism styling
 */

const React = require('react');
const { View, Text, StyleSheet, TouchableOpacity } = require('react-native');
const { createDrawerNavigator } = require('@react-navigation/drawer');
const { NavigationContainer } = require('@react-navigation/native');
const { Ionicons } = require('@expo/vector-icons');
const { useTheme } = require('../hooks/useTheme');
const { designTokens } = require('../theme/tokens');
const HomeScreen = require('../features/duty/screens/HomeScreen');
const LogsScreen = require('../features/duty/screens/LogsScreen');
const SettingsScreen = require('../features/settings/screens/SettingsScreen');
const BackupScreen = require('../features/backup/screens/BackupScreen');
const Toast = require('../components/common/Toast');
const { useToast } = require('../hooks/useToast');

const Drawer = createDrawerNavigator();

/**
 * Custom Drawer Content with Neomorphism Design
 */
function CustomDrawerContent({ navigation, state }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const routes = [
    { name: 'Home', label: 'Home', icon: 'home-outline' },
    { name: 'Logs', label: 'Duty Logs', icon: 'list-outline' },
    { name: 'Settings', label: 'Settings', icon: 'settings-outline' },
    { name: 'Backup', label: 'Backup & Restore', icon: 'cloud-upload-outline' },
  ];

  return (
    <View style={[styles.drawerContainer, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.drawerHeader, theme.elevations.medium, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="time-outline" size={32} color={theme.colors.primary} />
        <Text style={[styles.drawerTitle, { color: theme.colors.text }]}>
          OJT Tracker
        </Text>
        <Text style={[styles.drawerSubtitle, { color: theme.colors.textSecondary }]}>
          Duty Hours Management
        </Text>
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
        {routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.name}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                styles.drawerItem,
                isFocused ? [theme.elevations.pressed, { backgroundColor: theme.colors.surface }] : theme.elevations.low,
                { backgroundColor: isFocused ? theme.colors.primaryLight : theme.colors.surface },
              ]}
            >
              <Ionicons
                name={route.icon}
                size={24}
                color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.drawerItemText,
                  { color: isFocused ? theme.colors.primary : theme.colors.text },
                  isFocused && styles.drawerItemTextActive,
                ]}
              >
                {route.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Theme Toggle */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.7}
          style={[styles.themeToggle, theme.elevations.low, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons
            name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.themeToggleText, { color: theme.colors.text }]}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * AppNavigator component
 * @param {object} props
 * @param {object} props.dutyService - Duty service instance
 * @param {object} props.settingsRepository - Settings repository
 * @param {object} props.backupService - Backup service instance
 */
function AppNavigator({ dutyService, settingsRepository, backupService }) {
  const { theme } = useTheme();
  const { toastMessage, toastType, toastVisible } = useToast();

  // Shared state
  const [totalDurationMs, setTotalDurationMs] = React.useState(0);
  const [requiredHours, setRequiredHours] = React.useState(0);
  const [lastBackupAt, setLastBackupAt] = React.useState('');

  const handleRefresh = React.useCallback(async () => {
    const [totalMs, targetHours, latestBackupAt] = await Promise.all([
      dutyService.getTotalDurationMs(),
      settingsRepository.getRequiredHours(),
      settingsRepository.getSetting('last_backup_at'),
    ]);
    
    setTotalDurationMs(totalMs);
    setRequiredHours(targetHours);
    setLastBackupAt(latestBackupAt || '');
  }, [dutyService, settingsRepository]);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const screenParams = {
    dutyService,
    settingsRepository,
    backupService,
    totalDurationMs,
    requiredHours,
    lastBackupAt,
    onRefresh: handleRefresh,
  };

  return (
    <>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: 'front',
            drawerStyle: {
              backgroundColor: theme.colors.background,
              width: 280,
            },
            overlayColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            initialParams={screenParams}
          />
          <Drawer.Screen
            name="Logs"
            component={LogsScreen}
            initialParams={screenParams}
          />
          <Drawer.Screen
            name="Settings"
            component={SettingsScreen}
            initialParams={screenParams}
          />
          <Drawer.Screen
            name="Backup"
            component={BackupScreen}
            initialParams={screenParams}
          />
        </Drawer.Navigator>
      </NavigationContainer>
      
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: designTokens.spacing.xl,
  },
  drawerHeader: {
    padding: designTokens.spacing.xl,
    marginHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.lg,
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: designTokens.spacing.sm,
  },
  drawerSubtitle: {
    fontSize: 14,
    marginTop: designTokens.spacing.xs,
  },
  drawerItems: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designTokens.spacing.md,
    marginBottom: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.md,
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: designTokens.spacing.md,
  },
  drawerItemTextActive: {
    fontWeight: '600',
  },
  drawerFooter: {
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xl,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
  },
  themeToggleText: {
    fontSize: 16,
    marginLeft: designTokens.spacing.md,
  },
});

module.exports = AppNavigator;