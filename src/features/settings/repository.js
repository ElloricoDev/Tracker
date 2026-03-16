const { getDb } = require('../../data/database');

const REQUIRED_HOURS_KEY = 'required_ojt_hours';
const THEME_MODE_KEY = 'theme_mode';
const DEFAULT_REQUIRED_HOURS = 0;

function normalizeRequiredHours(value) {
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
    return DEFAULT_REQUIRED_HOURS;
  }

  if (Number.isFinite(value) && value >= 0) {
    return value;
  }

  return DEFAULT_REQUIRED_HOURS;
}

async function getRequiredHours() {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT value FROM app_settings WHERE key = ? LIMIT 1`,
    [REQUIRED_HOURS_KEY]
  );

  if (!row) {
    return DEFAULT_REQUIRED_HOURS;
  }

  return normalizeRequiredHours(row.value);
}

async function setRequiredHours(requiredHours) {
  const db = await getDb();
  const normalizedValue = normalizeRequiredHours(requiredHours);

  await db.runAsync(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [REQUIRED_HOURS_KEY, String(normalizedValue)]
  );

  return normalizedValue;
}

async function hasRequiredHoursSetting() {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT 1 AS has_setting FROM app_settings WHERE key = ? LIMIT 1`,
    [REQUIRED_HOURS_KEY]
  );
  return Boolean(row && row.has_setting);
}

async function getThemeMode() {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT value FROM app_settings WHERE key = ? LIMIT 1`,
    [THEME_MODE_KEY]
  );
  return row && row.value === 'light' ? 'light' : 'dark';
}

async function setThemeMode(mode) {
  const normalizedMode = mode === 'light' ? 'light' : 'dark';
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [THEME_MODE_KEY, normalizedMode]
  );
  return normalizedMode;
}

module.exports = {
  getThemeMode,
  getRequiredHours,
  hasRequiredHoursSetting,
  setThemeMode,
  setRequiredHours,
};
