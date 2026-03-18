const React = require('react');
const { StatusBar } = require('expo-status-bar');
const DateTimePicker = require('@react-native-community/datetimepicker').default;
const {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} = require('react-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { Svg, Circle } = require('react-native-svg');
const repository = require('./src/features/duty/repository');
const settingsRepository = require('./src/features/settings/repository');
const backupDataRepository = require('./src/features/backup/repository');
const backupFileStore = require('./src/features/backup/file-store');
const { DutyService, dateKeyFromDate } = require('./src/features/duty/service');
const { BackupService, LAST_BACKUP_AT_KEY } = require('./src/features/backup/service');
const {
  calculateRequirementProgress,
  formatTimeFromDate,
  parseTimeToMinutes,
  timeValueToDate,
} = require('./src/features/duty/time');
const { Ionicons } = require('@expo/vector-icons');

const dutyService = new DutyService(repository);
const backupService = new BackupService(backupDataRepository, backupFileStore, settingsRepository);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function formatLongDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function dateFromKey(dateKey) {
  return new Date(`${dateKey}T12:00:00`);
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
  return `${hours}h ${minutes}minutes`;
}

const DEFAULT_TIMES = {
  amIn: '8:00 AM',
  amOut: '12:00 PM',
  pmIn: '1:00 PM',
  pmOut: '5:00 PM',
};
const AM_FIELDS = ['amIn', 'amOut'];
const PM_FIELDS = ['pmIn', 'pmOut'];

function SessionTimeFields({ values, onOpenTimePicker, onClearAm, onClearPm, isDarkMode }) {
  return (
    <>
      <View style={styles.sessionBlock}>
        <View style={styles.sessionHeadingRow}>
          <Ionicons name="time-outline" size={14} color="#cbd5e1" />
          <Text style={[styles.sessionHeading, !isDarkMode && styles.sessionHeadingLight]}>Morning</Text>
        </View>
        <View style={styles.inputGrid}>
          <View style={styles.gridCol}>
            <Pressable
              style={({ pressed }) => [
                styles.timePickerButton,
                !isDarkMode && styles.timePickerButtonLight,
                pressed ? styles.pressedControl : null,
              ]}
              onPress={() => onOpenTimePicker('amIn')}
              accessibilityLabel="Select AM in time"
            >
              <Text style={[styles.datePickerText, !isDarkMode && styles.datePickerTextLight]}>
                {values.amIn || '--:-- --'}
              </Text>
            </Pressable>
            <Text style={[styles.timeHint, !isDarkMode && styles.timeHintLight]}>Time In</Text>
          </View>
          <View style={styles.gridCol}>
            <Pressable
              style={({ pressed }) => [
                styles.timePickerButton,
                !isDarkMode && styles.timePickerButtonLight,
                pressed ? styles.pressedControl : null,
              ]}
              onPress={() => onOpenTimePicker('amOut')}
              accessibilityLabel="Select AM out time"
            >
              <Text style={[styles.datePickerText, !isDarkMode && styles.datePickerTextLight]}>
                {values.amOut || '--:-- --'}
              </Text>
            </Pressable>
            <Text style={[styles.timeHint, !isDarkMode && styles.timeHintLight]}>Time Out</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.clearLinkButton, pressed ? styles.pressedControl : null]}
          onPress={onClearAm}
          accessibilityLabel="Clear AM session"
        >
          <Text style={styles.clearLinkText}>Clear morning</Text>
        </Pressable>
      </View>

      <View style={styles.sessionBlock}>
        <View style={styles.sessionHeadingRow}>
          <Ionicons name="time-outline" size={14} color="#cbd5e1" />
          <Text style={[styles.sessionHeading, !isDarkMode && styles.sessionHeadingLight]}>Afternoon</Text>
        </View>
        <View style={styles.inputGrid}>
          <View style={styles.gridCol}>
            <Pressable
              style={({ pressed }) => [
                styles.timePickerButton,
                !isDarkMode && styles.timePickerButtonLight,
                pressed ? styles.pressedControl : null,
              ]}
              onPress={() => onOpenTimePicker('pmIn')}
              accessibilityLabel="Select PM in time"
            >
              <Text style={[styles.datePickerText, !isDarkMode && styles.datePickerTextLight]}>
                {values.pmIn || '--:-- --'}
              </Text>
            </Pressable>
            <Text style={[styles.timeHint, !isDarkMode && styles.timeHintLight]}>Time In</Text>
          </View>
          <View style={styles.gridCol}>
            <Pressable
              style={({ pressed }) => [
                styles.timePickerButton,
                !isDarkMode && styles.timePickerButtonLight,
                pressed ? styles.pressedControl : null,
              ]}
              onPress={() => onOpenTimePicker('pmOut')}
              accessibilityLabel="Select PM out time"
            >
              <Text style={[styles.datePickerText, !isDarkMode && styles.datePickerTextLight]}>
                {values.pmOut || '--:-- --'}
              </Text>
            </Pressable>
            <Text style={[styles.timeHint, !isDarkMode && styles.timeHintLight]}>Time Out</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.clearLinkButton, pressed ? styles.pressedControl : null]}
          onPress={onClearPm}
          accessibilityLabel="Clear PM session"
        >
          <Text style={styles.clearLinkText}>Clear afternoon</Text>
        </Pressable>
      </View>
    </>
  );
}

function setSessionFieldValue(setters, field, value) {
  const setter = setters[field];
  if (setter) {
    setter(value);
  }
}

function getSessionFieldValue(values, field) {
  return values[field] || '';
}

function openSessionTimePicker({
  field,
  values,
  selectedDate,
  setPickerValue,
  setActiveField,
  setShowPicker,
}) {
  const currentValue = getSessionFieldValue(values, field);
  const parsed = parseTimeToMinutes(currentValue);
  const fallback = new Date(selectedDate);
  fallback.setHours(parsed == null ? 8 : Math.floor(parsed / 60), parsed == null ? 0 : parsed % 60, 0, 0);
  setPickerValue(fallback);
  setActiveField(field);
  setShowPicker(true);
}

function handleSessionTimeChange({ pickedDate, activeField, setShowPicker, setters }) {
  setShowPicker(false);
  if (!pickedDate || !activeField) {
    return;
  }
  setSessionFieldValue(setters, activeField, formatTimeFromDate(pickedDate));
}

function clearSessionFields(setters, fields) {
  fields.forEach((field) => setSessionFieldValue(setters, field, ''));
}

function applySessionValues(setters, values) {
  Object.entries(values).forEach(([field, value]) => setSessionFieldValue(setters, field, value));
}

function App() {
  const initialDate = new Date();
  const systemColorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = React.useState(true);
  const [savingEntry, setSavingEntry] = React.useState(false);
  const [savingEditEntry, setSavingEditEntry] = React.useState(false);
  const [deletingEntry, setDeletingEntry] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [savingBackup, setSavingBackup] = React.useState(false);
  const [restoringBackup, setRestoringBackup] = React.useState(false);
  const [error, setError] = React.useState('');
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState('success');
  const [isDarkMode, setIsDarkMode] = React.useState(systemColorScheme !== 'light');
  const [lastBackupAt, setLastBackupAt] = React.useState('');

  const [totalDurationMs, setTotalDurationMs] = React.useState(0);
  const [requiredHours, setRequiredHours] = React.useState(0);
  const [requiredHoursInput, setRequiredHoursInput] = React.useState('0');
  const [hasRequiredHoursSetting, setHasRequiredHoursSetting] = React.useState(false);
  const [isEditingRequiredHours, setIsEditingRequiredHours] = React.useState(false);
  const [recentEntries, setRecentEntries] = React.useState([]);
  const [entriesPage, setEntriesPage] = React.useState(0);
  const [totalEntries, setTotalEntries] = React.useState(0);
  const [hasEntryForSelectedDate, setHasEntryForSelectedDate] = React.useState(false);

  const [dateKey, setDateKey] = React.useState(dateKeyFromDate(initialDate));
  const [selectedDate, setSelectedDate] = React.useState(initialDate);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [activeTimeField, setActiveTimeField] = React.useState(null);
  const [timePickerValue, setTimePickerValue] = React.useState(initialDate);
  const [amIn, setAmIn] = React.useState(DEFAULT_TIMES.amIn);
  const [amOut, setAmOut] = React.useState(DEFAULT_TIMES.amOut);
  const [pmIn, setPmIn] = React.useState(DEFAULT_TIMES.pmIn);
  const [pmOut, setPmOut] = React.useState(DEFAULT_TIMES.pmOut);

  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editOriginalDateKey, setEditOriginalDateKey] = React.useState(null);
  const [editDateKey, setEditDateKey] = React.useState(dateKeyFromDate(initialDate));
  const [editSelectedDate, setEditSelectedDate] = React.useState(initialDate);
  const [editShowDatePicker, setEditShowDatePicker] = React.useState(false);
  const [editShowTimePicker, setEditShowTimePicker] = React.useState(false);
  const [editActiveTimeField, setEditActiveTimeField] = React.useState(null);
  const [editTimePickerValue, setEditTimePickerValue] = React.useState(initialDate);
  const [editAmIn, setEditAmIn] = React.useState('');
  const [editAmOut, setEditAmOut] = React.useState('');
  const [editPmIn, setEditPmIn] = React.useState('');
  const [editPmOut, setEditPmOut] = React.useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [entryPendingDelete, setEntryPendingDelete] = React.useState(null);
  const [restoreConfirmVisible, setRestoreConfirmVisible] = React.useState(false);
  const toastTimeoutRef = React.useRef(null);
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const openingPulse = React.useRef(new Animated.Value(0.5)).current;
  const contentFade = React.useRef(new Animated.Value(0)).current;
  const mainSessionValues = { amIn, amOut, pmIn, pmOut };
  const editSessionValues = { amIn: editAmIn, amOut: editAmOut, pmIn: editPmIn, pmOut: editPmOut };
  const mainSetters = React.useMemo(
    () => ({ amIn: setAmIn, amOut: setAmOut, pmIn: setPmIn, pmOut: setPmOut }),
    []
  );
  const editSetters = React.useMemo(
    () => ({ amIn: setEditAmIn, amOut: setEditAmOut, pmIn: setEditPmIn, pmOut: setEditPmOut }),
    []
  );
  const entriesPerPage = 10;

  const showToast = React.useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastType(type);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage('');
    }, 2200);
  }, []);

  const resetMainFormTimesToDefault = React.useCallback(() => {
    applySessionValues(mainSetters, DEFAULT_TIMES);
  }, [mainSetters]);

  const refresh = React.useCallback(
    async (targetDateKey, options) => {
      const { syncMainForm = true } = options || {};
      const currentDateKey = targetDateKey || dateKey;
      const [totalMs, targetHours, hasRequiredSetting, recent, entryForDay, totalEntriesCount, themeMode, latestBackupAt] =
        await Promise.all([
        dutyService.getTotalDurationMs(),
        settingsRepository.getRequiredHours(),
        settingsRepository.hasRequiredHoursSetting(),
        repository.listRecentEntries(entriesPerPage, entriesPage * entriesPerPage),
        repository.getEntryByDate(currentDateKey),
        repository.countEntries(),
        settingsRepository.getThemeMode(),
        settingsRepository.getSetting(LAST_BACKUP_AT_KEY),
      ]);

      const maxPage = Math.max(0, Math.ceil(totalEntriesCount / entriesPerPage) - 1);
      if (entriesPage > maxPage) {
        setEntriesPage(maxPage);
        return;
      }

      setTotalDurationMs(totalMs);
      setRequiredHours(targetHours);
      setHasRequiredHoursSetting(hasRequiredSetting);
      setIsDarkMode(themeMode === 'dark');
      setLastBackupAt(latestBackupAt || '');
      setIsEditingRequiredHours((previous) => (hasRequiredSetting ? previous : true));
      setRecentEntries(recent);
      setTotalEntries(totalEntriesCount);
      setHasEntryForSelectedDate(Boolean(entryForDay));

      if (syncMainForm) {
        if (entryForDay) {
          applySessionValues(mainSetters, {
            amIn: entryForDay.amIn ? formatDisplayTime(currentDateKey, entryForDay.amIn) : '',
            amOut: entryForDay.amOut ? formatDisplayTime(currentDateKey, entryForDay.amOut) : '',
            pmIn: entryForDay.pmIn ? formatDisplayTime(currentDateKey, entryForDay.pmIn) : '',
            pmOut: entryForDay.pmOut ? formatDisplayTime(currentDateKey, entryForDay.pmOut) : '',
          });
        } else {
          resetMainFormTimesToDefault();
        }
      }
    },
    [dateKey, entriesPage, entriesPerPage, mainSetters, resetMainFormTimesToDefault]
  );

  React.useEffect(() => {
    const run = async () => {
      try {
        await refresh(dateKey);
      } catch (loadError) {
        setError(loadError.message);
        showToast(loadError.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [dateKey, entriesPage, refresh, showToast]);

  React.useEffect(() => {
    setRequiredHoursInput(String(requiredHours));
  }, [requiredHours]);

  React.useEffect(
    () => () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    },
    []
  );

  React.useEffect(() => {
    if (loading) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(openingPulse, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(openingPulse, {
            toValue: 0.5,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
    openingPulse.stopAnimation();
    openingPulse.setValue(1);
    return undefined;
  }, [loading, openingPulse]);

  React.useEffect(() => {
    if (loading) {
      contentFade.setValue(0);
      return;
    }
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [loading, contentFade]);

  const openTimePicker = (field) => {
    openSessionTimePicker({
      field,
      values: mainSessionValues,
      selectedDate,
      setPickerValue: setTimePickerValue,
      setActiveField: setActiveTimeField,
      setShowPicker: setShowTimePicker,
    });
  };

  const onTimeChange = (_, pickedDate) => {
    handleSessionTimeChange({
      pickedDate,
      activeField: activeTimeField,
      setShowPicker: setShowTimePicker,
      setters: mainSetters,
    });
  };

  const onDateChange = (_, pickedDate) => {
    setShowDatePicker(false);
    if (!pickedDate) {
      return;
    }

    setSelectedDate(pickedDate);
    setDateKey(dateKeyFromDate(pickedDate));
  };

  const onSaveEntry = async () => {
    if (hasEntryForSelectedDate) {
      const message = 'Entry already added for this date. Use Edit in logs.';
      setError(message);
      showToast(message, 'error');
      return;
    }

    setError('');
    setSavingEntry(true);
    try {
      await dutyService.saveEntry({ dateKey, amIn, amOut, pmIn, pmOut });
      await refresh(dateKey, { syncMainForm: false });
      resetMainFormTimesToDefault();
      showToast('Entry saved successfully.');
    } catch (saveError) {
      setError(saveError.message);
      showToast(saveError.message, 'error');
    } finally {
      setSavingEntry(false);
    }
  };

  const clearAmSession = () => {
    clearSessionFields(mainSetters, AM_FIELDS);
  };

  const clearPmSession = () => {
    clearSessionFields(mainSetters, PM_FIELDS);
  };

  const openEditTimePicker = (field) => {
    openSessionTimePicker({
      field,
      values: editSessionValues,
      selectedDate: editSelectedDate,
      setPickerValue: setEditTimePickerValue,
      setActiveField: setEditActiveTimeField,
      setShowPicker: setEditShowTimePicker,
    });
  };

  const onEditTimeChange = (_, pickedDate) => {
    handleSessionTimeChange({
      pickedDate,
      activeField: editActiveTimeField,
      setShowPicker: setEditShowTimePicker,
      setters: editSetters,
    });
  };

  const onEditDateChange = (_, pickedDate) => {
    setEditShowDatePicker(false);
    if (!pickedDate) {
      return;
    }

    setEditSelectedDate(pickedDate);
    setEditDateKey(dateKeyFromDate(pickedDate));
  };

  const onEditEntry = (entry) => {
    const pickedDate = dateFromKey(entry.dateKey);
    setEditOriginalDateKey(entry.dateKey);
    setEditSelectedDate(pickedDate);
    setEditDateKey(entry.dateKey);
    setEditShowDatePicker(false);
    setEditShowTimePicker(false);
    setEditActiveTimeField(null);
    setEditTimePickerValue(pickedDate);
    applySessionValues(editSetters, {
      amIn: entry.amIn ? formatDisplayTime(entry.dateKey, entry.amIn) : '',
      amOut: entry.amOut ? formatDisplayTime(entry.dateKey, entry.amOut) : '',
      pmIn: entry.pmIn ? formatDisplayTime(entry.dateKey, entry.pmIn) : '',
      pmOut: entry.pmOut ? formatDisplayTime(entry.dateKey, entry.pmOut) : '',
    });
    setError('');
    setEditModalVisible(true);
  };

  const clearEditAmSession = () => {
    clearSessionFields(editSetters, AM_FIELDS);
  };

  const clearEditPmSession = () => {
    clearSessionFields(editSetters, PM_FIELDS);
  };

  const onSaveEditEntry = async () => {
    if (!editOriginalDateKey) {
      return;
    }

    setError('');
    setSavingEditEntry(true);
    try {
      await dutyService.updateEntry(editOriginalDateKey, {
        dateKey: editDateKey,
        amIn: editAmIn,
        amOut: editAmOut,
        pmIn: editPmIn,
        pmOut: editPmOut,
      });
      setEditModalVisible(false);
      setDateKey(editDateKey);
      setSelectedDate(editSelectedDate);
      await refresh(editDateKey);
      showToast('Entry updated successfully.');
    } catch (saveError) {
      setError(saveError.message);
      showToast(saveError.message, 'error');
    } finally {
      setSavingEditEntry(false);
    }
  };

  const onCloseEditModal = () => {
    setEditShowDatePicker(false);
    setEditShowTimePicker(false);
    setEditActiveTimeField(null);
    setEditModalVisible(false);
  };

  const onDeleteEntry = (entry) => {
    setEntryPendingDelete(entry);
    setDeleteConfirmVisible(true);
  };

  const onCancelDeleteEntry = () => {
    if (deletingEntry) {
      return;
    }
    setDeleteConfirmVisible(false);
    setEntryPendingDelete(null);
  };

  const onConfirmDeleteEntry = async () => {
    if (!entryPendingDelete) {
      return;
    }

    const entry = entryPendingDelete;
    setDeleteConfirmVisible(false);
    setError('');
    setDeletingEntry(true);
    try {
      await dutyService.deleteEntry(entry.dateKey);
      if (entry.dateKey === dateKey) {
        resetMainFormTimesToDefault();
      }
      await refresh(dateKey);
      showToast('Entry deleted successfully.');
    } catch (deleteError) {
      setError(deleteError.message);
      showToast(deleteError.message, 'error');
    } finally {
      setDeletingEntry(false);
      setEntryPendingDelete(null);
    }
  };

  const onSaveRequiredHours = async () => {
    if (hasRequiredHoursSetting && !isEditingRequiredHours) {
      const message = 'Required hours already saved. Click Edit to change it.';
      setError(message);
      showToast(message, 'error');
      return;
    }

    const parsed = Number.parseFloat(requiredHoursInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      const message = 'Required hours must be a number equal to or greater than 0.';
      setError(message);
      showToast(message, 'error');
      return;
    }

    setError('');
    setSavingSettings(true);
    try {
      await settingsRepository.setRequiredHours(parsed);
      setIsEditingRequiredHours(false);
      await refresh(dateKey);
      showToast('Required hours updated successfully.');
    } catch (saveError) {
      setError(saveError.message);
      showToast(saveError.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const onEditRequiredHours = () => {
    setIsEditingRequiredHours(true);
    setError('');
    showToast('Required hours edit mode enabled.');
  };

  const onExportBackup = async () => {
    setError('');
    setSavingBackup(true);
    try {
      const result = await backupService.exportBackup();
      await refresh(dateKey, { syncMainForm: false });
      const shared = await backupFileStore.shareBackup(result.latestPath);
      showToast(
        shared
          ? `Backup exported (${result.entriesCount} entries).`
          : `Backup saved locally (${result.entriesCount} entries).`,
        'success'
      );
    } catch (exportError) {
      setError(exportError.message);
      showToast(exportError.message, 'error');
    } finally {
      setSavingBackup(false);
    }
  };

  const onRequestRestoreBackup = () => {
    if (restoringBackup) {
      return;
    }
    setRestoreConfirmVisible(true);
  };

  const onCancelRestoreBackup = () => {
    if (restoringBackup) {
      return;
    }
    setRestoreConfirmVisible(false);
  };

  const onConfirmRestoreBackup = async () => {
    setRestoreConfirmVisible(false);
    setError('');
    setRestoringBackup(true);
    try {
      const result = await backupService.restoreLatestBackup();
      await refresh(dateKey);
      showToast(`Backup restored (${result.entriesCount} entries).`);
    } catch (restoreError) {
      setError(restoreError.message);
      showToast(restoreError.message, 'error');
    } finally {
      setRestoringBackup(false);
    }
  };

  const onToggleDarkMode = async () => {
    const nextIsDarkMode = !isDarkMode;
    setIsDarkMode(nextIsDarkMode);
    try {
      await settingsRepository.setThemeMode(nextIsDarkMode ? 'dark' : 'light');
      showToast(nextIsDarkMode ? 'Dark mode enabled.' : 'Light mode enabled.');
    } catch (saveError) {
      setIsDarkMode(!nextIsDarkMode);
      setError(saveError.message);
      showToast(saveError.message, 'error');
    }
  };
  const totalEntryPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const canGoPreviousEntriesPage = entriesPage > 0;
  const canGoNextEntriesPage = entriesPage + 1 < totalEntryPages;
  const completedProgressMs = totalDurationMs;
  const progress = calculateRequirementProgress(completedProgressMs, requiredHours);
  const progressPercent = Math.max(0, Math.min(100, progress.percentComplete));

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [progressAnim, progressPercent]);

  if (loading) {
    const openingIsDark = isDarkMode;
    const openingImage = openingIsDark
      ? require('./assets/splash-icon-dark.png')
      : require('./assets/splash-icon.png');
    return (
      <SafeAreaView style={[styles.openingContainer, openingIsDark ? styles.openingContainerDark : null]}>
        <View style={[styles.openingCard, openingIsDark ? styles.openingCardDark : null]}>
          <Animated.View style={[styles.openingImageWrap, { opacity: openingPulse }]}>
            <Image source={openingImage} style={styles.openingImage} resizeMode="contain" />
          </Animated.View>
          <Text style={[styles.openingTitle, openingIsDark ? styles.openingTitleDark : null]}>OJT Tracker</Text>
          <Text style={[styles.openingSubtitle, openingIsDark ? styles.openingSubtitleDark : null]}>
            Preparing your offline records...
          </Text>
          <View style={[styles.openingProgressTrack, openingIsDark ? styles.openingProgressTrackDark : null]}>
            <Animated.View
              style={[
                styles.openingProgressFill,
                { transform: [{ scaleX: openingPulse }] },
                openingIsDark ? styles.openingProgressFillDark : null,
              ]}
            />
          </View>
          <ActivityIndicator size="small" color={openingIsDark ? '#00c896' : '#1f6feb'} />
        </View>
      </SafeAreaView>
    );
  }

  const isWideLayout = width >= 900;
  const completedHours = (completedProgressMs / (60 * 60 * 1000)).toFixed(1);
  const remainingHours = (progress.remainingMs / (60 * 60 * 1000)).toFixed(1);
  const ringSize = 140;
  const ringStroke = 10;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const animatedRingOffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [ringCircumference, 0],
    extrapolate: 'clamp',
  });
  const animatedLinearWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });
  const ringTrackColor = isDarkMode ? '#1a202c' : '#dbe3ef';
  const ringActiveColor = isDarkMode ? '#00c896' : '#00b58a';
  const themedCard = [styles.card, !isDarkMode && styles.cardLight];
  const themedLabel = [styles.label, !isDarkMode && styles.labelLight];
  const themedSubValue = [styles.subValue, !isDarkMode && styles.subValueLight];
  const themedPanelSubText = [styles.panelSubText, !isDarkMode && styles.panelSubTextLight];
  const themedDatePickerButton = [styles.datePickerButton, !isDarkMode && styles.datePickerButtonLight];
  const themedDatePickerText = [styles.datePickerText, !isDarkMode && styles.datePickerTextLight];
  const themedInput = [styles.input, !isDarkMode && styles.inputLight];
  const themedLoadingOverlay = [styles.loadingOverlay, isDarkMode ? styles.loadingOverlayDark : null];
  const themedLoadingCard = [styles.loadingCard, isDarkMode ? styles.loadingCardDark : null];
  const themedLoadingText = [styles.loadingText, isDarkMode ? styles.loadingTextDark : null];
  const loadingIndicatorColor = isDarkMode ? '#00c896' : '#1f6feb';
  const busyMessage = savingEntry
    ? 'Saving entry...'
    : savingEditEntry
      ? 'Updating entry...'
      : deletingEntry
          ? 'Deleting entry...'
          : savingSettings
            ? 'Saving settings...'
            : savingBackup
              ? 'Exporting backup...'
              : restoringBackup
                ? 'Restoring backup...'
            : '';

  return (
    <Animated.View style={{ flex: 1, opacity: contentFade }}>
      <SafeAreaView style={[styles.container, !isDarkMode && styles.containerLight]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <Text style={[styles.heading, !isDarkMode && styles.headingLight]}>OJT Progress</Text>
          <Pressable
            style={({ pressed }) => [styles.themeToggleButton, pressed ? styles.pressedControl : null]}
            onPress={onToggleDarkMode}
            accessibilityLabel="Toggle dark mode"
          >
            <Ionicons name={isDarkMode ? 'sunny-outline' : 'moon-outline'} size={16} color="#ffffff" />
            <Text style={styles.themeToggleText}>{isDarkMode ? 'Light' : 'Dark'} mode</Text>
          </Pressable>
        </View>
        <Text style={[styles.subtitle, !isDarkMode && styles.subtitleLight]}>Overall completion status</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={[styles.dashboardGrid, isWideLayout ? styles.dashboardGridWide : null]}>
          <View style={[...themedCard, styles.progressPanel]}>
          <View style={styles.labelRow}>
            <Text style={themedLabel}>OJT Progress</Text>
          </View>
            <Text style={themedPanelSubText}>Overall completion status</Text>

            <View style={styles.ringWrap}>
              <Svg width={ringSize} height={ringSize} style={styles.ringSvg}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={ringTrackColor}
                  strokeWidth={ringStroke}
                  fill="transparent"
                />
                <AnimatedCircle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  stroke={ringActiveColor}
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={`${ringCircumference} ${ringCircumference}`}
                  strokeDashoffset={animatedRingOffset}
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={[styles.ringPercent, !isDarkMode && styles.ringPercentLight]}>
                  {progress.percentComplete}%
                </Text>
                <Text style={[styles.ringMeta, !isDarkMode && styles.ringMetaLight]}>
                  {completedHours} / {requiredHours}h
                </Text>
              </View>
            </View>

            <View style={styles.progressHeadRow}>
              <Text style={[styles.progressLabel, !isDarkMode && styles.progressLabelLight]}>Linear Progress</Text>
              <Text style={styles.progressRemaining}>{remainingHours}h remaining</Text>
            </View>
            <View style={[styles.progressTrack, !isDarkMode && styles.progressTrackLight]}>
              <Animated.View style={[styles.progressFill, { width: animatedLinearWidth }]} />
            </View>
            <Text style={[styles.progressFootNote, !isDarkMode && styles.progressFootNoteLight]}>
              All-time rendered: {formatHoursAndMinutes(totalDurationMs)}
            </Text>

            <View style={styles.sectionDivider} />
            <Text style={[styles.targetLabel, !isDarkMode && styles.targetLabelLight]}>TARGET REQUIREMENT</Text>
            <TextInput
              style={themedInput}
              keyboardType="decimal-pad"
              value={requiredHoursInput}
              onChangeText={setRequiredHoursInput}
              placeholder="500"
              placeholderTextColor="#6b7280"
              editable={isEditingRequiredHours}
            />
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.settingsButton,
                savingSettings || (hasRequiredHoursSetting && !isEditingRequiredHours)
                  ? styles.disabledButton
                  : null,
                pressed && !(savingSettings || (hasRequiredHoursSetting && !isEditingRequiredHours))
                  ? styles.pressedControl
                  : null,
              ]}
              onPress={onSaveRequiredHours}
              disabled={savingSettings || (hasRequiredHoursSetting && !isEditingRequiredHours)}
              accessibilityLabel="Save required OJT hours"
            >
              <View style={styles.buttonInline}>
                <Ionicons name={savingSettings ? 'sync-outline' : 'checkmark-done-outline'} size={16} color="#ffffff" />
                <Text style={styles.buttonText}>
                  {savingSettings
                    ? 'Saving...'
                    : hasRequiredHoursSetting && !isEditingRequiredHours
                      ? 'Saved'
                      : 'Save target'}
                </Text>
              </View>
            </Pressable>
            {hasRequiredHoursSetting && !isEditingRequiredHours ? (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.editRequiredHoursButton,
                  pressed ? styles.pressedControl : null,
                ]}
                onPress={onEditRequiredHours}
                accessibilityLabel="Edit required OJT hours"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name="create-outline" size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>Edit target</Text>
                </View>
              </Pressable>
            ) : null}

            <View style={styles.sectionDivider} />
            <Text style={[styles.targetLabel, !isDarkMode && styles.targetLabelLight]}>BACKUP & RESTORE</Text>
            <Text style={[styles.backupHint, !isDarkMode && styles.backupHintLight]}>
              Last backup: {lastBackupAt ? new Date(lastBackupAt).toLocaleString() : 'none yet'}
            </Text>
            <View style={styles.entryActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.entryActionButton,
                  styles.backupActionButton,
                  savingBackup || restoringBackup ? styles.disabledButton : null,
                  pressed && !(savingBackup || restoringBackup) ? styles.pressedControl : null,
                ]}
                onPress={onExportBackup}
                disabled={savingBackup || restoringBackup}
                accessibilityLabel="Export JSON backup"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name={savingBackup ? 'sync-outline' : 'download-outline'} size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>{savingBackup ? 'Exporting...' : 'Export backup'}</Text>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.entryActionButton,
                  styles.restoreActionButton,
                  restoringBackup || savingBackup ? styles.disabledButton : null,
                  pressed && !(restoringBackup || savingBackup) ? styles.pressedControl : null,
                ]}
                onPress={onRequestRestoreBackup}
                disabled={restoringBackup || savingBackup}
                accessibilityLabel="Restore latest backup"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name={restoringBackup ? 'sync-outline' : 'refresh-outline'} size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>{restoringBackup ? 'Restoring...' : 'Restore backup'}</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={[...themedCard, styles.entryPanel]}>
          <View style={styles.labelRow}>
            <Text style={themedLabel}>Record Time Entry</Text>
          </View>
            <Text style={themedPanelSubText}>Log your daily hours and activities here.</Text>

            <View style={[styles.entryInnerPanel, !isDarkMode && styles.entryInnerPanelLight]}>
              <Text style={themedSubValue}>Date</Text>
              <Pressable
                style={({ pressed }) => [...themedDatePickerButton, pressed ? styles.pressedControl : null]}
                onPress={() => setShowDatePicker(true)}
                accessibilityLabel="Select log date"
              >
                <Text style={themedDatePickerText}>{formatLongDate(selectedDate)}</Text>
              </Pressable>
              {showDatePicker ? (
                <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />
              ) : null}
              {showTimePicker ? (
                <DateTimePicker
                  value={timePickerValue}
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={onTimeChange}
                />
              ) : null}

              <SessionTimeFields
                values={{ amIn, amOut, pmIn, pmOut }}
                onOpenTimePicker={openTimePicker}
                onClearAm={clearAmSession}
                onClearPm={clearPmSession}
                isDarkMode={isDarkMode}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.saveButton,
                  savingEntry || hasEntryForSelectedDate ? styles.disabledButton : null,
                  pressed && !(savingEntry || hasEntryForSelectedDate) ? styles.pressedControl : null,
                ]}
                onPress={onSaveEntry}
                disabled={savingEntry || hasEntryForSelectedDate}
                accessibilityLabel="Save daily entry"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name={savingEntry ? 'sync-outline' : 'save-outline'} size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>
                    {savingEntry
                      ? 'Saving...'
                      : hasEntryForSelectedDate
                        ? 'Already added'
                        : 'Add Time Entry'}
                  </Text>
                </View>
              </Pressable>
              {hasEntryForSelectedDate ? (
                <View style={styles.infoBanner}>
                  <Text style={styles.infoText}>This date is already in logs. Use Edit below to update it.</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={themedCard}>
          <View style={styles.labelRow}>
            <Ionicons name="list-outline" size={16} color="#5e6a73" />
            <Text style={themedLabel}>Recent entries</Text>
          </View>
          {recentEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No entries yet</Text>
              <Text style={styles.emptyStateText}>
                Save your first daily log above. Your recent entries will appear here.
              </Text>
            </View>
          ) : (
            recentEntries.map((entry) => (
              <View key={entry.dateKey} style={[styles.entryItem, !isDarkMode && styles.entryItemLight]}>
                <Text style={[styles.entryDate, !isDarkMode && styles.entryDateLight]}>
                  {formatLongDate(dateFromKey(entry.dateKey))}
                </Text>
                <View style={styles.sessionLine}>
                  <Text style={[styles.sessionLabel, !isDarkMode && styles.sessionLabelLight]}>AM</Text>
                  <Text style={[styles.sessionValue, !isDarkMode && styles.sessionValueLight]}>
                    {entry.amIn && entry.amOut
                      ? `${formatDisplayTime(entry.dateKey, entry.amIn)} - ${formatDisplayTime(entry.dateKey, entry.amOut)}`
                      : '—'}
                  </Text>
                </View>
                <View style={styles.sessionLine}>
                  <Text style={[styles.sessionLabel, !isDarkMode && styles.sessionLabelLight]}>PM</Text>
                  <Text style={[styles.sessionValue, !isDarkMode && styles.sessionValueLight]}>
                    {entry.pmIn && entry.pmOut
                      ? `${formatDisplayTime(entry.dateKey, entry.pmIn)} - ${formatDisplayTime(entry.dateKey, entry.pmOut)}`
                      : '—'}
                  </Text>
                </View>
                <View style={styles.entryActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.entryActionButton,
                      styles.editActionButton,
                      pressed ? styles.pressedControl : null,
                    ]}
                    onPress={() => onEditEntry(entry)}
                    accessibilityLabel={`Edit entry for ${formatLongDate(dateFromKey(entry.dateKey))}`}
                  >
                    <View style={styles.buttonInline}>
                      <Ionicons name="create-outline" size={16} color="#ffffff" />
                      <Text style={styles.buttonText}>Edit</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.entryActionButton,
                      styles.deleteActionButton,
                      deletingEntry ? styles.disabledButton : null,
                      pressed && !deletingEntry ? styles.pressedControl : null,
                    ]}
                    onPress={() => onDeleteEntry(entry)}
                    disabled={deletingEntry}
                    accessibilityLabel={`Delete entry for ${formatLongDate(dateFromKey(entry.dateKey))}`}
                  >
                    <View style={styles.buttonInline}>
                      <Ionicons name={deletingEntry ? 'sync-outline' : 'trash-outline'} size={16} color="#ffffff" />
                      <Text style={styles.buttonText}>{deletingEntry ? 'Deleting...' : 'Delete'}</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            ))
          )}
          {totalEntries > 0 ? (
            <View style={styles.paginationRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.paginationButton,
                  !canGoPreviousEntriesPage ? styles.disabledButton : null,
                  pressed && canGoPreviousEntriesPage ? styles.pressedControl : null,
                ]}
                onPress={() => setEntriesPage((previous) => Math.max(0, previous - 1))}
                disabled={!canGoPreviousEntriesPage}
                accessibilityLabel="Go to previous log page"
              >
                <Ionicons name="chevron-back" size={16} color="#ffffff" />
                <Text style={styles.paginationButtonText}>Previous</Text>
              </Pressable>
              <Text style={[styles.paginationText, !isDarkMode && styles.paginationTextLight]}>
                Page {entriesPage + 1} of {totalEntryPages}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.paginationButton,
                  !canGoNextEntriesPage ? styles.disabledButton : null,
                  pressed && canGoNextEntriesPage ? styles.pressedControl : null,
                ]}
                onPress={() => setEntriesPage((previous) => previous + 1)}
                disabled={!canGoNextEntriesPage}
                accessibilityLabel="Go to next log page"
              >
                <Text style={styles.paginationButtonText}>Next</Text>
                <Ionicons name="chevron-forward" size={16} color="#ffffff" />
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={onCloseEditModal}>
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={onCloseEditModal}
            accessibilityLabel="Close edit entry modal"
          />
          <View style={[styles.modalCard, isDarkMode ? styles.modalCardDark : null]}>
            <View style={[styles.modalHandle, isDarkMode ? styles.modalHandleDark : null]} />
            <View style={styles.modalHeaderRow}>
              <View style={styles.buttonInline}>
                <Ionicons name="create-outline" size={18} color={isDarkMode ? '#f8fafc' : '#1e252b'} />
                <Text style={[styles.modalTitle, isDarkMode ? styles.modalTitleDark : null]}>Edit entry</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  isDarkMode ? styles.modalCloseButtonDark : null,
                  pressed ? styles.pressedControl : null,
                ]}
                onPress={onCloseEditModal}
                accessibilityLabel="Close edit modal"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name="close-outline" size={16} color={isDarkMode ? '#e5e7eb' : '#334155'} />
                  <Text style={[styles.modalCloseText, isDarkMode ? styles.modalCloseTextDark : null]}>Close</Text>
                </View>
              </Pressable>
            </View>
            <Text style={[styles.modalHint, isDarkMode ? styles.modalHintDark : null]}>
              Update this log and tap Save changes.
            </Text>
            <View style={[styles.editingDateChip, isDarkMode ? styles.editingDateChipDark : null]}>
              <Text style={[styles.editingDateChipText, isDarkMode ? styles.editingDateChipTextDark : null]}>
                Editing {formatLongDate(editSelectedDate)}
              </Text>
            </View>
            <Text style={themedSubValue}>Date</Text>
            <Pressable
              style={({ pressed }) => [...themedDatePickerButton, pressed ? styles.pressedControl : null]}
              onPress={() => setEditShowDatePicker(true)}
              accessibilityLabel="Select edit date"
            >
              <Text style={themedDatePickerText}>{formatLongDate(editSelectedDate)}</Text>
            </Pressable>
            {editShowDatePicker ? (
              <DateTimePicker value={editSelectedDate} mode="date" display="default" onChange={onEditDateChange} />
            ) : null}
            {editShowTimePicker ? (
              <DateTimePicker
                value={editTimePickerValue}
                mode="time"
                display="default"
                is24Hour={false}
                onChange={onEditTimeChange}
              />
            ) : null}

            <SessionTimeFields
              values={{ amIn: editAmIn, amOut: editAmOut, pmIn: editPmIn, pmOut: editPmOut }}
              onOpenTimePicker={openEditTimePicker}
              onClearAm={clearEditAmSession}
              onClearPm={clearEditPmSession}
              isDarkMode={isDarkMode}
            />

            <View style={styles.entryActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.entryActionButton,
                  styles.editActionButton,
                  savingEditEntry ? styles.disabledButton : null,
                  pressed && !savingEditEntry ? styles.pressedControl : null,
                ]}
                onPress={onSaveEditEntry}
                disabled={savingEditEntry}
                accessibilityLabel="Save edited entry"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name={savingEditEntry ? 'sync-outline' : 'save-outline'} size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>{savingEditEntry ? 'Saving...' : 'Save changes'}</Text>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.entryActionButton,
                  styles.cancelEditButton,
                  pressed ? styles.pressedControl : null,
                ]}
                onPress={onCloseEditModal}
                accessibilityLabel="Cancel editing entry"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name="close-circle-outline" size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>Cancel</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteConfirmVisible} transparent animationType="fade" onRequestClose={onCancelDeleteEntry}>
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={onCancelDeleteEntry}
            disabled={deletingEntry}
            accessibilityLabel="Close delete confirmation"
          />
          <View style={[styles.modalCard, isDarkMode ? styles.modalCardDark : null]}>
            <View style={[styles.deleteWarningIconWrap, isDarkMode ? styles.deleteWarningIconWrapDark : null]}>
              <Ionicons name="trash-outline" size={24} color="#d9483b" />
            </View>
            <Text style={[styles.modalTitle, isDarkMode ? styles.modalTitleDark : null]}>Delete entry?</Text>
            <Text style={[styles.deleteConfirmText, isDarkMode ? styles.deleteConfirmTextDark : null]}>
              {entryPendingDelete ? formatLongDate(dateFromKey(entryPendingDelete.dateKey)) : ''}
            </Text>
            <Text style={[styles.modalHint, isDarkMode ? styles.modalHintDark : null]}>This action cannot be undone.</Text>

            <View style={styles.entryActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.entryActionButton,
                  styles.cancelEditButton,
                  pressed && !deletingEntry ? styles.pressedControl : null,
                ]}
                onPress={onCancelDeleteEntry}
                disabled={deletingEntry}
                accessibilityLabel="Cancel delete"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name="close-circle-outline" size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>Cancel</Text>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.entryActionButton,
                  styles.deleteActionButton,
                  deletingEntry ? styles.disabledButton : null,
                  pressed && !deletingEntry ? styles.pressedControl : null,
                ]}
                onPress={onConfirmDeleteEntry}
                disabled={deletingEntry || !entryPendingDelete}
                accessibilityLabel="Confirm delete entry"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name={deletingEntry ? 'sync-outline' : 'trash-outline'} size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>{deletingEntry ? 'Deleting...' : 'Delete entry'}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={restoreConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={onCancelRestoreBackup}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={onCancelRestoreBackup}
            disabled={restoringBackup}
            accessibilityLabel="Close restore confirmation"
          />
          <View style={[styles.modalCard, isDarkMode ? styles.modalCardDark : null]}>
            <View style={[styles.deleteWarningIconWrap, isDarkMode ? styles.deleteWarningIconWrapDark : null]}>
              <Ionicons name="cloud-download-outline" size={24} color="#1f6feb" />
            </View>
            <Text style={[styles.modalTitle, isDarkMode ? styles.modalTitleDark : null]}>Restore latest backup?</Text>
            <Text style={[styles.modalHint, isDarkMode ? styles.modalHintDark : null]}>
              The app will create a snapshot first, then replace current records with the latest JSON backup.
            </Text>
            <View style={styles.entryActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.entryActionButton,
                  styles.cancelEditButton,
                  pressed && !restoringBackup ? styles.pressedControl : null,
                ]}
                onPress={onCancelRestoreBackup}
                disabled={restoringBackup}
                accessibilityLabel="Cancel restore backup"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name="close-circle-outline" size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>Cancel</Text>
                </View>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.entryActionButton,
                  styles.restoreActionButton,
                  restoringBackup ? styles.disabledButton : null,
                  pressed && !restoringBackup ? styles.pressedControl : null,
                ]}
                onPress={onConfirmRestoreBackup}
                disabled={restoringBackup}
                accessibilityLabel="Confirm restore backup"
              >
                <View style={styles.buttonInline}>
                  <Ionicons name={restoringBackup ? 'sync-outline' : 'refresh-outline'} size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>{restoringBackup ? 'Restoring...' : 'Restore now'}</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {busyMessage ? (
        <View style={themedLoadingOverlay}>
          <View style={themedLoadingCard}>
            <ActivityIndicator size="small" color={loadingIndicatorColor} />
            <Text style={themedLoadingText}>{busyMessage}</Text>
          </View>
        </View>
      ) : null}

      {toastMessage ? (
        <View style={styles.toastWrap} pointerEvents="none">
          <View style={[styles.toast, toastType === 'error' ? styles.toastError : styles.toastSuccess]}>
            <View style={styles.buttonInline}>
              <Ionicons
                name={toastType === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                size={16}
                color="#ffffff"
              />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          </View>
        </View>
      ) : null}

        <StatusBar style="auto" />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070a12' },
  containerLight: { backgroundColor: '#eef2f7' },
  content: { padding: 20, gap: 12, paddingBottom: 28, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: { fontSize: 32, fontWeight: '800', color: '#f8fafc' },
  headingLight: { color: '#0f172a' },
  subtitle: { marginTop: -2, marginBottom: 6, fontSize: 14, color: '#9ca3af' },
  subtitleLight: { color: '#475467' },
  themeToggleButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  themeToggleText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  dashboardGrid: { gap: 12 },
  dashboardGridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  card: {
    backgroundColor: '#11141c',
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1f2430',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardLight: { backgroundColor: '#ffffff', borderColor: '#d9e0e8' },
  progressPanel: { flex: 1 },
  entryPanel: { flex: 1.45 },
  entryInnerPanel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#2a2f3b',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    marginTop: 8,
  },
  entryInnerPanelLight: { borderColor: '#d9e0e8', backgroundColor: '#f8fafc' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 18, color: '#f8fafc', fontWeight: '700' },
  labelLight: { color: '#111827' },
  panelSubText: { fontSize: 14, color: '#9ca3af', marginBottom: 2 },
  panelSubTextLight: { color: '#5e6a73' },
  value: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
  subValue: { fontSize: 14, color: '#cbd5e1' },
  subValueLight: { color: '#364049' },
  ringWrap: {
    marginTop: 14,
    marginBottom: 10,
    width: 160,
    height: 160,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSvg: { position: 'absolute' },
  ringBase: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 10,
    borderColor: '#1a202c',
  },
  ringBaseLight: {
    borderColor: '#dbe3ef',
  },
  ringArc: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 10,
    borderColor: '#00c896',
    borderRightColor: '#1a202c',
    borderBottomColor: '#1a202c',
  },
  ringArcLight: {
    borderColor: '#00b58a',
    borderRightColor: '#dbe3ef',
    borderBottomColor: '#dbe3ef',
  },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringPercent: { fontSize: 44, fontWeight: '800', color: '#f8fafc' },
  ringPercentLight: { color: '#0f172a' },
  ringMeta: { fontSize: 13, color: '#cbd5e1' },
  ringMetaLight: { color: '#475467' },
  progressHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  progressLabel: { color: '#cbd5e1', fontSize: 14 },
  progressLabelLight: { color: '#4b5563' },
  progressRemaining: { color: '#00c896', fontSize: 14, fontWeight: '700' },
  progressFootNote: { color: '#9ca3af', fontSize: 13, marginTop: 6 },
  progressFootNoteLight: { color: '#6b7280' },
  sectionDivider: { borderTopWidth: 1, borderTopColor: '#232938', marginTop: 10, marginBottom: 10 },
  targetLabel: { color: '#6b7280', fontSize: 12, letterSpacing: 1, fontWeight: '700' },
  targetLabelLight: { color: '#6b7280' },
  statRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e6eaee',
  },
  buttonInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 12, color: '#5e6a73', marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1e252b' },
  inputGrid: { flexDirection: 'row', gap: 10 },
  gridCol: { flex: 1 },
  sessionBlock: { marginTop: 6, gap: 6 },
  sessionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  sessionHeading: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  sessionHeadingLight: { color: '#1f2937' },
  timeHint: { fontSize: 12, color: '#778197', marginTop: 5 },
  timeHintLight: { color: '#667085' },
  clearLinkButton: { alignSelf: 'flex-start', paddingVertical: 2 },
  clearLinkText: { fontSize: 12, color: '#6fb4ff', fontWeight: '600' },
  button: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 12, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  saveButton: { backgroundColor: '#00c896', marginTop: 8 },
  clearSessionButton: { backgroundColor: '#6b7280', marginTop: 8 },
  cancelEditButton: { backgroundColor: '#4b5563', marginTop: 8 },
  settingsButton: { backgroundColor: '#0ea5e9', marginTop: 8 },
  editRequiredHoursButton: { backgroundColor: '#334155', marginTop: 8 },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#123430',
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 4,
  },
  progressTrackLight: { backgroundColor: '#d1f7ea' },
  progressFill: {
    height: '100%',
    backgroundColor: '#00c896',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#353b47',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1b212d',
    marginTop: 6,
  },
  datePickerButtonLight: { borderColor: '#c9d1d9', backgroundColor: '#ffffff' },
  datePickerText: {
    fontSize: 16,
    color: '#f8fafc',
  },
  datePickerTextLight: { color: '#1e252b' },
  timePickerButton: {
    borderWidth: 1,
    borderColor: '#353b47',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1b212d',
    marginTop: 6,
  },
  timePickerButtonLight: { borderColor: '#c9d1d9', backgroundColor: '#ffffff' },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  paginationRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1f6feb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  paginationButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  paginationText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  paginationTextLight: { color: '#5e6a73' },
  backupHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
    marginBottom: 4,
  },
  backupHintLight: { color: '#5e6a73' },
  entryActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActionButton: {
    backgroundColor: '#0ea5e9',
  },
  backupActionButton: {
    backgroundColor: '#1f6feb',
  },
  restoreActionButton: {
    backgroundColor: '#7c3aed',
  },
  deleteActionButton: {
    backgroundColor: '#d9483b',
  },
  disabledButton: { backgroundColor: '#96a1aa' },
  input: {
    borderWidth: 1,
    borderColor: '#353b47',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#f8fafc',
    backgroundColor: '#1b212d',
    marginTop: 6,
  },
  inputLight: { borderColor: '#c9d1d9', color: '#1e252b', backgroundColor: '#ffffff' },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  pressedControl: { opacity: 0.82 },
  errorText: { color: '#fca5a5', fontSize: 14 },
  infoBanner: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27406f',
    backgroundColor: '#11213a',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoText: { color: '#93c5fd', fontSize: 13 },
  emptyState: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#232938',
    backgroundColor: '#151b26',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  emptyStateTitle: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
  emptyStateText: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  entryItem: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2f3b',
    gap: 6,
    backgroundColor: '#151b26',
    borderRadius: 10,
    marginTop: 6,
  },
  entryItemLight: { borderTopColor: '#e6eaee', backgroundColor: '#f8fafc' },
  entryDate: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
  entryDateLight: { color: '#0f172a' },
  sessionLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionLabel: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    color: '#93c5fd',
    backgroundColor: '#1e2f4a',
    textAlign: 'center',
  },
  sessionLabelLight: { color: '#1f6feb', backgroundColor: '#eaf2ff' },
  sessionValue: { fontSize: 14, color: '#cbd5e1', flexShrink: 1 },
  sessionValueLight: { color: '#364049' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBackdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#d0d7de',
    marginBottom: 4,
  },
  modalHandleDark: { backgroundColor: '#334155' },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCloseButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eef2f7',
  },
  modalCloseButtonDark: { backgroundColor: '#1f2937' },
  modalCloseText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  modalCloseTextDark: { color: '#e5e7eb' },
  modalHint: {
    fontSize: 13,
    color: '#5e6a73',
    marginTop: -2,
  },
  modalHintDark: { color: '#9ca3af' },
  editingDateChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#eaf2ff',
    borderWidth: 1,
    borderColor: '#dbe7ff',
  },
  editingDateChipDark: { backgroundColor: '#1e2f4a', borderColor: '#27406f' },
  editingDateChipText: {
    fontSize: 12,
    color: '#1f4ea3',
    fontWeight: '700',
  },
  editingDateChipTextDark: { color: '#93c5fd' },
  deleteWarningIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#ffe8e6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  deleteWarningIconWrapDark: { backgroundColor: '#3a1c1c' },
  deleteConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e252b',
    textAlign: 'center',
  },
  deleteConfirmTextDark: { color: '#f8fafc' },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    gap: 10,
    maxHeight: '88%',
  },
  modalCardDark: { backgroundColor: '#11141c', borderWidth: 1, borderColor: '#1f2430' },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e252b',
  },
  modalTitleDark: { color: '#f8fafc' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingOverlayDark: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  loadingCard: {
    minWidth: 170,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe7ff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingCardDark: { backgroundColor: '#11141c', borderColor: '#1f2430' },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e252b',
  },
  loadingTextDark: { color: '#f8fafc' },
  openingContainer: {
    flex: 1,
    backgroundColor: '#f7faff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  openingContainerDark: { backgroundColor: '#0b1220' },
  openingCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7ff',
    gap: 8,
  },
  openingCardDark: { backgroundColor: '#11141c', borderColor: '#1f2430' },
  openingImageWrap: {
    width: 112,
    height: 112,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openingImage: {
    width: 106,
    height: 106,
    borderRadius: 20,
  },
  openingTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  openingTitleDark: { color: '#f8fafc' },
  openingSubtitle: {
    fontSize: 13,
    color: '#546173',
    textAlign: 'center',
    marginBottom: 4,
  },
  openingSubtitleDark: { color: '#9ca3af' },
  openingProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#d7e7ff',
    marginBottom: 6,
  },
  openingProgressTrackDark: { backgroundColor: '#1f2937' },
  openingProgressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1f6feb',
  },
  openingProgressFillDark: { backgroundColor: '#00c896' },
  toastWrap: {
    position: 'absolute',
    top: 54,
    right: 12,
    alignItems: 'flex-end',
    maxWidth: '90%',
  },
  toast: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  toastSuccess: {
    backgroundColor: '#1e9b50',
  },
  toastError: {
    backgroundColor: '#d9483b',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

module.exports = App;
