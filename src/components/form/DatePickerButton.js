/**
 * Date Picker Button Component
 * Reusable button for selecting date with neomorphism styling
 */

const React = require('react');
const { Pressable, Text, View, StyleSheet } = require('react-native');
const DateTimePicker = require('@react-native-community/datetimepicker').default;
const { useTheme } = require('../../hooks/useTheme');
const { getElevationStyle, designTokens } = require('../../theme/tokens');
const { Ionicons } = require('@expo/vector-icons');

/**
 * DatePickerButton component
 * @param {object} props
 * @param {Date} props.value - Date value
 * @param {function} props.onChange - Change handler (receives Date object)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether picker is disabled
 * @param {object} props.style - Additional styles
 */
function DatePickerButton({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  style,
}) {
  const { theme, isDarkMode } = useTheme();
  const [showPicker, setShowPicker] = React.useState(false);
  
  const buttonStyles = React.useMemo(() => {
    return [
      styles.button,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
      getElevationStyle('low', isDarkMode),
      disabled && styles.disabled,
      style,
    ];
  }, [theme, isDarkMode, disabled, style]);
  
  const textStyles = React.useMemo(() => {
    return [
      styles.text,
      {
        color: value ? theme.colors.text : theme.colors.textTertiary,
      },
    ];
  }, [theme, value]);
  
  const formattedDate = value
    ? value.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : placeholder;
  
  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };
  
  const handlePickerChange = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate && onChange) {
      onChange(selectedDate);
    }
  };
  
  return (
    <View>
      <Pressable
        style={buttonStyles}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Select date"
      >
        <Ionicons name="calendar-outline" size={18} color={theme.colors.icon} />
        <Text style={textStyles}>{formattedDate}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
  disabled: {
    opacity: designTokens.opacity.disabled,
  },
});

module.exports = DatePickerButton;
