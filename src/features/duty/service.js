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
