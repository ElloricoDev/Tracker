/**
 * Settings Screen
 * Unified preferences and backup management.
 */

const React = require('react');
const { ScrollView, StyleSheet } = require('react-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { useToast } = require('../../../hooks/useToast');
const { designTokens } = require('../../../theme/tokens');
const ScreenHeader = require('../../../components/common/ScreenHeader');
const SettingsSection = require('../components/SettingsSection');
const BackupSection = require('../../backup/components/BackupSection');
const DeleteConfirmModal = require('../../../components/common/DeleteConfirmModal');

function SettingsScreen({
  settingsRepository,
  backupService,
  requiredHours: initialRequiredHours,
  lastBackupAt: initialLastBackupAt,
  onRefresh,
}) {
  const { theme, isDarkMode, setThemeMode } = useTheme();
  const { showToast } = useToast();

  const [requiredHoursInput, setRequiredHoursInput] = React.useState(String(initialRequiredHours));
  const [lastBackupAt, setLastBackupAt] = React.useState(initialLastBackupAt);
  const [isEditingRequiredHours, setIsEditingRequiredHours] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [savingBackup, setSavingBackup] = React.useState(false);
  const [restoringBackup, setRestoringBackup] = React.useState(false);
  const [restoreConfirmVisible, setRestoreConfirmVisible] = React.useState(false);

  React.useEffect(() => {
    setRequiredHoursInput(String(initialRequiredHours));
  }, [initialRequiredHours]);

  React.useEffect(() => {
    setLastBackupAt(initialLastBackupAt);
  }, [initialLastBackupAt]);

  const handleThemeToggle = async () => {
    const nextMode = isDarkMode ? 'light' : 'dark';
    try {
      setThemeMode(nextMode);
      await settingsRepository.setThemeMode(nextMode);
      showToast(`Switched to ${nextMode} mode.`);
    } catch (error) {
      setThemeMode(isDarkMode ? 'dark' : 'light');
      showToast('Failed to update theme preference.', 'error');
    }
  };

  const handleSaveRequiredHours = async () => {
    const parsed = Number.parseFloat(requiredHoursInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      showToast('Please enter a valid number of hours.', 'error');
      return;
    }

    setSavingSettings(true);
    try {
      await settingsRepository.setRequiredHours(parsed);
      setIsEditingRequiredHours(false);
      await onRefresh();
      showToast('Required hours updated.');
    } catch (error) {
      showToast('Failed to save required hours.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExportBackup = async () => {
    setSavingBackup(true);
    try {
      const result = await backupService.exportBackup();
      setLastBackupAt(result.exportedAt);
      await onRefresh();
      showToast(`Backup exported (${result.entriesCount} entries).`);
    } catch (error) {
      showToast(error.message || 'Backup export failed.', 'error');
    } finally {
      setSavingBackup(false);
    }
  };

  const handleConfirmRestore = async () => {
    setRestoreConfirmVisible(false);
    setRestoringBackup(true);
    try {
      const result = await backupService.restoreLatestBackup();
      setLastBackupAt(result.sourceExportedAt || lastBackupAt);
      await onRefresh();
      showToast(`Backup restored (${result.entriesCount} entries).`);
    } catch (error) {
      showToast(error.message || 'Backup restore failed.', 'error');
    } finally {
      setRestoringBackup(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Settings"
          title="Preferences & Backup"
          subtitle="Control appearance, hour targets, and the safety of your stored data."
        />

        <SettingsSection
          requiredHours={requiredHoursInput}
          onRequiredHoursChange={setRequiredHoursInput}
          isEditing={isEditingRequiredHours}
          onEditToggle={() => setIsEditingRequiredHours(true)}
          onSave={handleSaveRequiredHours}
          saving={savingSettings}
          onThemeToggle={handleThemeToggle}
        />

        <BackupSection
          lastBackupAt={lastBackupAt}
          onExport={handleExportBackup}
          onRestore={() => setRestoreConfirmVisible(true)}
          exporting={savingBackup}
          restoring={restoringBackup}
        />
      </ScrollView>

      <DeleteConfirmModal
        visible={restoreConfirmVisible}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreConfirmVisible(false)}
        title="Restore Backup"
        message="Restore the latest backup and replace the current local data?"
        loading={restoringBackup}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: designTokens.layout.screenPadding,
    gap: designTokens.layout.sectionGap,
    paddingBottom: designTokens.spacing.xxxl,
  },
});

module.exports = SettingsScreen;
