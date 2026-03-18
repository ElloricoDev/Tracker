/**
 * Entries List Component
 * Displays paginated list of duty entries
 */

const React = require('react');
const { View, Text, StyleSheet, ScrollView } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const Card = require('../../../components/common/Card');
const Button = require('../../../components/common/Button');
const EntryItem = require('./EntryItem');
const { Ionicons } = require('@expo/vector-icons');

/**
 * EntriesList component
 * @param {object} props
 * @param {Array} props.entries - Array of entries
 * @param {number} props.currentPage - Current page number (0-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {function} props.onPageChange - Page change handler
 * @param {function} props.onEdit - Edit entry handler
 * @param {function} props.onDelete - Delete entry handler
 * @param {function} props.formatDate - Date formatter
 * @param {function} props.formatTime - Time formatter
 */
function EntriesList({
  entries,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  formatDate,
  formatTime,
}) {
  const { theme } = useTheme();
  
  const titleStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.title,
  }), [theme]);
  
  const emptyTitleStyles = React.useMemo(() => ({
    color: theme.colors.text,
    ...styles.emptyTitle,
  }), [theme]);
  
  const emptyTextStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.emptyText,
  }), [theme]);
  
  const pageInfoStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.pageInfo,
  }), [theme]);
  
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;
  
  return (
    <Card elevation="medium">
      <View style={styles.header}>
        <Ionicons name="list-outline" size={18} color={theme.colors.icon} />
        <Text style={titleStyles}>Recent Entries</Text>
      </View>
      
      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color={theme.colors.iconSecondary} />
          <Text style={emptyTitleStyles}>No entries yet</Text>
          <Text style={emptyTextStyles}>
            Save your first daily log above. Your recent entries will appear here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {entries.map((entry) => (
              <EntryItem
                key={entry.dateKey}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))}
          </View>
          
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <Button
                variant="secondary"
                size="small"
                onPress={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                icon={<Ionicons name="chevron-back" size={16} color={theme.colors.text} />}
              >
                Previous
              </Button>
              <Text style={pageInfoStyles}>
                Page {currentPage + 1} of {totalPages}
              </Text>
              <Button
                variant="secondary"
                size="small"
                onPress={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
                icon={<Ionicons name="chevron-forward" size={16} color={theme.colors.text} />}
                iconPosition="right"
              >
                Next
              </Button>
            </View>
          )}
        </>
      )}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xxl,
    gap: designTokens.spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    gap: designTokens.spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '600',
  },
});

module.exports = EntriesList;
