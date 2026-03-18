/**
 * Main Screen Component
 * Primary container that composes all feature sections
 */

const React = require('react');
const { ScrollView, StyleSheet, View } = require('react-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { useToast } = require('../../../hooks/useToast');
const { designTokens } = require('../../../theme/tokens');
const DutyEntryForm = require('../components/DutyEntryForm');
const EntriesList = require('../components/EntriesList');
const ProgressSection = require('../components/ProgressSection');
const EditEntryModal = require('../components/EditEntryModal');
const SettingsSection = require('../../settings/components/SettingsSection');
const BackupSection = require('../../backup/components/BackupSection');
const DeleteConfirmModal = require('../../../components/common/DeleteConfirmModal');
const Toast = require('../../../components/common/Toast');
const { useSessionForm } = require('../hooks/useSessionForm');
const { dateKeyFromDate } = require('../service');
const {
  formatTimeFromDate,
  timeValueToDate,
} = require('../time');

function dateFromKey(dateKey) {
  return new Date(`${dateKey}T12:00:00`);
}

function formatLongDate(dateKey) {
  return dateFromKey(dateKey).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDisplayTime(dateKey, timeValue) {
  if (!timeValue) {
    return '';
  }
  return formatTimeFromDate(timeValueToDate(dateFromKey(dateKey), timeValue));
}

function formatHoursAndMinutes(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/**
 * MainScreen component
 * @param {object} props
 * @param {object} props.dutyService - Duty service instance
 * @param {object} props.settingsRepository - Settings repository
 * @param {object} props.backupService - Backup service instance
 */
function MainScreen({ dutyService, settingsRepository, backupService }) {
  const { theme, isDarkMode, setThemeMode } = useTheme();
  const { showToast, toastMessage, toastType, toastVisible } = useToast();
  
  // Main form state
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [dateKey, setDateKey] = React.useState(dateKeyFromDate(new Date()));
  const mainForm = useSessionForm();
  
  // Edit modal state
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editOriginalDateKey, setEditOriginalDateKey] = React.useState(null);
  const [editSelectedDate, setEditSelectedDate] = React.useState(new Date());
  const editForm = useSessionForm();
  
  // Data state
  const [totalDurationMs, setTotalDurationMs] = React.useState(0);
  const [requiredHours, setRequiredHours] = React.useState(0);
  const [requiredHoursInput, setRequiredHoursInput] = React.useState('0');
  const [isEditingRequiredHours, setIsEditingRequiredHours] = React.useState(false);
  const [recentEntries, setRecentEntries] = React.useState([]);
  const [entriesPage, setEntriesPage] = React.useState(0);
  const [totalEntries, setTotalEntries] = React.useState(0);
  const [hasEntryForSelectedDate, setHasEntryForSelectedDate] = React.useState(false);
  const [lastBackupAt, setLastBackupAt] = React.useState('');
  
  // UI state
  const [savingEntry, setSavingEntry] = React.useState(false);
  const [savingEditEntry, setSavingEditEntry] = React.useState(false);
  const [deletingEntry, setDeletingEntry] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [savingBackup, setSavingBackup] = React.useState(false);
  const [restoringBackup, setRestoringBackup] = React.useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [entryPendingDelete, setEntryPendingDelete] = React.useState(null);
  const [restoreConfirmVisible, setRestoreConfirmVisible] = React.useState(false);
  
  const entriesPerPage = 10;
  
  const refresh = React.useCallback(async (targetDateKey, options = {}) => {
    const { syncMainForm = true } = options;
    const currentDateKey = targetDateKey || dateKey;
    
    const [
      totalMs,
      targetHours,
      recent,
      entryForDay,
      totalEntriesCount,
      latestBackupAt,
    ] = await Promise.all([
      dutyService.getTotalDurationMs(),
      settingsRepository.getRequiredHours(),
      dutyService.repository.listRecentEntries(entriesPerPage, entriesPage * entriesPerPage),
      dutyService.repository.getEntryByDate(currentDateKey),
      dutyService.repository.countEntries(),
      settingsRepository.getSetting('last_backup_at'),
    ]);
    
    const maxPage = Math.max(0, Math.ceil(totalEntriesCount / entriesPerPage) - 1);
    if (entriesPage > maxPage) {
      setEntriesPage(maxPage);
      return;
    }
    
    setTotalDurationMs(totalMs);
    setRequiredHours(targetHours);
    setRecentEntries(recent);
    setTotalEntries(totalEntriesCount);
    setHasEntryForSelectedDate(Boolean(entryForDay));
    setLastBackupAt(latestBackupAt || '');
    
    if (syncMainForm) {
      if (entryForDay) {
        mainForm.setValues({
          amIn: entryForDay.amIn ? formatDisplayTime(currentDateKey, entryForDay.amIn) : '',
          amOut: entryForDay.amOut ? formatDisplayTime(currentDateKey, entryForDay.amOut) : '',
          pmIn: entryForDay.pmIn ? formatDisplayTime(currentDateKey, entryForDay.pmIn) : '',
          pmOut: entryForDay.pmOut ? formatDisplayTime(currentDateKey, entryForDay.pmOut) : '',
        });
      } else {
        mainForm.resetToDefaults();
      }
    }
  }, [dateKey, entriesPage, entriesPerPage, dutyService, settingsRepository, mainForm]);
  
  React.useEffect(() => {
    refresh(dateKey);
  }, [dateKey, entriesPage]);
  
  React.useEffect(() => {
    setRequiredHoursInput(String(requiredHours));
  }, [requiredHours]);
  
  // Load theme from settings
  React.useEffect(() => {
    const loadTheme = async () => {
      const themeMode = await settingsRepository.getThemeMode();
      setThemeMode(themeMode || 'light');
    };
    loadTheme();
  }, [settingsRepository, setThemeMode]);
  
  // Handlers
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDateKey(dateKeyFromDate(date));
  };
  
  const handleSaveEntry = async () => {
    if (hasEntryForSelectedDate) {
      showToast('Entry already added for this date. Use Edit in logs.', 'error');
      return;
    }
    
    if (!mainForm.validate()) {
      showToast(mainForm.errors[0], 'error');
      return;
    }
    
    setSavingEntry(true);
    try {
      await dutyService.saveEntry({
        dateKey,
        amIn: mainForm.values.amIn,
        amOut: mainForm.values.amOut,
        pmIn: mainForm.values.pmIn,
        pmOut: mainForm.values.pmOut,
      });
      await refresh(dateKey, { syncMainForm: false });
      mainForm.resetToDefaults();
      showToast('Entry saved successfully.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSavingEntry(false);
    }
  };
  
  const handleEditEntry = (entry) => {
    const pickedDate = dateFromKey(entry.dateKey);
    setEditOriginalDateKey(entry.dateKey);
    setEditSelectedDate(pickedDate);
    editForm.setValues({
      amIn: entry.amIn ? formatDisplayTime(entry.dateKey, entry.amIn) : '',
      amOut: entry.amOut ? formatDisplayTime(entry.dateKey, entry.amOut) : '',
      pmIn: entry.pmIn ? formatDisplayTime(entry.dateKey, entry.pmIn) : '',
      pmOut: entry.pmOut ? formatDisplayTime(entry.dateKey, entry.pmOut) : '',
    });
    setEditModalVisible(true);
  };
  
  const handleSaveEditEntry = async () => {
    if (!editForm.validate()) {
      showToast(editForm.errors[0], 'error');
      return;
    }
    
    setSavingEditEntry(true);
    try {
      const newDateKey = dateKeyFromDate(editSelectedDate);
      await dutyService.updateEntry(editOriginalDateKey, {
        dateKey: newDateKey,
        amIn: editForm.values.amIn,
        amOut: editForm.values.amOut,
        pmIn: editForm.values.pmIn,
        pmOut: editForm.values.pmOut,
      });
      setEditModalVisible(false);
      setDateKey(newDateKey);
      setSelectedDate(editSelectedDate);
      await refresh(newDateKey);
      showToast('Entry updated successfully.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSavingEditEntry(false);
    }
  };
  
  const handleDeleteEntry = (entry) => {
    setEntryPendingDelete(entry);
    setDeleteConfirmVisible(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!entryPendingDelete) return;
    
    setDeleteConfirmVisible(false);
    setDeletingEntry(true);
    try {
      await dutyService.deleteEntry(entryPendingDelete.dateKey);
      if (entryPendingDelete.dateKey === dateKey) {
        mainForm.resetToDefaults();
      }
      await refresh(dateKey);
      showToast('Entry deleted successfully.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setDeletingEntry(false);
      setEntryPendingDelete(null);
    }
  };
  
  const handleSaveRequiredHours = async () => {
    const parsed = Number.parseFloat(requiredHoursInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      showToast('Required hours must be a number equal to or greater than 0.', 'error');
      return;
    }
    
    setSavingSettings(true);
    try {
      await settingsRepository.setRequiredHours(parsed);
      setIsEditingRequiredHours(false);
      await refresh(dateKey);
      showToast('Required hours updated successfully.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };
  
  const handleExportBackup = async () => {
    setSavingBackup(true);
    try {
      const result = await backupService.exportBackup();
      await refresh(dateKey, { syncMainForm: false });
      showToast(`Backup exported (${result.entriesCount} entries).`);
    } catch (error) {
      showToast(error.message, 'error');
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
      const result = await backupService.restoreLatestBackup();
      await refresh(dateKey);
      showToast(`Backup restored (${result.entriesCount} entries).`);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setRestoringBackup(false);
    }
  };
  
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  
  const containerStyles = React.useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background },
  ], [theme]);
  
  return (
    <SafeAreaView style={containerStyles}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProgressSection
          completedMs={totalDurationMs}
          requiredHours={requiredHours}
          formatHours={formatHoursAndMinutes}
        />
        
        <DutyEntryForm
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          sessionValues={mainForm.values}
          onTimeChange={mainForm.handleTimeChange}
          onClearAm={mainForm.clearAm}
          onClearPm={mainForm.clearPm}
          onSubmit={handleSaveEntry}
          loading={savingEntry}
          disabled={hasEntryForSelectedDate}
          errors={mainForm.errors}
        />
        
        <EntriesList
          entries={recentEntries}
          currentPage={entriesPage}
          totalPages={totalPages}
          onPageChange={setEntriesPage}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          formatDate={formatLongDate}
          formatTime={formatDisplayTime}
        />
        
        <SettingsSection
          requiredHours={requiredHoursInput}
          onRequiredHoursChange={setRequiredHoursInput}
          isEditing={isEditingRequiredHours}
          onEditToggle={() => setIsEditingRequiredHours(true)}
          onSave={handleSaveRequiredHours}
          saving={savingSettings}
        />
        
        <BackupSection
          lastBackupAt={lastBackupAt}
          onExport={handleExportBackup}
          onRestore={handleRestoreBackup}
          exporting={savingBackup}
          restoring={restoringBackup}
        />
      </ScrollView>
      
      <EditEntryModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        selectedDate={editSelectedDate}
        onDateChange={setEditSelectedDate}
        sessionValues={editForm.values}
        onTimeChange={editForm.handleTimeChange}
        onClearAm={editForm.clearAm}
        onClearPm={editForm.clearPm}
        onSave={handleSaveEditEntry}
        saving={savingEditEntry}
        errors={editForm.errors}
      />
      
      <DeleteConfirmModal
        visible={deleteConfirmVisible}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
        title="Delete Entry"
        message={`Are you sure you want to delete the entry for ${entryPendingDelete ? formatLongDate(entryPendingDelete.dateKey) : ''}? This action cannot be undone.`}
        loading={deletingEntry}
      />
      
      <DeleteConfirmModal
        visible={restoreConfirmVisible}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreConfirmVisible(false)}
        title="Restore Backup"
        message="This will restore data from your latest backup. Current data will be replaced. Are you sure?"
        loading={restoringBackup}
      />
      
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
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
    padding: designTokens.layout.containerPadding,
    gap: designTokens.spacing.lg,
  },
});

module.exports = MainScreen;
