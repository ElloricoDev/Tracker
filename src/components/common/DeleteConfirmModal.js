/**
 * Delete Confirmation Modal Component
 * Reusable modal for confirming delete actions with neomorphism styling
 */

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { designTokens } = require('../../theme/tokens');
const NeoModal = require('./Modal');
const Button = require('./Button');
const { Ionicons } = require('@expo/vector-icons');

/**
 * DeleteConfirmModal component
 * @param {object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {function} props.onConfirm - Confirm delete handler
 * @param {function} props.onCancel - Cancel handler
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {boolean} props.loading - Whether delete is in progress
 */
function DeleteConfirmModal({
  visible,
  onConfirm,
  onCancel,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  loading = false,
}) {
  const { theme, isDarkMode } = useTheme();
  
  const iconWrapStyles = React.useMemo(() => {
    return [
      styles.iconWrap,
      {
        backgroundColor: isDarkMode ? theme.colors.errorBg : '#fee2e2',
      },
    ];
  }, [theme, isDarkMode]);
  
  const titleStyles = React.useMemo(() => {
    return [
      styles.title,
      {
        color: theme.colors.text,
      },
    ];
  }, [theme]);
  
  const messageStyles = React.useMemo(() => {
    return [
      styles.message,
      {
        color: theme.colors.textSecondary,
      },
    ];
  }, [theme]);
  
  return (
    <NeoModal visible={visible} onClose={onCancel}>
      <View style={styles.content}>
        <View style={iconWrapStyles}>
          <Ionicons name="warning-outline" size={24} color={theme.colors.error} />
        </View>
        
        <Text style={titleStyles}>{title}</Text>
        <Text style={messageStyles}>{message}</Text>
        
        <View style={styles.actions}>
          <Button
            variant="secondary"
            onPress={onCancel}
            disabled={loading}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            style={styles.button}
            icon={<Ionicons name="trash-outline" size={16} color="#ffffff" />}
          >
            Delete
          </Button>
        </View>
      </View>
    </NeoModal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: designTokens.spacing.md,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    width: '100%',
    marginTop: designTokens.spacing.sm,
  },
  button: {
    flex: 1,
  },
});

module.exports = DeleteConfirmModal;
