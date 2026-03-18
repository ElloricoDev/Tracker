/**
 * OJT Hours Duty Tracker
 * Refactored with neomorphism UI, drawer navigation, and modular architecture
 */

const React = require('react');
const { Platform } = require('react-native');
const { StatusBar } = require('expo-status-bar');
const NavigationBar = require('expo-navigation-bar');
const { SafeAreaProvider } = require('react-native-safe-area-context');
require('react-native-gesture-handler');
const repository = require('./src/features/duty/repository');
const settingsRepository = require('./src/features/settings/repository');
const backupDataRepository = require('./src/features/backup/repository');
const backupFileStore = require('./src/features/backup/file-store');
const { DutyService } = require('./src/features/duty/service');
const { BackupService } = require('./src/features/backup/service');
const { ThemeProvider, useTheme } = require('./src/hooks/useTheme');
const { ToastProvider } = require('./src/hooks/useToast');
const LoadingScreen = require('./src/components/common/LoadingScreen');
const AppNavigator = require('./src/navigation/AppNavigator');

// Initialize services
const dutyService = new DutyService(repository);
const backupService = new BackupService(backupDataRepository, backupFileStore, settingsRepository);

function ThemedStatusBar() {
  const { theme, isDarkMode } = useTheme();

  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark')
      .catch((error) => {
        console.error('Failed to apply navigation bar style:', error);
      });
  }, [isDarkMode]);

  return (
    <StatusBar
      style={isDarkMode ? 'light' : 'dark'}
      backgroundColor={theme.colors.background}
      translucent={false}
    />
  );
}

function App() {
  const [loading, setLoading] = React.useState(true);
  const [initialDarkMode, setInitialDarkMode] = React.useState(false);
  
  React.useEffect(() => {
    const initialize = async () => {
      try {
        // Load initial theme preference
        const themeMode = await settingsRepository.getThemeMode();
        setInitialDarkMode(themeMode === 'dark');
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  if (loading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen message="Loading your data..." />
      </SafeAreaProvider>
    );
  }
  
  return (
    <SafeAreaProvider>
      <ThemeProvider initialDarkMode={initialDarkMode}>
        <ToastProvider>
          <ThemedStatusBar />
          <AppNavigator
            dutyService={dutyService}
            settingsRepository={settingsRepository}
            backupService={backupService}
          />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

module.exports = App;
