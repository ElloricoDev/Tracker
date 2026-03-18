/**
 * Backup Section Component
 * Backup and restore functionality
 */

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const Card = require('../../../components/common/Card');
const Button = require('../../../components/common/Button');
const { Ionicons } = require('@expo/vector-icons');

/**
 * BackupSection component
 * @param {object} props
 * @param {string} props.lastBackupAt - Last backup timestamp
 * @param {function} props.onExport - Export handler
 * @param {function} props.onRestore - Restore handler
 * @param {boolean} props.exporting - Whether exporting
 * @param {boolean} props.restoring - Whether restoring
 */
function BackupSection({
  lastBackupAt,
  onExport,
  onRestore,
  exporting,
  restoring,
}) {
  const { theme } = useTheme();
  
  const titleStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.title,
  }), [theme]);
  
  const descStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.desc,
  }), [theme]);
  
  const lastBackupStyles = React.useMemo(() => ({
    color: theme.colors.textTertiary,
    ...styles.lastBackup,
  }), [theme]);
  
  return (
    <Card elevation="medium">
      <View style={styles.header}>
        <Ionicons name="cloud-upload-outline" size={18} color={theme.colors.icon} />
        <Text style={titleStyles}>Backup & Restore</Text>
      </View>
      
      <Text style={descStyles}>
        Export your data to a backup file or restore from a previous backup.
      </Text>
      
      {lastBackupAt && (
        <Text style={lastBackupStyles}>
          Last backup: {new Date(lastBackupAt).toLocaleString()}
        </Text>
      )}
      
      <View style={styles.actions}>
        <Button
          variant="primary"
          onPress={onExport}
          loading={exporting}
          disabled={exporting || restoring}
          icon={<Ionicons name="download-outline" size={16} color="#ffffff" />}
          style={styles.button}
        >
          Export Backup
        </Button>
        <Button
          variant="accent"
          onPress={onRestore}
          loading={restoring}
          disabled={exporting || restoring || !lastBackupAt}
          icon={<Ionicons name="refresh-outline" size={16} color="#ffffff" />}
          style={styles.button}
        >
          Restore Backup
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: designTokens.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: designTokens.spacing.sm,
  },
  lastBackup: {
    fontSize: 12,
    marginBottom: designTokens.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
  },
  button: {
    flex: 1,
  },
});

module.exports = BackupSection;
