const { Directory, File, Paths } = require('expo-file-system');

const backupDirectory = new Directory(Paths.document, 'ojt-backups');
const latestBackupFile = new File(backupDirectory, 'latest-backup.json');

function toSafeFileStamp(isoString) {
  return String(isoString).replace(/[:.]/g, '-');
}

async function ensureBackupDirectory() {
  backupDirectory.create({ idempotent: true, intermediates: true });
}

async function writeLatestBackup(content, exportedAt) {
  await ensureBackupDirectory();
  const stamp = toSafeFileStamp(exportedAt);
  const archiveFile = new File(backupDirectory, `backup-${stamp}.json`);
  latestBackupFile.create({ intermediates: true, overwrite: true });
  archiveFile.create({ intermediates: true, overwrite: true });
  latestBackupFile.write(content);
  archiveFile.write(content);
  return {
    latestPath: latestBackupFile.uri,
    archivePath: archiveFile.uri,
  };
}

async function writeSnapshot(content, exportedAt) {
  await ensureBackupDirectory();
  const stamp = toSafeFileStamp(exportedAt);
  const snapshotFile = new File(backupDirectory, `snapshot-before-restore-${stamp}.json`);
  snapshotFile.create({ intermediates: true, overwrite: true });
  snapshotFile.write(content);
  return snapshotFile.uri;
}

async function readLatestBackup() {
  if (!latestBackupFile.exists) {
    throw new Error('No backup file found. Export a backup first.');
  }
  return latestBackupFile.text();
}

async function shareBackup(path) {
  let Sharing = null;
  try {
    const moduleName = 'expo-sharing';
    Sharing = require(moduleName);
  } catch (error) {
    if (error && error.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    throw error;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    return false;
  }
  await Sharing.shareAsync(path);
  return true;
}

module.exports = {
  readLatestBackup,
  shareBackup,
  writeLatestBackup,
  writeSnapshot,
};
