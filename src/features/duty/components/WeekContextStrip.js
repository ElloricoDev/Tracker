const React = require('react');
const { View, Text, StyleSheet, Pressable } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');
const IconButton = require('../../../components/common/IconButton');
const AppIcon = require('../../../components/common/AppIcon');

function WeekContextStrip({
  title,
  subtitle,
  weekDays,
  selectedDateKey,
  onSelectWeekDate,
  onPreviousWeek,
  onNextWeek,
  selectedDayStatus,
  formatLongDate,
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceContainer || theme.colors.surface,
          borderColor: theme.colors.borderLight || theme.colors.border,
        },
      ]}
    >
      <View style={styles.copy}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <View style={styles.actions}>
            <IconButton
              size="small"
              variant="flat"
              onPress={onPreviousWeek}
              icon={<AppIcon name="previous" size="inline" color={theme.colors.primary} />}
              accessibilityLabel="Previous week"
            />
            <IconButton
              size="small"
              variant="flat"
              onPress={onNextWeek}
              icon={<AppIcon name="next" size="inline" color={theme.colors.primary} />}
              accessibilityLabel="Next week"
            />
          </View>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      </View>

      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => {
          const isSelected = day.dateKey === selectedDateKey;
          return (
            <Pressable
              key={day.dateKey}
              onPress={() => onSelectWeekDate(day.dateKey)}
              style={[
                styles.weekDayChip,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.surfaceElevated || theme.colors.surface,
                  borderColor: isSelected
                    ? theme.colors.primary
                    : (day.hasEntry ? theme.colors.accent : theme.colors.borderLight || theme.colors.border),
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Open ${formatLongDate(day.dateKey)}`}
            >
              <Text style={[styles.weekDayLabel, { color: isSelected ? theme.colors.textInverse : theme.colors.textSecondary }]}>
                {day.label}
              </Text>
              <Text style={[styles.weekDayNumber, { color: isSelected ? theme.colors.textInverse : theme.colors.text }]}>
                {day.dayNumber}
              </Text>
              <View
                style={[
                  styles.weekDayDot,
                  {
                    backgroundColor: day.hasEntry
                      ? (isSelected ? theme.colors.textInverse : theme.colors.accent)
                      : 'transparent',
                    borderColor: isSelected
                      ? theme.colors.textInverse
                      : theme.colors.borderLight || theme.colors.border,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: selectedDayStatus.tone === 'success' ? theme.colors.successBg : theme.colors.warningBg,
            borderColor: selectedDayStatus.tone === 'success' ? theme.colors.success : theme.colors.warning,
          },
        ]}
      >
        <Text
          style={[
            styles.statusTitle,
            {
              color: selectedDayStatus.tone === 'success' ? theme.colors.success : theme.colors.warning,
            },
          ]}
        >
          {selectedDayStatus.title}
        </Text>
        <Text style={[styles.statusMessage, { color: theme.colors.text }]}>
          {selectedDayStatus.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
  },
  copy: {
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: designTokens.spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  weekDaysRow: {
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
  },
  weekDayChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.md,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 2,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  weekDayDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.md,
    marginTop: designTokens.spacing.xs,
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    gap: 4,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});

module.exports = WeekContextStrip;
