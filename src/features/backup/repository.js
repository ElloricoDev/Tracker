const { getDb } = require('../../data/database');

function normalizeEntry(entry) {
  return {
    dateKey: String(entry.dateKey || ''),
    amIn: String(entry.amIn || ''),
    amOut: String(entry.amOut || ''),
    pmIn: String(entry.pmIn || ''),
    pmOut: String(entry.pmOut || ''),
    createdAt: String(entry.createdAt || ''),
    updatedAt: String(entry.updatedAt || ''),
  };
}

function normalizeSetting(setting) {
  return {
    key: String(setting.key || ''),
    value: String(setting.value || ''),
  };
}

async function getCurrentData() {
  const db = await getDb();
  const [entryRows, settingRows] = await Promise.all([
    db.getAllAsync(
      `SELECT date_key, am_in, am_out, pm_in, pm_out, created_at, updated_at
       FROM duty_entries
       ORDER BY date_key DESC`
    ),
    db.getAllAsync(
      `SELECT key, value
       FROM app_settings
       ORDER BY key ASC`
    ),
  ]);

  return {
    dutyEntries: entryRows.map((row) => ({
      dateKey: row.date_key,
      amIn: row.am_in,
      amOut: row.am_out,
      pmIn: row.pm_in,
      pmOut: row.pm_out,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    settings: settingRows.map((row) => ({ key: row.key, value: row.value })),
  };
}

async function replaceAllData(payload) {
  const db = await getDb();
  const dutyEntries = Array.isArray(payload && payload.dutyEntries) ? payload.dutyEntries : [];
  const settings = Array.isArray(payload && payload.settings) ? payload.settings : [];

  await db.execAsync('BEGIN IMMEDIATE TRANSACTION;');
  try {
    await db.runAsync('DELETE FROM duty_entries');
    await db.runAsync('DELETE FROM app_settings');

    for (const rawEntry of dutyEntries) {
      const entry = normalizeEntry(rawEntry);
      await db.runAsync(
        `INSERT INTO duty_entries (date_key, am_in, am_out, pm_in, pm_out, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [entry.dateKey, entry.amIn, entry.amOut, entry.pmIn, entry.pmOut, entry.createdAt, entry.updatedAt]
      );
    }

    for (const rawSetting of settings) {
      const setting = normalizeSetting(rawSetting);
      await db.runAsync(
        `INSERT INTO app_settings (key, value)
         VALUES (?, ?)`,
        [setting.key, setting.value]
      );
    }

    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}

module.exports = {
  getCurrentData,
  replaceAllData,
};
