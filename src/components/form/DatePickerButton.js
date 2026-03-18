/**
 * Date Picker Button Component
 * Reusable button for selecting date with material styling.
 */

const React = require('react');
const { Platform, Pressable, Text, View, StyleSheet } = require('react-native');
const DateTimePickerModule = require('@react-native-community/datetimepicker');
const DateTimePicker = DateTimePickerModule.default;
const { DateTimePickerAndroid } = DateTimePickerModule;
const { useTheme } = require('../../hooks/useTheme');
const { getElevationStyle, designTokens } = require('../../theme/tokens');
const { Ionicons } = require('@expo/vector-icons');

function normalizePickerDate(date) {
  const normalized = new Date(date || new Date());
  normalized.setHours(12, 0, 0, 0);
  return normalized;
}

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
  const [pickerValue, setPickerValue] = React.useState(normalizePickerDate(value));
  const normalizedValueKey = value
    ? normalizePickerDate(value).toISOString().slice(0, 10)
    : 'empty';

  React.useEffect(() => {
    if (showPicker) {
      return;
    }
    setPickerValue(normalizePickerDate(value));
  }, [normalizedValueKey, showPicker]);
  
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
  
  const formattedDate = value
    ? value.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : placeholder;
  
  const handlePress = () => {
    if (!disabled) {
      setPickerValue(normalizePickerDate(value));
      if (Platform.OS === 'android' && DateTimePickerAndroid) {
        DateTimePickerAndroid.open({
          value: normalizePickerDate(value),
          mode: 'date',
          display: 'calendar',
          onChange: (event, selectedDate) => {
            if (event?.type === 'dismissed') {
              return;
            }

            if (selectedDate && onChange) {
              onChange(normalizePickerDate(selectedDate));
            }
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

    const rawDate = selectedDate || null;

    if (rawDate) {
      const normalizedDate = normalizePickerDate(rawDate);
      setPickerValue(normalizedDate);
      if (onChange) {
        onChange(normalizedDate);
      }
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
      {Platform.OS !== 'android' && showPicker && (
        <DateTimePicker
          value={pickerValue}
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

module.exports = DatePickerButton;
