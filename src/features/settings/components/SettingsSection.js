/**
 * Settings Section Component
 * Settings for required hours and theme toggle
 */

const React = require('react');
const { View, Text, StyleSheet, Switch } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const Card = require('../../../components/common/Card');
const Input = require('../../../components/form/Input');
const Button = require('../../../components/common/Button');
const { Ionicons } = require('@expo/vector-icons');

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
}) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  const titleStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.title,
  }), [theme]);
  
  const settingLabelStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.settingLabel,
  }), [theme]);
  
  const settingDescStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.settingDesc,
  }), [theme]);
  
  return (
    <Card elevation="medium">
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={18} color={theme.colors.icon} />
        <Text style={titleStyles}>Settings</Text>
      </View>
      
      {/* Theme Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <View style={styles.settingHeader}>
            <Ionicons 
              name={isDarkMode ? 'moon' : 'sunny'} 
              size={16} 
              color={theme.colors.icon} 
            />
            <Text style={settingLabelStyles}>Dark Mode</Text>
          </View>
          <Text style={settingDescStyles}>
            Switch between light and dark theme
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: '#cbd5e1', true: theme.colors.primary }}
          thumbColor="#ffffff"
        />
      </View>
      
      {/* Required Hours */}
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <View style={styles.settingHeader}>
            <Ionicons name="time-outline" size={16} color={theme.colors.icon} />
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
            />
          )}
        </View>
        {!isEditing ? (
          <Button
            variant="secondary"
            size="small"
            onPress={onEditToggle}
            icon={<Ionicons name="create-outline" size={16} color={theme.colors.text} />}
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
            icon={<Ionicons name="checkmark-outline" size={16} color="#ffffff" />}
          >
            Save
          </Button>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: designTokens.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
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
});

module.exports = SettingsSection;
