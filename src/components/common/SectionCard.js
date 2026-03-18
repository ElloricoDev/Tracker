const React = require('react');
const { View, Text, StyleSheet } = require('react-native');
const { useTheme } = require('../../hooks/useTheme');
const { designTokens } = require('../../theme/tokens');
const Card = require('./Card');
const IconBadge = require('./IconBadge');

function SectionCard({
  title,
  subtitle,
  icon,
  action = null,
  children,
  contentStyle,
  style,
}) {
  const { theme } = useTheme();

  return (
    <Card
      elevation="low"
      variant="section"
      style={[
        {
          backgroundColor: theme.colors.surfaceElevated,
        },
        style,
      ]}
    >
      {(title || subtitle || icon || action) && (
        <View style={styles.header}>
          <View style={styles.heading}>
            {icon ? <IconBadge icon={icon} /> : null}
            <View style={styles.headerText}>
              {title ? <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text> : null}
              {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
            </View>
          </View>
          {action}
        </View>
      )}
      <View style={contentStyle}>
        {children}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },
  heading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designTokens.spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});

module.exports = SectionCard;
