/**
 * Entries Screen
 * Single source of truth for duty entry creation and management.
 */

const React = require('react');
const { ScrollView, StyleSheet, View, Text, Pressable } = require('react-native');
const { useFocusEffect } = require('@react-navigation/native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { useToast } = require('../../../hooks/useToast');
const { designTokens } = require('../../../theme/tokens');
const ScreenHeader = require('../../../components/common/ScreenHeader');
const Button = require('../../../components/common/Button');
const DutyEntryForm = require('../components/DutyEntryForm');
const EntriesList = require('../components/EntriesList');
const EditEntryModal = require('../components/EditEntryModal');
const DeleteConfirmModal = require('../../../components/common/DeleteConfirmModal');
const WeekContextStrip = require('../components/WeekContextStrip');
const { useSessionForm } = require('../hooks/useSessionForm');
const { dateKeyFromDate } = require('../service');
const {
  addDays,
  formatTimeFromDate,
  startOfLocalWeekMonday,
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

function formatShortWeekday(dateKey) {
  return dateFromKey(dateKey).toLocaleDateString('en-US', { weekday: 'short' });
}

function formatWeekRange(dateKey) {
  const weekStart = startOfLocalWeekMonday(dateFromKey(dateKey));
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();

  if (sameMonth) {
    return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  }

  return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function buildSelectedDayStatus(hasEntryForSelectedDate) {
  if (hasEntryForSelectedDate) {
    return {
      tone: 'success',
      title: 'Entry saved',
      message: 'This selected day already has a saved duty record. You can review it below or edit it from the list.',
    };
  }

  return {
    tone: 'warning',
    title: 'No entry yet',
    message: 'This selected day does not have a saved duty record yet. You can add one using the form below.',
  };
}

function buildWeekDays(dateKey, entryDateKeys) {
  const weekStart = startOfLocalWeekMonday(dateFromKey(dateKey));
  return Array.from({ length: 7 }, (_, index) => {
    const current = addDays(weekStart, index);
    const currentDateKey = dateKeyFromDate(current);
    return {
      dateKey: currentDateKey,
      label: formatShortWeekday(currentDateKey),
      dayNumber: current.getDate(),
      hasEntry: entryDateKeys.has(currentDateKey),
    };
  });
}

function LogsScreen({ dutyService, onRefresh, route }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const lastAppliedDashboardRouteRef = React.useRef('');

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
  const [dashboardContextActive, setDashboardContextActive] = React.useState(false);
  const [dashboardContextMode, setDashboardContextMode] = React.useState(null);
  const [dashboardContextDismissed, setDashboardContextDismissed] = React.useState(false);
  const [weekEntryDateKeys, setWeekEntryDateKeys] = React.useState(new Set());

  const [savingEntry, setSavingEntry] = React.useState(false);
  const [savingEditEntry, setSavingEditEntry] = React.useState(false);
  const [deletingEntry, setDeletingEntry] = React.useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [entryPendingDelete, setEntryPendingDelete] = React.useState(null);

  const entriesPerPage = 10;

  const refreshLocal = React.useCallback(async (targetDateKey) => {
    const currentDateKey = targetDateKey || dateKey;
    const weekStart = startOfLocalWeekMonday(dateFromKey(currentDateKey));
    const weekStartKey = dateKeyFromDate(weekStart);
    const weekEndKey = dateKeyFromDate(addDays(weekStart, 7));

    const [recent, entryForDay, totalEntriesCount, weekEntries] = await Promise.all([
      dutyService.repository.listRecentEntries(entriesPerPage, entriesPage * entriesPerPage),
      dutyService.repository.getEntryByDate(currentDateKey),
      dutyService.repository.countEntries(),
      dutyService.repository.listEntriesBetween(weekStartKey, weekEndKey),
    ]);

    const maxPage = Math.max(0, Math.ceil(totalEntriesCount / entriesPerPage) - 1);
    if (entriesPage > maxPage) {
      setEntriesPage(maxPage);
      return;
    }

    setRecentEntries(recent);
    setTotalEntries(totalEntriesCount);
    setHasEntryForSelectedDate(Boolean(entryForDay));
    setWeekEntryDateKeys(new Set(weekEntries.map((entry) => entry.dateKey)));

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

  React.useEffect(() => {
    const selectedDateKey = route && route.params ? route.params.selectedDateKey : null;
    const entryContextSource = route && route.params ? route.params.entryContextSource : null;
    const entryContextMode = route && route.params ? route.params.entryContextMode : null;

    if (!selectedDateKey || entryContextSource !== 'dashboard') {
      return;
    }

    const routeSignature = `${selectedDateKey}|${entryContextSource}|${entryContextMode || ''}`;
    if (lastAppliedDashboardRouteRef.current === routeSignature) {
      return;
    }

    lastAppliedDashboardRouteRef.current = routeSignature;
    setDashboardContextActive(true);
    setDashboardContextMode(entryContextMode || null);
    setDashboardContextDismissed(false);
    setEntriesPage(0);
    setDateKey(selectedDateKey);
  }, [
    route && route.params ? route.params.selectedDateKey : null,
    route && route.params ? route.params.entryContextSource : null,
    route && route.params ? route.params.entryContextMode : null,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      refreshLocal(dateKey);
    }, [refreshLocal, dateKey])
  );

  const handleDateChange = (date) => {
    setDashboardContextActive(false);
    setDashboardContextMode(null);
    setDashboardContextDismissed(false);
    setDateKey(dateKeyFromDate(date));
  };

  const handleSelectWeekDate = (selectedWeekDateKey) => {
    setDateKey(selectedWeekDateKey);
  };

  const handleShiftWeek = (days) => {
    const shiftedWeekDate = addDays(dateFromKey(dateKey), days);
    setDateKey(dateKeyFromDate(shiftedWeekDate));
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
  const showDashboardContextBanner =
    dashboardContextActive &&
    !dashboardContextDismissed &&
    Boolean(dateKey);
  const showWeekContext =
    showDashboardContextBanner &&
    dashboardContextMode === 'week';
  const weekDays = React.useMemo(() => buildWeekDays(dateKey, weekEntryDateKeys), [dateKey, weekEntryDateKeys]);
  const selectedDayStatus = React.useMemo(
    () => buildSelectedDayStatus(hasEntryForSelectedDate),
    [hasEntryForSelectedDate]
  );

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
          subtitle="Create, review, edit, and delete duty records from one place."
        />

        {showDashboardContextBanner ? (
          <View
            style={[
              styles.contextBanner,
              {
                backgroundColor: theme.colors.infoBg,
                borderColor: theme.colors.info,
              },
            ]}
          >
            <View style={styles.contextCopy}>
              <Text style={[styles.contextTitle, { color: theme.colors.info }]}>
                Opened from Dashboard
              </Text>
              <Text style={[styles.contextMessage, { color: theme.colors.text }]}>
                You are viewing {formatLongDate(dateKey)}. Edit this day directly or switch dates below.
              </Text>
            </View>
            <Button
              variant="flat"
              size="small"
              onPress={() => {
                setDashboardContextActive(false);
                setDashboardContextDismissed(true);
                setDashboardContextMode(null);
              }}
            >
              Dismiss
            </Button>
          </View>
        ) : null}

        {showWeekContext ? (
          <WeekContextStrip
            title="This Week"
            subtitle={`${formatWeekRange(dateKey)}. Move across the week without reopening Dashboard.`}
            weekDays={weekDays}
            selectedDateKey={dateKey}
            onSelectWeekDate={handleSelectWeekDate}
            onPreviousWeek={() => handleShiftWeek(-7)}
            onNextWeek={() => handleShiftWeek(7)}
            selectedDayStatus={selectedDayStatus}
            formatLongDate={formatLongDate}
          />
        ) : null}

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
  contextBanner: {
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.sm,
  },
  contextCopy: {
    gap: 4,
  },
  contextTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  contextMessage: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
});

module.exports = LogsScreen;
