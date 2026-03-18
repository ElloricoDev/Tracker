/**
 * Entry Item Component
 * Displays a single duty entry with edit/delete actions
 */

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const Card = require('../../../components/common/Card');
const Button = require('../../../components/common/Button');
const { Ionicons } = require('@expo/vector-icons');

/**
 * EntryItem component
 * @param {object} props
 * @param {object} props.entry - Entry data
 * @param {function} props.onEdit - Edit handler
 * @param {function} props.onDelete - Delete handler
 * @param {function} props.formatDate - Date formatter
 * @param {function} props.formatTime - Time formatter
 */
const EntryItem = React.memo(function EntryItem({
  entry,
  onEdit,
  onDelete,
  formatDate,
  formatTime,
}) {
  const { theme } = useTheme();
  
  const dateStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.date,
  }), [theme]);
  
  const labelStyles = React.useMemo(() => ({
    color: theme.colors.primary,
    backgroundColor: theme.colors.infoBg,
    ...styles.sessionLabel,
  }), [theme]);
  
  const valueStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.sessionValue,
  }), [theme]);
  
  return (
    <Card elevation="low" style={styles.card}>
      <Text style={dateStyles}>{formatDate(entry.dateKey)}</Text>
      
      <View style={styles.sessionLine}>
        <Text style={labelStyles}>AM</Text>
        <Text style={valueStyles}>
          {entry.amIn && entry.amOut
            ? `${formatTime(entry.dateKey, entry.amIn)} - ${formatTime(entry.dateKey, entry.amOut)}`
            : '—'}
        </Text>
      </View>
      
      <View style={styles.sessionLine}>
        <Text style={labelStyles}>PM</Text>
        <Text style={valueStyles}>
          {entry.pmIn && entry.pmOut
            ? `${formatTime(entry.dateKey, entry.pmIn)} - ${formatTime(entry.dateKey, entry.pmOut)}`
            : '—'}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <Button
          variant="flat"
          size="small"
          onPress={() => onEdit(entry)}
          icon={<Ionicons name="create-outline" size={16} color={theme.colors.primary} />}
          style={styles.actionButton}
        >
          Edit
        </Button>
        <Button
          variant="flat"
          size="small"
          onPress={() => onDelete(entry)}
          icon={<Ionicons name="trash-outline" size={16} color={theme.colors.error} />}
          style={styles.actionButton}
        >
          Delete
        </Button>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: designTokens.spacing.sm,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
  },
  sessionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionLabel: {
    minWidth: 36,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  sessionValue: {
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    marginTop: designTokens.spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});

module.exports = EntryItem;
