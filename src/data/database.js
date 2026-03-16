const SQLite = require('expo-sqlite');

let dbPromise = null;
let initialized = false;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('ojt_hours_tracker.db');
  }

  const db = await dbPromise;

  if (!initialized) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS duty_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        clock_in_at TEXT NOT NULL,
        clock_out_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_duty_sessions_clock_in_at
      ON duty_sessions(clock_in_at);

      CREATE TABLE IF NOT EXISTS duty_entries (
        date_key TEXT PRIMARY KEY NOT NULL,
        am_in TEXT NOT NULL,
        am_out TEXT NOT NULL,
        pm_in TEXT NOT NULL,
        pm_out TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    initialized = true;
  }

  return db;
}

module.exports = {
  getDb,
};
