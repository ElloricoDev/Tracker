function startOfLocalDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfLocalWeekMonday(date) {
  const value = startOfLocalDay(date);
  const dayIndex = value.getDay();
  const daysFromMonday = (dayIndex + 6) % 7;
  value.setDate(value.getDate() - daysFromMonday);
  return value;
}

function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function isValidDateKey(dateKey) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

function isValidTimeValue(timeValue) {
  return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(timeValue);
}

function parseTimeToMinutes(timeValue) {
  const match12 = /^(\d{1,2}):([0-5][0-9])\s?(AM|PM)$/i.exec(timeValue);
  if (match12) {
    const rawHour = Number.parseInt(match12[1], 10);
    const minute = Number.parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    const hour = rawHour % 12 + (period === 'PM' ? 12 : 0);
    return hour * 60 + minute;
  }

  const match24 = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(timeValue);
  if (match24) {
    const hour = Number.parseInt(match24[1], 10);
    const minute = Number.parseInt(match24[2], 10);
    return hour * 60 + minute;
  }

  return null;
}

function timeValueToDate(baseDate, timeValue) {
  const value = new Date(baseDate);
  const totalMinutes = parseTimeToMinutes(timeValue);
  if (totalMinutes == null) {
    return value;
  }

  value.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return value;
}

function formatTimeFromDate(date) {
  const value = new Date(date);
  let hours = value.getHours();
  const minutes = String(value.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  const twelveHour = hours === 0 ? 12 : hours;
  return `${twelveHour}:${minutes} ${period}`;
}

function calculateEntryDurationMs(entry) {
  const hasAm = Boolean(entry.amIn || entry.amOut);
  const hasPm = Boolean(entry.pmIn || entry.pmOut);

  if (!hasAm && !hasPm) {
    throw new Error('At least one session (AM or PM) is required.');
  }

  if (hasAm && (!entry.amIn || !entry.amOut)) {
    throw new Error('AM time in and out are both required when AM session is used.');
  }

  if (hasPm && (!entry.pmIn || !entry.pmOut)) {
    throw new Error('PM time in and out are both required when PM session is used.');
  }

  let amIn = null;
  let amOut = null;
  let pmIn = null;
  let pmOut = null;

  if (hasAm) {
    amIn = parseTimeToMinutes(entry.amIn);
    amOut = parseTimeToMinutes(entry.amOut);
    if (amIn == null || amOut == null) {
      throw new Error('Invalid date/time values.');
    }
    if (amOut <= amIn) {
      throw new Error('AM time out must be later than AM time in.');
    }
  }

  if (hasPm) {
    pmIn = parseTimeToMinutes(entry.pmIn);
    pmOut = parseTimeToMinutes(entry.pmOut);
    if (pmIn == null || pmOut == null) {
      throw new Error('Invalid date/time values.');
    }
    if (pmOut <= pmIn) {
      throw new Error('PM time out must be later than PM time in.');
    }
  }

  if (hasAm && hasPm && pmIn < amOut) {
    throw new Error('PM time in cannot be earlier than AM time out.');
  }

  let totalMinutes = 0;
  if (hasAm) {
    totalMinutes += amOut - amIn;
  }
  if (hasPm) {
    totalMinutes += pmOut - pmIn;
  }

  return totalMinutes * 60000;
}

function sumEntryDurationMs(entries) {
  return entries.reduce((total, entry) => total + calculateEntryDurationMs(entry), 0);
}

function formatHours(minutesMs) {
  const totalMinutes = Math.floor(minutesMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function calculateRequirementProgress(totalMs, requiredHours) {
  const targetHours = Number.isFinite(requiredHours) ? requiredHours : 0;
  const requiredMs = Math.max(0, targetHours) * 60 * 60 * 1000;
  const remainingMs = Math.max(requiredMs - totalMs, 0);
  const percentComplete =
    requiredMs === 0 ? 0 : Math.min(100, Math.floor((totalMs / requiredMs) * 100));

  return {
    requiredMs,
    remainingMs,
    percentComplete,
  };
}

module.exports = {
  addDays,
  calculateRequirementProgress,
  calculateEntryDurationMs,
  formatHours,
  formatTimeFromDate,
  isValidDateKey,
  isValidTimeValue,
  parseTimeToMinutes,
  startOfLocalDay,
  startOfLocalWeekMonday,
  sumEntryDurationMs,
  timeValueToDate,
};
