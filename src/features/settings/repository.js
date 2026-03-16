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
  const row = await getSetting(REQUIRED_HOURS_KEY);

  if (!row) {
    return DEFAULT_REQUIRED_HOURS;
  }

  return normalizeRequiredHours(row);
}

async function setRequiredHours(requiredHours) {
  const normalizedValue = normalizeRequiredHours(requiredHours);
  await setSetting(REQUIRED_HOURS_KEY, String(normalizedValue));

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
  const value = await getSetting(THEME_MODE_KEY);
  return value === 'light' ? 'light' : 'dark';
}

async function setThemeMode(mode) {
  const normalizedMode = mode === 'light' ? 'light' : 'dark';
  await setSetting(THEME_MODE_KEY, normalizedMode);
  return normalizedMode;
}

async function getSetting(key) {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT value FROM app_settings WHERE key = ? LIMIT 1`,
    [key]
  );
  return row ? row.value : null;
}

async function setSetting(key, value) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO app_settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, String(value)]
  );
}

async function listAllSettings() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT key, value
     FROM app_settings
     ORDER BY key ASC`
  );
  return rows.map((row) => ({ key: row.key, value: row.value }));
}

module.exports = {
  getSetting,
  getThemeMode,
  getRequiredHours,
  hasRequiredHoursSetting,
  listAllSettings,
  setSetting,
  setThemeMode,
  setRequiredHours,
};
