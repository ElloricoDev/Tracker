/**
 * OJT Hours Duty Tracker
 * Refactored with neomorphism UI, drawer navigation, and modular architecture
 */

const React = require('react');
const { StatusBar } = require('expo-status-bar');
require('react-native-gesture-handler');
const repository = require('./src/features/duty/repository');
const settingsRepository = require('./src/features/settings/repository');
const backupDataRepository = require('./src/features/backup/repository');
const backupFileStore = require('./src/features/backup/file-store');
const { DutyService } = require('./src/features/duty/service');
const { BackupService } = require('./src/features/backup/service');
const { ThemeProvider } = require('./src/hooks/useTheme');
const { ToastProvider } = require('./src/hooks/useToast');
const LoadingScreen = require('./src/components/common/LoadingScreen');
const AppNavigator = require('./src/navigation/AppNavigator');

// Initialize services
const dutyService = new DutyService(repository);
const backupService = new BackupService(backupDataRepository, backupFileStore, settingsRepository);

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
    return <LoadingScreen message="Loading your data..." />;
  }
  
  return (
    <ThemeProvider initialDarkMode={initialDarkMode}>
      <ToastProvider>
        <StatusBar style="auto" />
        <AppNavigator
          dutyService={dutyService}
          settingsRepository={settingsRepository}
          backupService={backupService}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}

module.exports = App;
