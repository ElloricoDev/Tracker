const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateEntryDurationMs,
  calculateRequirementProgress,
  formatHours,
  formatTimeFromDate,
  isValidDateKey,
  isValidTimeValue,
  parseTimeToMinutes,
  startOfLocalDay,
  startOfLocalWeekMonday,
  sumEntryDurationMs,
  timeValueToDate,
} = require('../time');

test('calculate entry duration for AM and PM', () => {
  const duration = calculateEntryDurationMs({
    dateKey: '2026-03-16',
    amIn: '8:00 AM',
    amOut: '12:00 PM',
    pmIn: '1:00 PM',
    pmOut: '5:00 PM',
  });
  assert.equal(duration, 8 * 60 * 60 * 1000);
});

test('calculate entry duration for half-day AM-only', () => {
  const duration = calculateEntryDurationMs({
    dateKey: '2026-03-16',
    amIn: '8:00 AM',
    amOut: '12:00 PM',
    pmIn: '',
    pmOut: '',
  });
  assert.equal(duration, 4 * 60 * 60 * 1000);
});

test('sum entry durations', () => {
  const total = sumEntryDurationMs([
    { dateKey: '2026-03-16', amIn: '8:00 AM', amOut: '12:00 PM', pmIn: '1:00 PM', pmOut: '5:00 PM' },
    { dateKey: '2026-03-17', amIn: '8:00 AM', amOut: '12:00 PM', pmIn: '1:00 PM', pmOut: '4:00 PM' },
  ]);
  assert.equal(total, 15 * 60 * 60 * 1000);
});

test('rejects PM in earlier than AM out', () => {
  assert.throws(
    () =>
      calculateEntryDurationMs({
        dateKey: '2026-03-16',
        amIn: '8:00 AM',
        amOut: '12:00 PM',
        pmIn: '11:00 AM',
        pmOut: '5:00 PM',
      }),
    /PM time in/
  );
});

test('rejects entry when both AM and PM sessions are empty', () => {
  assert.throws(
    () =>
      calculateEntryDurationMs({
        dateKey: '2026-03-16',
        amIn: '',
        amOut: '',
        pmIn: '',
        pmOut: '',
      }),
    /At least one session/
  );
});

test('date/time validators', () => {
  assert.equal(isValidDateKey('2026-03-16'), true);
  assert.equal(isValidDateKey('03-16-2026'), false);
  assert.equal(isValidTimeValue('8:30 AM'), true);
  assert.equal(isValidTimeValue('17:30'), false);
});

test('parseTimeToMinutes supports 12-hour and legacy 24-hour values', () => {
  assert.equal(parseTimeToMinutes('1:30 PM'), 810);
  assert.equal(parseTimeToMinutes('13:30'), 810);
  assert.equal(parseTimeToMinutes('bad'), null);
});

test('formatTimeFromDate and timeValueToDate roundtrip', () => {
  const base = new Date('2026-03-16T00:00:00');
  const converted = timeValueToDate(base, '3:45 PM');
  assert.equal(formatTimeFromDate(converted), '3:45 PM');
});

test('startOfLocalDay resets hours to 00:00:00.000', () => {
  const value = startOfLocalDay(new Date('2026-03-18T15:30:20.555'));
  assert.equal(value.getHours(), 0);
  assert.equal(value.getMinutes(), 0);
  assert.equal(value.getSeconds(), 0);
  assert.equal(value.getMilliseconds(), 0);
});

test('startOfLocalWeekMonday returns monday', () => {
  const sunday = new Date('2026-03-22T16:00:00.000');
  const monday = startOfLocalWeekMonday(sunday);
  assert.equal(monday.getDay(), 1);
});

test('formatHours renders hour-minute output', () => {
  assert.equal(formatHours(3900000), '1h 5m');
});

test('calculateRequirementProgress returns remaining and percent', () => {
  const progress = calculateRequirementProgress(18 * 60 * 60 * 1000, 40);
  assert.equal(progress.percentComplete, 45);
  assert.equal(progress.remainingMs, 22 * 60 * 60 * 1000);
});
