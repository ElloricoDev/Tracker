/**
 * Neomorphism Modal Component
 * Reusable modal wrapper with neomorphism styling
 */

const React = require('react');
const { Modal, View, StyleSheet, Pressable } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { designTokens } = require('../../theme/tokens');

/**
 * Modal component with neomorphism backdrop and card
 * @param {object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {function} props.onClose - Close handler
 * @param {ReactNode} props.children - Modal content
 * @param {object} props.style - Additional modal card styles
 */
function NeoModal({
  visible,
  onClose,
  children,
  style,
}) {
  const { theme, isDarkMode } = useTheme();
  
  const modalCardStyles = React.useMemo(() => {
    return [
      styles.modalCard,
      {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
      style,
    ];
  }, [theme, style]);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={modalCardStyles}>
          <View style={[styles.handle, isDarkMode && { backgroundColor: theme.colors.border }]} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: designTokens.borderRadius.lg,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#d0d7de',
    marginBottom: 8,
  },
});

module.exports = NeoModal;
