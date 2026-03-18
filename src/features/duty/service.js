const {
  addDays,
  isValidDateKey,
  isValidTimeValue,
  startOfLocalDay,
  startOfLocalWeekMonday,
  sumEntryDurationMs,
} = require('./time');

function dateKeyFromDate(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfLocalMonth(date) {
  const value = startOfLocalDay(date);
  value.setDate(1);
  return value;
}

function isWeekend(date) {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
}

function isTrackedDay(date) {
  return !isWeekend(date);
}

function nextTrackedStreakDateKey(dateKey) {
  const cursor = new Date(`${dateKey}T12:00:00`);
  do {
    cursor.setDate(cursor.getDate() + 1);
  } while (isWeekend(cursor));

  return dateKeyFromDate(cursor);
}

function getMonthLabel(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function buildMonthCalendar(referenceDate, monthlyEntries) {
  const monthStart = startOfLocalMonth(referenceDate);
  const nextMonthStart = startOfLocalMonth(addDays(monthStart, 32));
  const lastDayOfMonth = addDays(nextMonthStart, -1);
  const daysInMonth = lastDayOfMonth.getDate();
  const entryMap = new Map(
    monthlyEntries.map((entry) => [entry.dateKey, sumEntryDurationMs([entry])])
  );
  const maxDurationMs = monthlyEntries.length > 0 ? Math.max(...entryMap.values()) : 0;

  const leadingEmptyDays = monthStart.getDay();
  const days = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const currentDate = new Date(monthStart);
    currentDate.setDate(day);
    const dateKey = dateKeyFromDate(currentDate);
    const durationMs = entryMap.get(dateKey) || 0;
    const isFuture = currentDate > startOfLocalDay(referenceDate);
    const isToday = dateKey === dateKeyFromDate(referenceDate);
    const intensity =
      durationMs <= 0 || maxDurationMs <= 0
        ? 0
        : Math.max(1, Math.min(4, Math.ceil((durationMs / maxDurationMs) * 4)));

    days.push({
      dateKey,
      dayNumber: day,
      durationMs,
      intensity,
      hasEntry: durationMs > 0,
      isFuture,
      isToday,
    });
  }

  return {
    monthLabel: getMonthLabel(monthStart),
    leadingEmptyDays,
    days,
  };
}

function buildWeeklyTrend(referenceDate, entriesAsc) {
  const weekStart = startOfLocalWeekMonday(referenceDate);
  const bars = [];

  for (let index = 0; index < 7; index += 1) {
    const currentDate = addDays(weekStart, index);
    const dateKey = dateKeyFromDate(currentDate);
    const entry = entriesAsc.find((item) => item.dateKey === dateKey);
    const totalMs = entry ? sumEntryDurationMs([entry]) : 0;

    bars.push({
      key: dateKey,
      label: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
      totalMs,
      targetDateKey: dateKey,
      isToday: dateKey === dateKeyFromDate(referenceDate),
    });
  }

  return bars;
}

function buildMonthlyWeeklyTrend(referenceDate, monthlyEntries) {
  const monthStart = startOfLocalMonth(referenceDate);
  const nextMonthStart = startOfLocalMonth(addDays(monthStart, 32));
  const bars = [];
  let cursor = new Date(monthStart);
  let weekIndex = 1;

  while (cursor < nextMonthStart) {
    const weekStart = new Date(cursor);
    const weekEndExclusive = addDays(weekStart, 7);
    const weeklyEntries = monthlyEntries.filter(
      (entry) => entry.dateKey >= dateKeyFromDate(weekStart) && entry.dateKey < dateKeyFromDate(weekEndExclusive)
    );

    bars.push({
      key: `week-${weekIndex}`,
      label: `W${weekIndex}`,
      totalMs: sumEntryDurationMs(weeklyEntries),
      targetDateKey: dateKeyFromDate(weekStart),
    });

    cursor = weekEndExclusive;
    weekIndex += 1;
  }

  return bars;
}

function getStreaks(entriesSortedAsc) {
  if (entriesSortedAsc.length === 0) {
    return { currentStreakDays: 0, longestStreakDays: 0 };
  }

  let longestStreakDays = 1;
  let runningStreak = 1;

  for (let index = 1; index < entriesSortedAsc.length; index += 1) {
    const previous = entriesSortedAsc[index - 1];
    const current = entriesSortedAsc[index];
    const previousKey = nextTrackedStreakDateKey(previous.dateKey);
    if (current.dateKey === previousKey) {
      runningStreak += 1;
      longestStreakDays = Math.max(longestStreakDays, runningStreak);
    } else if (current.dateKey !== previous.dateKey) {
      runningStreak = 1;
    }
  }

  let currentStreakDays = 1;
  for (let index = entriesSortedAsc.length - 1; index > 0; index -= 1) {
    const current = entriesSortedAsc[index];
    const previous = entriesSortedAsc[index - 1];
    const previousKey = nextTrackedStreakDateKey(previous.dateKey);
    if (current.dateKey === previousKey) {
      currentStreakDays += 1;
    } else if (current.dateKey !== previous.dateKey) {
      break;
    }
  }

  return { currentStreakDays, longestStreakDays };
}

function countTrackedDaysInRangeInclusive(startDate, endDate) {
  const start = startOfLocalDay(startDate);
  const end = startOfLocalDay(endDate);
  let count = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    if (isTrackedDay(cursor)) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

class DutyService {
  constructor(repository, nowProvider) {
    this.repository = repository;
    this.nowProvider = nowProvider || (() => new Date());
  }

  validateEntry(payload) {
    const { dateKey, amIn, amOut, pmIn, pmOut } = payload;

    if (!dateKey) {
      throw new Error('Date is required.');
    }

    if (!isValidDateKey(dateKey)) {
      throw new Error('Date must be in YYYY-MM-DD format.');
    }

    const hasAm = Boolean(amIn || amOut);
    const hasPm = Boolean(pmIn || pmOut);
    if (!hasAm && !hasPm) {
      throw new Error('At least one session (AM or PM) is required.');
    }

    if (hasAm && (!amIn || !amOut)) {
      throw new Error('AM time in and out are both required when AM session is used.');
    }

    if (hasPm && (!pmIn || !pmOut)) {
      throw new Error('PM time in and out are both required when PM session is used.');
    }

    const timesToValidate = [];
    if (hasAm) {
      timesToValidate.push(amIn, amOut);
    }
    if (hasPm) {
      timesToValidate.push(pmIn, pmOut);
    }

    if (!timesToValidate.every(isValidTimeValue)) {
      throw new Error('Time fields must use h:mm AM/PM (12-hour) format.');
    }

    // Validation is completed by computing duration.
    sumEntryDurationMs([{ dateKey, amIn, amOut, pmIn, pmOut }]);
  }

  async saveEntry(payload) {
    this.validateEntry(payload);

    const existing = await this.repository.getEntryByDate(payload.dateKey);
    const nowIso = this.nowProvider().toISOString();
    const entry = {
      dateKey: payload.dateKey,
      amIn: payload.amIn,
      amOut: payload.amOut,
      pmIn: payload.pmIn,
      pmOut: payload.pmOut,
      createdAt: existing ? existing.createdAt : nowIso,
      updatedAt: nowIso,
    };

    await this.repository.upsertEntry(entry);
    return entry;
  }

  async updateEntry(originalDateKey, payload) {
    if (!isValidDateKey(originalDateKey)) {
      throw new Error('Date must be in YYYY-MM-DD format.');
    }

    this.validateEntry(payload);
    const existing = await this.repository.getEntryByDate(originalDateKey);
    if (!existing) {
      throw new Error('Entry not found.');
    }

    const nowIso = this.nowProvider().toISOString();
    if (originalDateKey !== payload.dateKey) {
      const targetExisting = await this.repository.getEntryByDate(payload.dateKey);
      if (targetExisting) {
        throw new Error('An entry already exists for the selected date.');
      }
    }

    const updatedEntry = {
      dateKey: payload.dateKey,
      amIn: payload.amIn,
      amOut: payload.amOut,
      pmIn: payload.pmIn,
      pmOut: payload.pmOut,
      createdAt: existing.createdAt,
      updatedAt: nowIso,
    };

    if (originalDateKey !== payload.dateKey) {
      await this.repository.deleteEntryByDate(originalDateKey);
    }

    await this.repository.upsertEntry(updatedEntry);
    return updatedEntry;
  }

  async getDailyTotalMs(referenceDate) {
    const dayStart = startOfLocalDay(referenceDate || this.nowProvider());
    const startKey = dateKeyFromDate(dayStart);
    const endKey = dateKeyFromDate(addDays(dayStart, 1));
    const entries = await this.repository.listEntriesBetween(startKey, endKey);
    return sumEntryDurationMs(entries);
  }

  async getWeeklyTotalMs(referenceDate) {
    const weekStart = startOfLocalWeekMonday(referenceDate || this.nowProvider());
    const startKey = dateKeyFromDate(weekStart);
    const endKey = dateKeyFromDate(addDays(weekStart, 7));
    const entries = await this.repository.listEntriesBetween(startKey, endKey);
    return sumEntryDurationMs(entries);
  }

  async getTotalDurationMs() {
    const entries = await this.repository.listAllEntries();
    return sumEntryDurationMs(entries);
  }

  async getDashboardInsights(requiredHours = 0, referenceDate) {
    const today = startOfLocalDay(referenceDate || this.nowProvider());
    const monthStart = startOfLocalMonth(today);
    const nextMonthStart = startOfLocalMonth(addDays(monthStart, 32));
    const todayKey = dateKeyFromDate(today);
    const monthStartKey = dateKeyFromDate(monthStart);
    const nextMonthKey = dateKeyFromDate(nextMonthStart);

    const entries = await this.repository.listAllEntries();
    const entriesAsc = [...entries].sort((left, right) => left.dateKey.localeCompare(right.dateKey));
    const monthlyEntries = entriesAsc.filter((entry) => entry.dateKey >= monthStartKey && entry.dateKey < nextMonthKey);
    const trackedMonthlyEntries = monthlyEntries.filter((entry) => isTrackedDay(new Date(`${entry.dateKey}T12:00:00`)));

    const monthlyTotalMs = sumEntryDurationMs(monthlyEntries);
    const monthlyEntryCount = monthlyEntries.length;
    const monthlyAverageMs = monthlyEntryCount > 0 ? Math.floor(monthlyTotalMs / monthlyEntryCount) : 0;
    const elapsedTrackedMonthDays = countTrackedDaysInRangeInclusive(monthStart, today);
    const missedDays = Math.max(0, elapsedTrackedMonthDays - trackedMonthlyEntries.length);

    const totalDurationMs = sumEntryDurationMs(entriesAsc);
    const overallAverageMs = entriesAsc.length > 0 ? Math.floor(totalDurationMs / entriesAsc.length) : 0;
    const remainingMs = Math.max((Number(requiredHours) || 0) * 60 * 60 * 1000 - totalDurationMs, 0);
    const projectedDaysNeeded = overallAverageMs > 0 ? Math.ceil(remainingMs / overallAverageMs) : null;
    const projectedCompletionDateKey =
      remainingMs === 0
        ? todayKey
        : projectedDaysNeeded
          ? dateKeyFromDate(addDays(today, projectedDaysNeeded - 1))
          : null;

    const { currentStreakDays, longestStreakDays } = getStreaks(entriesAsc);
    const monthCalendar = buildMonthCalendar(today, monthlyEntries);
    const weeklyTrend = buildWeeklyTrend(today, entriesAsc);
    const monthlyTrend = buildMonthlyWeeklyTrend(today, monthlyEntries);

    return {
      monthlyTotalMs,
      monthlyEntryCount,
      monthlyAverageMs,
      missedDays,
      currentStreakDays,
      longestStreakDays,
      projectedCompletionDateKey,
      monthCalendar,
      weeklyTrend,
      monthlyTrend,
    };
  }

  async deleteEntry(dateKey) {
    if (!isValidDateKey(dateKey)) {
      throw new Error('Date must be in YYYY-MM-DD format.');
    }

    await this.repository.deleteEntryByDate(dateKey);
  }
}

module.exports = {
  DutyService,
  dateKeyFromDate,
};
