/**
 * Time Picker Button Component
 * Reusable button for selecting time with material styling.
 */

const React = require('react');
const { Platform, Pressable, Text, View, StyleSheet } = require('react-native');
const DateTimePickerModule = require('@react-native-community/datetimepicker');
const DateTimePicker = DateTimePickerModule.default;
const { DateTimePickerAndroid } = DateTimePickerModule;
const { useTheme } = require('../../hooks/useTheme');
const { getElevationStyle, designTokens } = require('../../theme/tokens');
const { parseTimeToMinutes } = require('../../features/duty/time');
const { Ionicons } = require('@expo/vector-icons');

function normalizePickerTime(timeValue) {
  const value = new Date();
  const totalMinutes = parseTimeToMinutes(timeValue || '');

  if (totalMinutes == null) {
    value.setHours(8, 0, 0, 0);
    return value;
  }

  value.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return value;
}

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
  const [pickerValue, setPickerValue] = React.useState(normalizePickerTime(value));

  React.useEffect(() => {
    if (showPicker) {
      return;
    }

    setPickerValue(normalizePickerTime(value));
  }, [value, showPicker]);
  
  const buttonStyles = React.useMemo(() => {
    return [
      styles.button,
      {
        backgroundColor: theme.colors.surfaceContainer || theme.colors.surface,
        borderColor: theme.colors.borderLight || theme.colors.border,
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
      const normalizedTime = normalizePickerTime(value);
      setPickerValue(normalizedTime);

      if (Platform.OS === 'android' && DateTimePickerAndroid) {
        DateTimePickerAndroid.open({
          value: normalizedTime,
          mode: 'time',
          is24Hour: false,
          onChange: (event, selectedDate) => {
            if (event?.type === 'dismissed' || !selectedDate || !onChange) {
              return;
            }

            const hours = selectedDate.getHours();
            const minutes = selectedDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;
            const minutesStr = String(minutes).padStart(2, '0');
            onChange(`${hours12}:${minutesStr} ${ampm}`);
          },
        });
        return;
      }

      setShowPicker(true);
    }
  };
  
  const handlePickerChange = (event, selectedDate) => {
    if (event?.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (selectedDate && onChange) {
      setPickerValue(selectedDate);
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      const minutesStr = String(minutes).padStart(2, '0');
      const timeString = `${hours12}:${minutesStr} ${ampm}`;
      onChange(timeString);
    }

    if (Platform.OS !== 'android') {
      setShowPicker(false);
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
      {Platform.OS !== 'android' && showPicker && (
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: designTokens.sizes.button,
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    flexShrink: 1,
  },
  disabled: {
    opacity: designTokens.opacity.disabled,
  },
});

module.exports = TimePickerButton;
