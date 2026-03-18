const React = require('react');
const { View, StyleSheet } = require('react-native');
const { designTokens } = require('../../theme/tokens');

function ActionRow({
  children,
  stacked = false,
  style,
}) {
  return (
    <View style={[stacked ? styles.column : styles.row, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
  },
  column: {
    flexDirection: 'column',
    gap: designTokens.spacing.sm,
  },
});

module.exports = ActionRow;
