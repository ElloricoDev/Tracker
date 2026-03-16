const { getDb } = require('../../data/database');

function mapRow(row) {
  return {
    dateKey: row.date_key,
    amIn: row.am_in,
    amOut: row.am_out,
    pmIn: row.pm_in,
    pmOut: row.pm_out,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function upsertEntry(entry) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO duty_entries (date_key, am_in, am_out, pm_in, pm_out, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date_key) DO UPDATE SET
       am_in = excluded.am_in,
       am_out = excluded.am_out,
       pm_in = excluded.pm_in,
       pm_out = excluded.pm_out,
       updated_at = excluded.updated_at`,
    [
      entry.dateKey,
      entry.amIn,
      entry.amOut,
      entry.pmIn,
      entry.pmOut,
      entry.createdAt,
      entry.updatedAt,
    ]
  );
}

async function listEntriesBetween(startDateKeyInclusive, endDateKeyExclusive) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT date_key, am_in, am_out, pm_in, pm_out, created_at, updated_at
     FROM duty_entries
     WHERE date_key >= ? AND date_key < ?
     ORDER BY date_key DESC`,
    [startDateKeyInclusive, endDateKeyExclusive]
  );
  return rows.map(mapRow);
}

async function getEntryByDate(dateKey) {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT date_key, am_in, am_out, pm_in, pm_out, created_at, updated_at
     FROM duty_entries
     WHERE date_key = ?
     LIMIT 1`,
    [dateKey]
  );
  return row ? mapRow(row) : null;
}

async function listRecentEntries(limit = 10, offset = 0) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT date_key, am_in, am_out, pm_in, pm_out, created_at, updated_at
     FROM duty_entries
     ORDER BY date_key DESC
     LIMIT ? OFFSET ?`,
    [limit, Math.max(0, offset)]
  );
  return rows.map(mapRow);
}

async function countEntries() {
  const db = await getDb();
  const row = await db.getFirstAsync(`SELECT COUNT(*) AS total FROM duty_entries`);
  return row && Number.isFinite(row.total) ? row.total : 0;
}

async function listAllEntries() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT date_key, am_in, am_out, pm_in, pm_out, created_at, updated_at
     FROM duty_entries
     ORDER BY date_key DESC`
  );
  return rows.map(mapRow);
}

async function deleteEntryByDate(dateKey) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM duty_entries WHERE date_key = ?`, [dateKey]);
}

module.exports = {
  deleteEntryByDate,
  getEntryByDate,
  listAllEntries,
  countEntries,
  listEntriesBetween,
  listRecentEntries,
  upsertEntry,
};
