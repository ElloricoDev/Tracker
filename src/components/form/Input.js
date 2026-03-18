/**
 * Neomorphism Input Component
 * Reusable text input with neomorphism inset styling
 */

const React = require('react');
const { TextInput, View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { designTokens } = require('../../theme/tokens');

/**
 * Input component with neomorphism inset styling
 * @param {object} props
 * @param {string} props.value - Input value
 * @param {function} props.onChangeText - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.keyboardType - Keyboard type
 * @param {object} props.style - Additional container styles
 * @param {object} props.inputStyle - Additional input styles
 */
function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  keyboardType = 'default',
  style,
  inputStyle,
  ...rest
}) {
  const { theme, isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  
  const containerStyles = React.useMemo(() => {
    return [
      styles.container,
      style,
    ];
  }, [style]);
  
  const inputContainerStyles = React.useMemo(() => {
    return [
      styles.inputContainer,
      {
        backgroundColor: theme.colors.surface,
        borderColor: isFocused ? theme.colors.primary : theme.colors.border,
      },
      error && {
        borderColor: theme.colors.error,
      },
      disabled && styles.disabled,
    ];
  }, [theme, isFocused, error, disabled]);
  
  const inputStyles = React.useMemo(() => {
    return [
      styles.input,
      {
        color: theme.colors.text,
      },
      inputStyle,
    ];
  }, [theme, inputStyle]);
  
  const labelStyles = React.useMemo(() => {
    return [
      styles.label,
      {
        color: theme.colors.textSecondary,
      },
    ];
  }, [theme]);
  
  const errorStyles = React.useMemo(() => {
    return [
      styles.error,
      {
        color: theme.colors.error,
      },
    ];
  }, [theme]);
  
  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      <View style={inputContainerStyles}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          keyboardType={keyboardType}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={inputStyles}
          {...rest}
        />
      </View>
      {error && <Text style={errorStyles}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: designTokens.spacing.xs,
  },
  inputContainer: {
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 2,
    // Inset shadow effect (simulated with border)
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: -1, // Negative elevation for inset effect on Android
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 48,
  },
  disabled: {
    opacity: designTokens.opacity.disabled,
  },
  error: {
    fontSize: 13,
    marginTop: designTokens.spacing.xs,
  },
});

module.exports = Input;
