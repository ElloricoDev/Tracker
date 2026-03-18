/**
 * Entries List Component
 * Displays paginated list of duty entries
 */

const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const Button = require('../../../components/common/Button');
const SectionCard = require('../../../components/common/SectionCard');
const EmptyState = require('../../../components/common/EmptyState');
const AppIcon = require('../../../components/common/AppIcon');
const EntryItem = require('./EntryItem');

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

  const pageInfoStyles = React.useMemo(() => ({
    color: theme.colors.textSecondary,
    ...styles.pageInfo,
  }), [theme]);
  
  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;
  
  return (
    <SectionCard
      title="Entry History"
      subtitle="Review recent duty records, then edit or delete them when needed."
      icon="entries"
    >
      {entries.length === 0 ? (
        <EmptyState
          title="No entries yet"
          message="Save your first duty record above. Your history will start appearing here right away."
        />
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
                icon={<AppIcon name="previous" size="inline" color={theme.colors.text} />}
                style={styles.pageButton}
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
                icon={<AppIcon name="next" size="inline" color={theme.colors.text} />}
                iconPosition="right"
                style={styles.pageButton}
              >
                Next
              </Button>
            </View>
          )}
        </>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
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
  pageButton: {
    flex: 1,
  },
  pageInfo: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 96,
    textAlign: 'center',
  },
});

module.exports = EntriesList;
