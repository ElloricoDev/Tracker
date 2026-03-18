/**
 * Time Picker Button Component
 * Reusable button for selecting time with neomorphism styling
 */

const React = require('react');
const { Pressable, Text, View, StyleSheet } = require('react-native');
const DateTimePicker = require('@react-native-community/datetimepicker').default;
const { useTheme } = require('../../hooks/useTheme');
const { getElevationStyle, designTokens } = require('../../theme/tokens');
const { Ionicons } = require('@expo/vector-icons');

/**
 * TimePickerButton component
 * @param {object} props
 * @param {string} props.value - Time value string (e.g., "8:00 AM")
 * @param {function} props.onChange - Change handler (receives formatted time string)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether picker is disabled
 * @param {object} props.style - Additional styles
 */
function TimePickerButton({
  value,
  onChange,
  placeholder = '--:-- --',
  disabled = false,
  style,
}) {
  const { theme, isDarkMode } = useTheme();
  const [showPicker, setShowPicker] = React.useState(false);
  const [pickerValue, setPickerValue] = React.useState(new Date());
  
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
  
  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };
  
  const handlePickerChange = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate && onChange) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      const timeString = `${hours12}:${minutesStr} ${ampm}`;
      onChange(timeString);
    }
  };
  
  return (
    <View>
      <Pressable
        style={buttonStyles}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Select time"
      >
        <Ionicons name="time-outline" size={18} color={theme.colors.icon} />
        <Text style={textStyles}>{value || placeholder}</Text>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          display="default"
          is24Hour={false}
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

module.exports = TimePickerButton;
