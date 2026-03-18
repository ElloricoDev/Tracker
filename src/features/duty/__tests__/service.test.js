const test = require('node:test');
const assert = require('node:assert/strict');
const { DutyService } = require('../service');

function createMemoryRepository(seed) {
  const entries = seed ? [...seed] : [];
  return {
    async getEntryByDate(dateKey) {
      return entries.find((item) => item.dateKey === dateKey) || null;
    },
    async upsertEntry(entry) {
      const index = entries.findIndex((item) => item.dateKey === entry.dateKey);
      if (index >= 0) {
        entries[index] = entry;
      } else {
        entries.push(entry);
      }
    },
    async listEntriesBetween(startKey, endKey) {
      return entries.filter((item) => item.dateKey >= startKey && item.dateKey < endKey);
    },
    async listAllEntries() {
      return [...entries];
    },
    async deleteEntryByDate(dateKey) {
      const index = entries.findIndex((item) => item.dateKey === dateKey);
      if (index >= 0) {
        entries.splice(index, 1);
      }
    },
  };
}

test('saveEntry stores manual AM/PM times', async () => {
  const now = new Date('2026-03-16T10:00:00.000Z');
  const repo = createMemoryRepository();
  const service = new DutyService(repo, () => now);

  const result = await service.saveEntry({
    dateKey: '2026-03-16',
    amIn: '8:00 AM',
    amOut: '12:00 PM',
    pmIn: '1:00 PM',
    pmOut: '5:00 PM',
  });

  assert.equal(result.dateKey, '2026-03-16');
  assert.equal(result.amIn, '8:00 AM');
});

test('saveEntry allows half-day AM-only entry', async () => {
  const service = new DutyService(createMemoryRepository(), () => new Date('2026-03-16T10:00:00.000Z'));
  const result = await service.saveEntry({
    dateKey: '2026-03-16',
    amIn: '8:00 AM',
    amOut: '12:00 PM',
    pmIn: '',
    pmOut: '',
  });
  assert.equal(result.pmIn, '');
});

test('saveEntry rejects partial session values', async () => {
  const service = new DutyService(createMemoryRepository(), () => new Date('2026-03-16T10:00:00.000Z'));
  await assert.rejects(
    () =>
      service.saveEntry({
        dateKey: '2026-03-16',
        amIn: '8:00 AM',
        amOut: '',
        pmIn: '',
        pmOut: '',
      }),
    /AM time in and out/
  );
});

test('saveEntry validates date format', async () => {
  const service = new DutyService(createMemoryRepository(), () => new Date('2026-03-16T10:00:00.000Z'));
  await assert.rejects(
    () =>
      service.saveEntry({
        dateKey: '03-16-2026',
        amIn: '8:00 AM',
        amOut: '12:00 PM',
        pmIn: '1:00 PM',
        pmOut: '5:00 PM',
      }),
    /YYYY-MM-DD/
  );
});

test('daily/weekly/total totals are calculated from entries', async () => {
  const repo = createMemoryRepository([
    {
      dateKey: '2026-03-16',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
    {
      dateKey: '2026-03-17',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '4:00 PM',
      createdAt: '2026-03-17T00:00:00.000Z',
      updatedAt: '2026-03-17T00:00:00.000Z',
    },
  ]);

  const service = new DutyService(repo, () => new Date('2026-03-17T09:00:00.000'));
  const daily = await service.getDailyTotalMs(new Date('2026-03-17T10:00:00.000'));
  const weekly = await service.getWeeklyTotalMs(new Date('2026-03-17T10:00:00.000'));
  const total = await service.getTotalDurationMs();

  assert.equal(daily, 7 * 60 * 60 * 1000);
  assert.equal(weekly, 15 * 60 * 60 * 1000);
  assert.equal(total, 15 * 60 * 60 * 1000);
});

test('deleteEntry removes an existing entry', async () => {
  const repo = createMemoryRepository([
    {
      dateKey: '2026-03-16',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
  ]);
  const service = new DutyService(repo, () => new Date('2026-03-16T09:00:00.000'));

  await service.deleteEntry('2026-03-16');
  const total = await service.getTotalDurationMs();
  assert.equal(total, 0);
});

test('updateEntry edits existing entry and allows date change', async () => {
  const repo = createMemoryRepository([
    {
      dateKey: '2026-03-16',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
  ]);
  const service = new DutyService(repo, () => new Date('2026-03-18T10:00:00.000Z'));

  await service.updateEntry('2026-03-16', {
    dateKey: '2026-03-17',
    amIn: '9:00 AM',
    amOut: '12:00 PM',
    pmIn: '1:00 PM',
    pmOut: '6:00 PM',
  });

  const old = await repo.getEntryByDate('2026-03-16');
  const updated = await repo.getEntryByDate('2026-03-17');
  assert.equal(old, null);
  assert.equal(updated.amIn, '9:00 AM');
});

test('updateEntry rejects moving to date with existing entry', async () => {
  const repo = createMemoryRepository([
    {
      dateKey: '2026-03-16',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
    {
      dateKey: '2026-03-17',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-17T00:00:00.000Z',
      updatedAt: '2026-03-17T00:00:00.000Z',
    },
  ]);
  const service = new DutyService(repo, () => new Date('2026-03-18T10:00:00.000Z'));

  await assert.rejects(
    () =>
      service.updateEntry('2026-03-16', {
        dateKey: '2026-03-17',
        amIn: '9:00 AM',
        amOut: '12:00 PM',
        pmIn: '1:00 PM',
        pmOut: '6:00 PM',
      }),
    /already exists/
  );
});

test('getDashboardInsights returns monthly stats, streaks, and forecast', async () => {
  const repo = createMemoryRepository([
    {
      dateKey: '2026-03-15',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-15T00:00:00.000Z',
      updatedAt: '2026-03-15T00:00:00.000Z',
    },
    {
      dateKey: '2026-03-16',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
    {
      dateKey: '2026-03-18',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-18T00:00:00.000Z',
      updatedAt: '2026-03-18T00:00:00.000Z',
    },
  ]);
  const service = new DutyService(repo, () => new Date('2026-03-19T09:00:00.000'));

  const insights = await service.getDashboardInsights(40, new Date('2026-03-19T09:00:00.000'));

  assert.equal(insights.monthlyTotalMs, 24 * 60 * 60 * 1000);
  assert.equal(insights.monthlyEntryCount, 3);
  assert.equal(insights.monthlyAverageMs, 8 * 60 * 60 * 1000);
  assert.equal(insights.missedDays, 12);
  assert.equal(insights.currentStreakDays, 1);
  assert.equal(insights.longestStreakDays, 2);
  assert.equal(insights.projectedCompletionDateKey, '2026-03-20');
  assert.equal(insights.monthCalendar.monthLabel, 'March 2026');
  assert.equal(insights.monthCalendar.leadingEmptyDays, 0);
  assert.equal(insights.monthCalendar.days.length, 31);
  assert.equal(insights.monthCalendar.days[14].hasEntry, true);
  assert.equal(insights.monthCalendar.days[19].isFuture, true);
  assert.equal(insights.weeklyTrend.length, 7);
  assert.equal(insights.weeklyTrend[2].totalMs, 8 * 60 * 60 * 1000);
  assert.equal(insights.monthlyTrend[0].label, 'W1');
});

test('getDashboardInsights keeps streak alive across saturday and sunday', async () => {
  const repo = createMemoryRepository([
    {
      dateKey: '2026-03-13',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-13T00:00:00.000Z',
      updatedAt: '2026-03-13T00:00:00.000Z',
    },
    {
      dateKey: '2026-03-16',
      amIn: '8:00 AM',
      amOut: '12:00 PM',
      pmIn: '1:00 PM',
      pmOut: '5:00 PM',
      createdAt: '2026-03-16T00:00:00.000Z',
      updatedAt: '2026-03-16T00:00:00.000Z',
    },
  ]);
  const service = new DutyService(repo, () => new Date('2026-03-16T09:00:00.000'));

  const insights = await service.getDashboardInsights(40, new Date('2026-03-16T09:00:00.000'));

  assert.equal(insights.currentStreakDays, 2);
  assert.equal(insights.longestStreakDays, 2);
});
