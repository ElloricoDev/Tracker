/**
 * Entries Screen
 * Single source of truth for duty entry creation and management.
 */

const React = require('react');
const { ScrollView, StyleSheet } = require('react-native');
const { useFocusEffect } = require('@react-navigation/native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { useToast } = require('../../../hooks/useToast');
const { designTokens } = require('../../../theme/tokens');
const ScreenHeader = require('../../../components/common/ScreenHeader');
const DutyEntryForm = require('../components/DutyEntryForm');
const EntriesList = require('../components/EntriesList');
const EditEntryModal = require('../components/EditEntryModal');
const DeleteConfirmModal = require('../../../components/common/DeleteConfirmModal');
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

function LogsScreen({ dutyService, onRefresh }) {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [dateKey, setDateKey] = React.useState(dateKeyFromDate(new Date()));
  const mainForm = useSessionForm();
  const selectedDate = React.useMemo(() => dateFromKey(dateKey), [dateKey]);
  const { setValues: setMainFormValues, resetToDefaults: resetMainFormToDefaults } = mainForm;

  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editOriginalDateKey, setEditOriginalDateKey] = React.useState(null);
  const [editSelectedDate, setEditSelectedDate] = React.useState(dateFromKey(dateKey));
  const editForm = useSessionForm();
  const {
    setValues: setEditFormValues,
    validate: validateEditForm,
    values: editFormValues,
    handleTimeChange: handleEditTimeChange,
    clearAm: clearEditAm,
    clearPm: clearEditPm,
    errors: editFormErrors,
  } = editForm;
  const {
    validate: validateMainForm,
    values: mainFormValues,
    handleTimeChange: handleMainTimeChange,
    clearAm: clearMainAm,
    clearPm: clearMainPm,
    resetToDefaults: resetMainForm,
    errors: mainFormErrors,
  } = mainForm;

  const [recentEntries, setRecentEntries] = React.useState([]);
  const [entriesPage, setEntriesPage] = React.useState(0);
  const [totalEntries, setTotalEntries] = React.useState(0);
  const [hasEntryForSelectedDate, setHasEntryForSelectedDate] = React.useState(false);

  const [savingEntry, setSavingEntry] = React.useState(false);
  const [savingEditEntry, setSavingEditEntry] = React.useState(false);
  const [deletingEntry, setDeletingEntry] = React.useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [entryPendingDelete, setEntryPendingDelete] = React.useState(null);

  const entriesPerPage = 10;

  const refreshLocal = React.useCallback(async (targetDateKey) => {
    const currentDateKey = targetDateKey || dateKey;

    const [recent, entryForDay, totalEntriesCount] = await Promise.all([
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
      setMainFormValues({
        amIn: entryForDay.amIn ? formatDisplayTime(currentDateKey, entryForDay.amIn) : '',
        amOut: entryForDay.amOut ? formatDisplayTime(currentDateKey, entryForDay.amOut) : '',
        pmIn: entryForDay.pmIn ? formatDisplayTime(currentDateKey, entryForDay.pmIn) : '',
        pmOut: entryForDay.pmOut ? formatDisplayTime(currentDateKey, entryForDay.pmOut) : '',
      });
    } else {
      resetMainFormToDefaults();
    }
  }, [dateKey, entriesPage, entriesPerPage, dutyService, setMainFormValues, resetMainFormToDefaults]);

  React.useEffect(() => {
    refreshLocal(dateKey);
  }, [dateKey, entriesPage, refreshLocal]);

  useFocusEffect(
    React.useCallback(() => {
      refreshLocal(dateKey);
    }, [refreshLocal, dateKey])
  );

  const handleDateChange = (date) => {
    setDateKey(dateKeyFromDate(date));
  };

  const handleSaveEntry = async () => {
    if (hasEntryForSelectedDate) {
      showToast('An entry already exists for this date. Edit it below instead.', 'error');
      return;
    }

    if (!validateMainForm()) {
      showToast(mainFormErrors[0], 'error');
      return;
    }

    setSavingEntry(true);
    try {
      await dutyService.saveEntry({
        dateKey,
        amIn: mainFormValues.amIn,
        amOut: mainFormValues.amOut,
        pmIn: mainFormValues.pmIn,
        pmOut: mainFormValues.pmOut,
      });
      await refreshLocal(dateKey);
      await onRefresh();
      resetMainForm();
      showToast('Duty entry saved.');
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
    setEditFormValues({
      amIn: entry.amIn ? formatDisplayTime(entry.dateKey, entry.amIn) : '',
      amOut: entry.amOut ? formatDisplayTime(entry.dateKey, entry.amOut) : '',
      pmIn: entry.pmIn ? formatDisplayTime(entry.dateKey, entry.pmIn) : '',
      pmOut: entry.pmOut ? formatDisplayTime(entry.dateKey, entry.pmOut) : '',
    });
    setEditModalVisible(true);
  };

  const handleSaveEditEntry = async () => {
    if (!validateEditForm()) {
      showToast(editFormErrors[0], 'error');
      return;
    }

    setSavingEditEntry(true);
    try {
      const newDateKey = dateKeyFromDate(editSelectedDate);
      await dutyService.updateEntry(editOriginalDateKey, {
        dateKey: newDateKey,
        amIn: editFormValues.amIn,
        amOut: editFormValues.amOut,
        pmIn: editFormValues.pmIn,
        pmOut: editFormValues.pmOut,
      });
      setEditModalVisible(false);
      setDateKey(newDateKey);
      await refreshLocal(newDateKey);
      await onRefresh();
      showToast('Duty entry updated.');
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
    if (!entryPendingDelete) {
      return;
    }

    setDeleteConfirmVisible(false);
    setDeletingEntry(true);
    try {
      await dutyService.deleteEntry(entryPendingDelete.dateKey);
      await refreshLocal(dateKey);
      await onRefresh();
      showToast('Duty entry deleted.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setDeletingEntry(false);
      setEntryPendingDelete(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Entries"
          title="Manage Duty Records"
          subtitle="Create, review, edit, and delete entries from one place."
        />

        <DutyEntryForm
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          sessionValues={mainFormValues}
          onTimeChange={handleMainTimeChange}
          onClearAm={clearMainAm}
          onClearPm={clearMainPm}
          onSubmit={handleSaveEntry}
          loading={savingEntry}
          disabled={hasEntryForSelectedDate}
          errors={mainFormErrors}
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
        sessionValues={editFormValues}
        onTimeChange={handleEditTimeChange}
        onClearAm={clearEditAm}
        onClearPm={clearEditPm}
        onSave={handleSaveEditEntry}
        saving={savingEditEntry}
        errors={editFormErrors}
      />

      <DeleteConfirmModal
        visible={deleteConfirmVisible}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
        title="Delete Entry"
        message={`Delete the entry for ${entryPendingDelete ? formatLongDate(entryPendingDelete.dateKey) : ''}? This action cannot be undone.`}
        loading={deletingEntry}
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

module.exports = LogsScreen;
