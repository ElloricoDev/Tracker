/**
 * Settings Screen Component
 * Displays theme toggle and goal management
 */

const React = require('react');
const { ScrollView, StyleSheet, View, Text } = require('react-native');
const { SafeAreaView } = require('react-native-safe-area-context');
const { useTheme } = require('../../../hooks/useTheme');
const { useToast } = require('../../../hooks/useToast');
const { designTokens } = require('../../../theme/tokens');
const SettingsSection = require('../components/SettingsSection');
const IconButton = require('../../../components/common/IconButton');

/**
 * SettingsScreen component
 * @param {object} props
 * @param {object} props.navigation - Navigation prop
 * @param {object} props.route - Route prop with params
 */
function SettingsScreen({ navigation, route }) {
  const { theme, setThemeMode } = useTheme();
  const { showToast } = useToast();
  const {
    settingsRepository,
    requiredHours: initialRequiredHours,
    onRefresh,
  } = route.params;

  const [requiredHours, setRequiredHours] = React.useState(initialRequiredHours);
  const [requiredHoursInput, setRequiredHoursInput] = React.useState(String(initialRequiredHours));
  const [isEditingRequiredHours, setIsEditingRequiredHours] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);

  React.useEffect(() => {
    setRequiredHours(initialRequiredHours);
    setRequiredHoursInput(String(initialRequiredHours));
  }, [initialRequiredHours]);

  const handleSaveRequiredHours = async () => {
    const parsed = parseFloat(requiredHoursInput);
    if (isNaN(parsed) || parsed < 0) {
      showToast('Please enter a valid number of hours.', 'error');
      return;
    }
    
    setSavingSettings(true);
    try {
      await settingsRepository.setRequiredHours(parsed);
      setRequiredHours(parsed);
      setIsEditingRequiredHours(false);
      await onRefresh();
      showToast('Required hours updated.');
    } catch (error) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
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
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection
          requiredHours={requiredHoursInput}
          onRequiredHoursChange={setRequiredHoursInput}
          isEditing={isEditingRequiredHours}
          onEditToggle={() => setIsEditingRequiredHours(true)}
          onSave={handleSaveRequiredHours}
          saving={savingSettings}
        />
      </ScrollView>
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

module.exports = SettingsScreen;
