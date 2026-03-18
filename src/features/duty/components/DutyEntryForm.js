/**
 * Duty Entry Form Component
 * Form for creating daily duty time entries
 */

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const Card = require('../../../components/common/Card');
const Button = require('../../../components/common/Button');
const DatePickerButton = require('../../../components/form/DatePickerButton');
const SessionTimeFields = require('../../../components/form/SessionTimeFields');
const { Ionicons } = require('@expo/vector-icons');

/**
 * DutyEntryForm component
 * @param {object} props
 * @param {Date} props.selectedDate - Selected date
 * @param {function} props.onDateChange - Date change handler
 * @param {object} props.sessionValues - Session time values
 * @param {function} props.onTimeChange - Time change handler
 * @param {function} props.onClearAm - Clear AM handler
 * @param {function} props.onClearPm - Clear PM handler
 * @param {function} props.onSubmit - Submit handler
 * @param {boolean} props.loading - Whether form is submitting
 * @param {boolean} props.disabled - Whether form is disabled (entry exists)
 * @param {Array} props.errors - Validation errors
 */
function DutyEntryForm({
  selectedDate,
  onDateChange,
  sessionValues,
  onTimeChange,
  onClearAm,
  onClearPm,
  onSubmit,
  loading,
  disabled,
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
  
  const errorStyles = React.useMemo(() => ({
    color: theme.colors.error,
    ...styles.error,
  }), [theme]);
  
  const infoStyles = React.useMemo(() => ({
    backgroundColor: theme.colors.infoBg,
    borderColor: theme.colors.info,
    ...styles.infoBanner,
  }), [theme]);
  
  const infoTextStyles = React.useMemo(() => ({
    color: theme.colors.info,
    ...styles.infoText,
  }), [theme]);
  
  return (
    <Card elevation="medium">
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={18} color={theme.colors.icon} />
        <Text style={titleStyles}>Daily Entry</Text>
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
      
      <Button
        variant="primary"
        onPress={onSubmit}
        loading={loading}
        disabled={loading || disabled}
        icon={<Ionicons name={loading ? 'sync-outline' : 'save-outline'} size={18} color="#ffffff" />}
      >
        {loading ? 'Saving...' : disabled ? 'Already Added' : 'Add Time Entry'}
      </Button>
      
      {disabled && (
        <View style={infoStyles}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.info} />
          <Text style={infoTextStyles}>
            This date is already in logs. Use Edit below to update it.
          </Text>
        </View>
      )}
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.sm,
    borderWidth: 1,
    marginTop: designTokens.spacing.sm,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
});

module.exports = DutyEntryForm;
