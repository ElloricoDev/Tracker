/**
 * Settings Section Component
 * Settings for required hours and theme toggle
 */

const React = require('react');
const { View, Text, StyleSheet, Switch } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const Input = require('../../../components/form/Input');
const Button = require('../../../components/common/Button');
const SectionCard = require('../../../components/common/SectionCard');
const AppIcon = require('../../../components/common/AppIcon');

/**
 * SettingsSection component
 * @param {object} props
 * @param {string} props.requiredHours - Required hours value
 * @param {function} props.onRequiredHoursChange - Required hours change handler
 * @param {boolean} props.isEditing - Whether in edit mode
 * @param {function} props.onEditToggle - Edit mode toggle
 * @param {function} props.onSave - Save handler
 * @param {boolean} props.saving - Whether saving
 */
function SettingsSection({
  requiredHours,
  onRequiredHoursChange,
  isEditing,
  onEditToggle,
  onSave,
  saving,
  onThemeToggle,
}) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const settingLabelStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.settingLabel,
  }), [theme]);
  
  const settingDescStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.settingDesc,
  }), [theme]);
  
  return (
    <SectionCard
      title="Preferences"
      subtitle="Control the app look and the target you are working toward."
      icon="settings"
    >
      
      {/* Theme Toggle */}
      <View style={[styles.settingItem, { borderTopColor: theme.colors.borderLight || theme.colors.border }]}>
        <View style={styles.settingInfo}>
          <View style={styles.settingHeader}>
            <AppIcon name={isDarkMode ? 'themeDark' : 'themeLight'} size="inline" color={theme.colors.icon} />
            <Text style={settingLabelStyles}>Dark Mode</Text>
          </View>
          <Text style={settingDescStyles}>
            Switch between light and dark theme
          </Text>
        </View>
        <Switch
          style={styles.settingSwitchControl}
          value={isDarkMode}
          onValueChange={onThemeToggle || toggleTheme}
          trackColor={{ false: '#cbd5e1', true: theme.colors.primary }}
          thumbColor="#ffffff"
        />
      </View>
      
      {/* Required Hours */}
      <View style={[styles.settingItem, { borderTopColor: theme.colors.borderLight || theme.colors.border }]}>
        <View style={styles.settingInfo}>
          <View style={styles.settingHeader}>
            <AppIcon name="time" size="inline" color={theme.colors.icon} />
            <Text style={settingLabelStyles}>Required OJT Hours</Text>
          </View>
          {!isEditing ? (
            <Text style={settingDescStyles}>{requiredHours} hours</Text>
          ) : (
            <Input
              value={requiredHours}
              onChangeText={onRequiredHoursChange}
              keyboardType="numeric"
              placeholder="Enter required hours"
              style={styles.hoursInput}
            />
          )}
        </View>
        {!isEditing ? (
          <Button
            variant="secondary"
            size="small"
            onPress={onEditToggle}
            icon={<AppIcon name="edit" size="inline" color={theme.colors.text} />}
            style={styles.settingButtonControl}
          >
            Edit
          </Button>
        ) : (
          <Button
            variant="primary"
            size="small"
            onPress={onSave}
            loading={saving}
            disabled={saving}
            icon={<AppIcon name="save" size="inline" color="#ffffff" />}
            style={styles.settingButtonControl}
          >
            Save
          </Button>
        )}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: designTokens.spacing.md,
    borderTopWidth: 1,
    gap: designTokens.spacing.md,
  },
  settingInfo: {
    flex: 1,
    gap: designTokens.spacing.xs,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingSwitchControl: {
    alignSelf: 'center',
  },
  settingButtonControl: {
    alignSelf: 'center',
    minWidth: 92,
  },
  hoursInput: {
    marginTop: designTokens.spacing.xs,
  },
});

module.exports = SettingsSection;
