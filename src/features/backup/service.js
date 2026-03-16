const { isValidDateKey, isValidTimeValue } = require('../duty/time');

const BACKUP_SCHEMA_VERSION = 1;
const LAST_BACKUP_AT_KEY = 'last_backup_at';

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

function createBackupPayload(data, exportedAt) {
  const dutyEntries = Array.isArray(data && data.dutyEntries) ? data.dutyEntries.map(normalizeEntry) : [];
  const settings = Array.isArray(data && data.settings) ? data.settings.map(normalizeSetting) : [];
  return {
    kind: 'ojt-backup',
    version: BACKUP_SCHEMA_VERSION,
    exportedAt,
    data: {
      settings,
      dutyEntries,
    },
  };
}

function validateBackupPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid backup file: payload is missing.');
  }
  if (payload.kind !== 'ojt-backup') {
    throw new Error('Invalid backup file: unsupported backup kind.');
  }
  if (payload.version !== BACKUP_SCHEMA_VERSION) {
    throw new Error(`Invalid backup file: expected version ${BACKUP_SCHEMA_VERSION}.`);
  }
  if (!payload.data || typeof payload.data !== 'object') {
    throw new Error('Invalid backup file: data object is missing.');
  }

  const settings = Array.isArray(payload.data.settings) ? payload.data.settings : null;
  const dutyEntries = Array.isArray(payload.data.dutyEntries) ? payload.data.dutyEntries : null;
  if (!settings || !dutyEntries) {
    throw new Error('Invalid backup file: settings or duty entries are missing.');
  }

  for (const setting of settings) {
    if (!setting || typeof setting.key !== 'string' || typeof setting.value !== 'string') {
      throw new Error('Invalid backup file: settings format is invalid.');
    }
  }

  for (const entry of dutyEntries) {
    if (!entry || !isValidDateKey(entry.dateKey)) {
      throw new Error('Invalid backup file: date key format is invalid.');
    }
    const hasAm = Boolean(entry.amIn || entry.amOut);
    const hasPm = Boolean(entry.pmIn || entry.pmOut);
    if (!hasAm && !hasPm) {
      throw new Error('Invalid backup file: empty duty entry found.');
    }
    if (hasAm && (!isValidTimeValue(entry.amIn) || !isValidTimeValue(entry.amOut))) {
      throw new Error('Invalid backup file: AM session format is invalid.');
    }
    if (hasPm && (!isValidTimeValue(entry.pmIn) || !isValidTimeValue(entry.pmOut))) {
      throw new Error('Invalid backup file: PM session format is invalid.');
    }
  }

  return payload;
}

class BackupService {
  constructor(dataRepository, fileStore, settingsRepository, nowProvider) {
    this.dataRepository = dataRepository;
    this.fileStore = fileStore;
    this.settingsRepository = settingsRepository;
    this.nowProvider = nowProvider || (() => new Date());
  }

  async exportBackup() {
    const exportedAt = this.nowProvider().toISOString();
    const currentData = await this.dataRepository.getCurrentData();
    const payload = createBackupPayload(currentData, exportedAt);
    validateBackupPayload(payload);

    const content = JSON.stringify(payload, null, 2);
    const fileInfo = await this.fileStore.writeLatestBackup(content, exportedAt);
    await this.settingsRepository.setSetting(LAST_BACKUP_AT_KEY, exportedAt);

    return {
      exportedAt,
      settingsCount: payload.data.settings.length,
      entriesCount: payload.data.dutyEntries.length,
      latestPath: fileInfo.latestPath,
      archivePath: fileInfo.archivePath,
    };
  }

  async restoreLatestBackup() {
    const snapshotAt = this.nowProvider().toISOString();
    const currentData = await this.dataRepository.getCurrentData();
    const snapshotPayload = createBackupPayload(currentData, snapshotAt);
    const snapshotContent = JSON.stringify(snapshotPayload, null, 2);
    const snapshotPath = await this.fileStore.writeSnapshot(snapshotContent, snapshotAt);

    let rawContent;
    let parsedPayload;
    try {
      rawContent = await this.fileStore.readLatestBackup();
      parsedPayload = validateBackupPayload(JSON.parse(rawContent));
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }

    try {
      await this.dataRepository.replaceAllData(parsedPayload.data);
      await this.settingsRepository.setSetting(LAST_BACKUP_AT_KEY, parsedPayload.exportedAt || snapshotAt);
    } catch (restoreError) {
      await this.dataRepository.replaceAllData(snapshotPayload.data);
      throw new Error(`Restore failed and was rolled back from snapshot: ${restoreError.message}`);
    }

    return {
      restoredAt: snapshotAt,
      sourceExportedAt: parsedPayload.exportedAt || '',
      entriesCount: parsedPayload.data.dutyEntries.length,
      settingsCount: parsedPayload.data.settings.length,
      snapshotPath,
    };
  }
}

module.exports = {
  BACKUP_SCHEMA_VERSION,
  BackupService,
  LAST_BACKUP_AT_KEY,
  createBackupPayload,
  validateBackupPayload,
};
