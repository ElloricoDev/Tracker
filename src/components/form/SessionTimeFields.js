/**
 * Session Time Fields Component
 * AM/PM session time input fields with clear buttons
 */

const React = require('react');
const { View, Text, StyleSheet, Pressable } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { designTokens } = require('../../theme/tokens');
const TimePickerButton = require('./TimePickerButton');
const { Ionicons } = require('@expo/vector-icons');

/**
 * SessionTimeFields component for AM/PM time entry
 * @param {object} props
 * @param {object} props.values - Time values {amIn, amOut, pmIn, pmOut}
 * @param {function} props.onTimeChange - Handler for time changes (field, value)
 * @param {function} props.onClearAm - Handler to clear AM session
 * @param {function} props.onClearPm - Handler to clear PM session
 * @param {object} props.style - Additional styles
 */
function SessionTimeFields({
  values,
  onTimeChange,
  onClearAm,
  onClearPm,
  style,
}) {
  const { theme, isDarkMode } = useTheme();
  
  const sessionBlockStyles = React.useMemo(() => {
    return [
      styles.sessionBlock,
      {
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: theme.colors.border,
      },
    ];
  }, [theme]);
  
  const headingStyles = React.useMemo(() => {
    return [
      styles.heading,
      {
        color: theme.colors.textSecondary,
      },
    ];
  }, [theme]);
  
  const hintStyles = React.useMemo(() => {
    return [
      styles.hint,
      {
        color: theme.colors.textTertiary,
      },
    ];
  }, [theme]);
  
  return (
    <View style={[styles.container, style]}>
      {/* AM Session */}
      <View style={sessionBlockStyles}>
        <View style={styles.headingRow}>
          <Ionicons name="sunny-outline" size={16} color={theme.colors.icon} />
          <Text style={headingStyles}>Morning Session</Text>
          {onClearAm && (
            <Pressable onPress={onClearAm} style={styles.clearButton}>
              <Text style={[styles.clearText, { color: theme.colors.error }]}>Clear</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <TimePickerButton
              value={values.amIn}
              onChange={(time) => onTimeChange('amIn', time)}
              placeholder="Time In"
            />
            <Text style={hintStyles}>Time In</Text>
          </View>
          <View style={styles.timeField}>
            <TimePickerButton
              value={values.amOut}
              onChange={(time) => onTimeChange('amOut', time)}
              placeholder="Time Out"
            />
            <Text style={hintStyles}>Time Out</Text>
          </View>
        </View>
      </View>
      
      {/* PM Session */}
      <View style={sessionBlockStyles}>
        <View style={styles.headingRow}>
          <Ionicons name="moon-outline" size={16} color={theme.colors.icon} />
          <Text style={headingStyles}>Afternoon Session</Text>
          {onClearPm && (
            <Pressable onPress={onClearPm} style={styles.clearButton}>
              <Text style={[styles.clearText, { color: theme.colors.error }]}>Clear</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <TimePickerButton
              value={values.pmIn}
              onChange={(time) => onTimeChange('pmIn', time)}
              placeholder="Time In"
            />
            <Text style={hintStyles}>Time In</Text>
          </View>
          <View style={styles.timeField}>
            <TimePickerButton
              value={values.pmOut}
              onChange={(time) => onTimeChange('pmOut', time)}
              placeholder="Time Out"
            />
            <Text style={hintStyles}>Time Out</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: designTokens.spacing.md,
  },
  sessionBlock: {
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    gap: designTokens.spacing.md,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTokens.spacing.md,
  },
  timeField: {
    flex: 1,
    minWidth: 140,
    gap: designTokens.spacing.xs,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
  },
});

module.exports = SessionTimeFields;
