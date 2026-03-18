/**
 * Edit Entry Modal Component
 * Modal for editing existing duty entries
 */

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const NeoModal = require('../../../components/common/Modal');
const Button = require('../../../components/common/Button');
const DatePickerButton = require('../../../components/form/DatePickerButton');
const SessionTimeFields = require('../../../components/form/SessionTimeFields');
const { Ionicons } = require('@expo/vector-icons');

/**
 * EditEntryModal component
 * @param {object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {function} props.onClose - Close handler
 * @param {Date} props.selectedDate - Selected date
 * @param {function} props.onDateChange - Date change handler
 * @param {object} props.sessionValues - Session time values
 * @param {function} props.onTimeChange - Time change handler
 * @param {function} props.onClearAm - Clear AM handler
 * @param {function} props.onClearPm - Clear PM handler
 * @param {function} props.onSave - Save handler
 * @param {boolean} props.saving - Whether saving
 * @param {Array} props.errors - Validation errors
 */
function EditEntryModal({
  visible,
  onClose,
  selectedDate,
  onDateChange,
  sessionValues,
  onTimeChange,
  onClearAm,
  onClearPm,
  onSave,
  saving,
  errors = [],
}) {
  const { theme } = useTheme();
  
  const titleStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.title,
  }), [theme]);
  
  const labelStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.label,
  }), [theme]);
  
  const hintStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.hint,
  }), [theme]);
  
  const dateChipStyles = React.useMemo(() => ({
    backgroundColor: theme.colors.infoBg,
    borderColor: theme.colors.info,
    ...styles.dateChip,
  }), [theme]);
  
  const dateChipTextStyles = React.useMemo(() => ({
    color: theme.colors.info,
    ...styles.dateChipText,
  }), [theme]);
  
  const errorStyles = React.useMemo(() => ({
    color: theme.colors.error,
    ...styles.error,
  }), [theme]);
  
  return (
    <NeoModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
        <Text style={titleStyles}>Edit Entry</Text>
      </View>
      
      <Text style={hintStyles}>Update this log and tap Save changes.</Text>
      
      <View style={dateChipStyles}>
        <Text style={dateChipTextStyles}>
          Editing {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
      
      <View style={styles.formField}>
        <Text style={labelStyles}>Date</Text>
        <DatePickerButton
          value={selectedDate}
          onChange={onDateChange}
        />
      </View>
      
      <SessionTimeFields
        values={sessionValues}
        onTimeChange={onTimeChange}
        onClearAm={onClearAm}
        onClearPm={onClearPm}
      />
      
      {errors.length > 0 && (
        <View style={styles.errors}>
          {errors.map((error, index) => (
            <Text key={index} style={errorStyles}>• {error}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.actions}>
        <Button
          variant="secondary"
          onPress={onClose}
          disabled={saving}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={onSave}
          loading={saving}
          disabled={saving}
          icon={<Ionicons name="checkmark-outline" size={16} color="#ffffff" />}
          style={styles.button}
        >
          Save Changes
        </Button>
      </View>
    </NeoModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: designTokens.spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    marginBottom: designTokens.spacing.md,
  },
  dateChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: designTokens.spacing.md,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formField: {
    marginBottom: designTokens.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: designTokens.spacing.xs,
  },
  errors: {
    gap: 4,
    marginVertical: designTokens.spacing.sm,
  },
  error: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    marginTop: designTokens.spacing.sm,
  },
  button: {
    flex: 1,
  },
});

module.exports = EditEntryModal;
