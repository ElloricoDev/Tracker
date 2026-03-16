const test = require('node:test');
const assert = require('node:assert/strict');
const {
  BackupService,
  createBackupPayload,
  validateBackupPayload,
} = require('../service');

function createHarness() {
  let latestBackupContent = null;
  let data = {
    settings: [{ key: 'required_ojt_hours', value: '500' }],
    dutyEntries: [
      {
        dateKey: '2026-03-16',
        amIn: '8:00 AM',
        amOut: '12:00 PM',
        pmIn: '1:00 PM',
        pmOut: '5:00 PM',
        createdAt: '2026-03-16T00:00:00.000Z',
        updatedAt: '2026-03-16T00:00:00.000Z',
      },
    ],
  };
  const settingWrites = [];

  const dataRepository = {
    async getCurrentData() {
      return JSON.parse(JSON.stringify(data));
    },
    async replaceAllData(nextData) {
      data = JSON.parse(JSON.stringify(nextData));
    },
  };
  const fileStore = {
    async writeLatestBackup(content) {
      latestBackupContent = content;
      return { latestPath: 'latest.json', archivePath: 'archive.json' };
    },
    async writeSnapshot() {
      return 'snapshot.json';
    },
    async readLatestBackup() {
      if (!latestBackupContent) {
        throw new Error('No backup file found.');
      }
      return latestBackupContent;
    },
  };
  const settingsRepository = {
    async setSetting(key, value) {
      settingWrites.push({ key, value });
    },
  };
  return { dataRepository, fileStore, settingsRepository, settingWrites, getData: () => data };
}

test('createBackupPayload and validateBackupPayload pass for valid data', () => {
  const payload = createBackupPayload(
    {
      settings: [{ key: 'theme_mode', value: 'dark' }],
      dutyEntries: [
        {
          dateKey: '2026-03-16',
          amIn: '8:00 AM',
          amOut: '12:00 PM',
          pmIn: '',
          pmOut: '',
          createdAt: 'x',
          updatedAt: 'y',
        },
      ],
    },
    '2026-03-16T10:00:00.000Z'
  );
  assert.equal(payload.kind, 'ojt-backup');
  assert.equal(payload.version, 1);
  assert.doesNotThrow(() => validateBackupPayload(payload));
});

test('validateBackupPayload rejects malformed entry', () => {
  const invalidPayload = {
    kind: 'ojt-backup',
    version: 1,
    exportedAt: '2026-03-16T10:00:00.000Z',
    data: {
      settings: [{ key: 'theme_mode', value: 'dark' }],
      dutyEntries: [{ dateKey: 'bad-date', amIn: '', amOut: '', pmIn: '', pmOut: '' }],
    },
  };
  assert.throws(() => validateBackupPayload(invalidPayload));
});

test('BackupService export writes backup and metadata', async () => {
  const harness = createHarness();
  const service = new BackupService(
    harness.dataRepository,
    harness.fileStore,
    harness.settingsRepository,
    () => new Date('2026-03-16T12:30:00.000Z')
  );

  const result = await service.exportBackup();
  assert.equal(result.entriesCount, 1);
  assert.equal(result.settingsCount, 1);
  assert.equal(harness.settingWrites.length, 1);
  assert.equal(harness.settingWrites[0].key, 'last_backup_at');
});

test('BackupService restore replaces data from latest backup', async () => {
  const harness = createHarness();
  const service = new BackupService(
    harness.dataRepository,
    harness.fileStore,
    harness.settingsRepository,
    () => new Date('2026-03-16T14:00:00.000Z')
  );

  await service.exportBackup();
  await harness.dataRepository.replaceAllData({ settings: [], dutyEntries: [] });
  const restored = await service.restoreLatestBackup();

  assert.equal(restored.entriesCount, 1);
  assert.equal(harness.getData().dutyEntries.length, 1);
  assert.equal(harness.getData().settings.length, 1);
});

test('BackupService restore rolls back to snapshot on replace failure', async () => {
  const harness = createHarness();
  const originalData = harness.getData();
  const service = new BackupService(
    harness.dataRepository,
    harness.fileStore,
    harness.settingsRepository,
    () => new Date('2026-03-16T16:00:00.000Z')
  );

  await service.exportBackup();

  let callCount = 0;
  harness.dataRepository.replaceAllData = async (nextData) => {
    callCount += 1;
    if (callCount === 1) {
      throw new Error('replace failed');
    }
    originalData.settings = JSON.parse(JSON.stringify(nextData.settings));
    originalData.dutyEntries = JSON.parse(JSON.stringify(nextData.dutyEntries));
  };

  await assert.rejects(() => service.restoreLatestBackup(), /rolled back from snapshot/i);
  assert.equal(callCount, 2);
});
