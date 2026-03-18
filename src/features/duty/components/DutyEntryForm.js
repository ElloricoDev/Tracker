/**
 * Duty Entry Form Component
 * Form for creating daily duty time entries
 */

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const Button = require('../../../components/common/Button');
const SectionCard = require('../../../components/common/SectionCard');
const StatusBanner = require('../../../components/common/StatusBanner');
const AppIcon = require('../../../components/common/AppIcon');
const DatePickerButton = require('../../../components/form/DatePickerButton');
const SessionTimeFields = require('../../../components/form/SessionTimeFields');

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
  
  const labelStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.label,
  }), [theme]);
  
  const errorStyles = React.useMemo(() => ({
    color: theme.colors.error,
    ...styles.error,
  }), [theme]);
  
  return (
    <SectionCard
      title="Duty Entry"
      subtitle="Select a day and log your morning and afternoon sessions."
      icon="date"
    >
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
        icon={<AppIcon name="save" size="action" color="#ffffff" />}
        style={styles.submitButton}
      >
        {loading ? 'Saving...' : disabled ? 'Already Added' : 'Save Entry'}
      </Button>
      
      {disabled && (
        <StatusBanner
          tone="info"
          message="This date already has an entry. Edit it below instead of saving a duplicate."
        />
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
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
    marginTop: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.xs,
  },
  error: {
    fontSize: 13,
  },
  submitButton: {
    marginTop: designTokens.spacing.sm,
  },
});

module.exports = DutyEntryForm;
