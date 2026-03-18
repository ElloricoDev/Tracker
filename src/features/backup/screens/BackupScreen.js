/**
 * Backup Screen Component
 * Displays backup and restore functionality
 */

const React = require('react');
const { ScrollView, StyleSheet, View, Text } = require('react-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { useToast } = require('../../../hooks/useToast');
const { designTokens } = require('../../../theme/tokens');
const BackupSection = require('../components/BackupSection');
const DeleteConfirmModal = require('../../../components/common/DeleteConfirmModal');
const IconButton = require('../../../components/common/IconButton');

/**
 * Backup Screen Component
 * @param {object} props
 * @param {object} props.navigation - Navigation prop
 * @param {object} props.route - Route prop with params
 */
function BackupScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const {
    backupService,
    settingsRepository,
    lastBackupAt: initialLastBackupAt,
    onRefresh,
  } = route.params;

  const [lastBackupAt, setLastBackupAt] = React.useState(initialLastBackupAt);
  const [savingBackup, setSavingBackup] = React.useState(false);
  const [restoringBackup, setRestoringBackup] = React.useState(false);
  const [restoreConfirmVisible, setRestoreConfirmVisible] = React.useState(false);

  React.useEffect(() => {
    setLastBackupAt(initialLastBackupAt);
  }, [initialLastBackupAt]);

  const handleExportBackup = async () => {
    setSavingBackup(true);
    try {
      await backupService.exportBackup();
      const now = new Date().toISOString();
      await settingsRepository.setSetting('last_backup_at', now);
      setLastBackupAt(now);
      await onRefresh();
      showToast('Backup exported successfully.');
    } catch (error) {
      showToast('Backup export failed.', 'error');
    } finally {
      setSavingBackup(false);
    }
  };

  const handleRestoreBackup = () => {
    setRestoreConfirmVisible(true);
  };

  const handleConfirmRestore = async () => {
    setRestoreConfirmVisible(false);
    setRestoringBackup(true);
    try {
      await backupService.restoreBackup();
      await onRefresh();
      showToast('Backup restored successfully.');
    } catch (error) {
      showToast(error.message || 'Backup restore failed.', 'error');
    } finally {
      setRestoringBackup(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <IconButton
          icon="menu"
          onPress={() => navigation.openDrawer()}
          variant="flat"
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Backup & Restore
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BackupSection
          lastBackupAt={lastBackupAt}
          onExport={handleExportBackup}
          onRestore={handleRestoreBackup}
          exporting={savingBackup}
          restoring={restoringBackup}
        />
      </ScrollView>
      
      <DeleteConfirmModal
        visible={restoreConfirmVisible}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreConfirmVisible(false)}
        title="Restore Backup"
        message="This will restore data from your latest backup. Current data will be replaced. Are you sure?"
        loading={restoringBackup}
      />
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: designTokens.layout.containerPadding,
    gap: designTokens.spacing.lg,
  },
});

module.exports = BackupScreen;
