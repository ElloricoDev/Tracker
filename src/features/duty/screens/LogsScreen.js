/**
 * Logs Screen Component
 * Displays duty entry form and list of all entries
 */

const React = require('react');
const { ScrollView, StyleSheet, View, Text } = require('react-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { useToast } = require('../../../hooks/useToast');
const { designTokens } = require('../../../theme/tokens');
const DutyEntryForm = require('../components/DutyEntryForm');
const EntriesList = require('../components/EntriesList');
const EditEntryModal = require('../components/EditEntryModal');
const DeleteConfirmModal = require('../../../components/common/DeleteConfirmModal');
const IconButton = require('../../../components/common/IconButton');
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

/**
 * LogsScreen component
 * @param {object} props
 * @param {object} props.navigation - Navigation prop
 * @param {object} props.route - Route prop with params
 */
function LogsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const {
    dutyService,
    onRefresh,
  } = route.params;

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
  const [recentEntries, setRecentEntries] = React.useState([]);
  const [entriesPage, setEntriesPage] = React.useState(0);
  const [totalEntries, setTotalEntries] = React.useState(0);
  const [hasEntryForSelectedDate, setHasEntryForSelectedDate] = React.useState(false);
  
  // UI state
  const [savingEntry, setSavingEntry] = React.useState(false);
  const [savingEditEntry, setSavingEditEntry] = React.useState(false);
  const [deletingEntry, setDeletingEntry] = React.useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [entryPendingDelete, setEntryPendingDelete] = React.useState(null);
  
  const entriesPerPage = 10;
  
  const refreshLocal = React.useCallback(async (targetDateKey) => {
    const currentDateKey = targetDateKey || dateKey;
    
    const [
      recent,
      entryForDay,
      totalEntriesCount,
    ] = await Promise.all([
      dutyService.repository.listRecentEntries(entriesPerPage, entriesPage * entriesPerPage),
      dutyService.repository.getEntryByDate(currentDateKey),
      dutyService.repository.countEntries(),
    ]);
    
    const maxPage = Math.max(0, Math.ceil(totalEntriesCount / entriesPerPage) - 1);
    if (entriesPage > maxPage) {
      setEntriesPage(maxPage);
      return;
    }
    
    setRecentEntries(recent);
    setTotalEntries(totalEntriesCount);
    setHasEntryForSelectedDate(Boolean(entryForDay));
    
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
    
    // Also refresh parent data
    await onRefresh();
  }, [dateKey, entriesPage, entriesPerPage, dutyService, mainForm, onRefresh]);
  
  React.useEffect(() => {
    refreshLocal(dateKey);
  }, [dateKey, entriesPage]);
  
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
      await refreshLocal(dateKey);
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
      await refreshLocal(newDateKey);
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
      await refreshLocal(dateKey);
      showToast('Entry deleted successfully.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setDeletingEntry(false);
      setEntryPendingDelete(null);
    }
  };
  
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <IconButton
          icon="menu"
          onPress={() => navigation.openDrawer()}
          variant="flat"
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Duty Logs
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

module.exports = LogsScreen;
