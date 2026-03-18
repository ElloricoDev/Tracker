const React = require('react');
const { View, Text, StyleSheet, Pressable } = require('react-native');
const { useTheme } = require('../../../hooks/useTheme');
const { designTokens } = require('../../../theme/tokens');

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCellColors(theme, day) {
  if (!day || day.isFuture) {
    return {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: theme.colors.textTertiary,
    };
  }

  if (day.hasEntry) {
    const opacityByIntensity = {
      1: 0.16,
      2: 0.28,
      3: 0.42,
      4: 0.6,
    };

    return {
      backgroundColor: theme.name === 'dark'
        ? `rgba(125, 166, 255, ${opacityByIntensity[day.intensity] || 0.16})`
        : `rgba(47, 95, 167, ${opacityByIntensity[day.intensity] || 0.16})`,
      borderColor: day.isToday ? theme.colors.primary : theme.colors.borderLight || theme.colors.border,
      color: day.isToday ? theme.colors.primaryLight || theme.colors.primary : theme.colors.text,
    };
  }

  return {
    backgroundColor: theme.colors.surfaceContainerHighest || theme.colors.surfaceContainer,
    borderColor: day.isToday ? theme.colors.warning : theme.colors.borderLight || theme.colors.border,
    color: day.isToday ? theme.colors.warning : theme.colors.textSecondary,
  };
}

function MonthlyAttendanceHeatmap({ calendar, onSelectDate }) {
  const { theme } = useTheme();

  if (!calendar) {
    return null;
  }

  const cells = [
    ...Array.from({ length: calendar.leadingEmptyDays }, (_, index) => ({ key: `empty-${index}`, empty: true })),
    ...calendar.days.map((day) => ({ key: day.dateKey, day })),
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={[styles.monthLabel, { color: theme.colors.text }]}>{calendar.monthLabel}</Text>
        <Text style={[styles.legend, { color: theme.colors.textSecondary }]}>Lighter to stronger = more hours</Text>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={[styles.weekdayLabel, { color: theme.colors.textTertiary }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          if (cell.empty) {
            return <View key={cell.key} style={styles.emptyCell} />;
          }

          const cellColors = getCellColors(theme, cell.day);
          const isSelectable = typeof onSelectDate === 'function' && !cell.day.isFuture;
          const CellComponent = isSelectable ? Pressable : View;

          return (
            <CellComponent
              key={cell.key}
              onPress={isSelectable ? () => onSelectDate(cell.day.dateKey) : undefined}
              accessibilityRole={isSelectable ? 'button' : undefined}
              accessibilityLabel={isSelectable ? `Open entries for ${cell.day.dateKey}` : undefined}
              style={[
                styles.dayCell,
                {
                  backgroundColor: cellColors.backgroundColor,
                  borderColor: cellColors.borderColor,
                },
                isSelectable ? styles.dayCellPressable : null,
              ]}
            >
              <Text style={[styles.dayNumber, { color: cellColors.color }]}>
                {cell.day.dayNumber}
              </Text>
            </CellComponent>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: designTokens.spacing.sm,
  },
  headerRow: {
    gap: 2,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  legend: {
    fontSize: 12,
    lineHeight: 16,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTokens.spacing.xs,
  },
  emptyCell: {
    width: '13%',
    aspectRatio: 1,
  },
  dayCell: {
    width: '13%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellPressable: {
    overflow: 'hidden',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
});

module.exports = MonthlyAttendanceHeatmap;
