/**
 * Backup Section Component
 * Backup and restore functionality
 */

const React = require('react');
const { Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const ActionRow = require('../../../components/common/ActionRow');
const Button = require('../../../components/common/Button');
const SectionCard = require('../../../components/common/SectionCard');
const StatusBanner = require('../../../components/common/StatusBanner');
const AppIcon = require('../../../components/common/AppIcon');

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

  const descStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.desc,
  }), [theme]);
  
  const lastBackupStyles = React.useMemo(() => ({
    color: theme.colors.textTertiary,
    ...styles.lastBackup,
  }), [theme]);
  
  return (
    <SectionCard
      title="Backup & Restore"
      subtitle="Protect your local data before device changes or recovery work."
      icon="backup"
    >
      
      <Text style={descStyles}>
        Export your data to a backup file or restore from a previous backup.
      </Text>
      
      {lastBackupAt && (
        <Text style={lastBackupStyles}>
          Last backup: {new Date(lastBackupAt).toLocaleString()}
        </Text>
      )}

      {!lastBackupAt && (
        <StatusBanner
          tone="warning"
          message="No backup has been created yet. Export one now so you have a restore point."
        />
      )}
      
      <ActionRow stacked style={styles.actions}>
        <Button
          variant="primary"
          onPress={onExport}
          loading={exporting}
          disabled={exporting || restoring}
          icon={<AppIcon name="export" size="inline" color="#ffffff" />}
          style={styles.button}
        >
          Export Backup
        </Button>
        <Button
          variant="accent"
          onPress={onRestore}
          loading={restoring}
          disabled={exporting || restoring || !lastBackupAt}
          icon={<AppIcon name="restore" size="inline" color="#ffffff" />}
          style={styles.button}
        >
          Restore Backup
        </Button>
      </ActionRow>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: 'column',
    gap: designTokens.spacing.md,
  },
  button: {
    width: '100%',
  },
});

module.exports = BackupSection;
