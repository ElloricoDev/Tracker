# OJT Hours Duty Tracker (Offline)

An offline mobile app for tracking OJT duty hours using manual AM/PM time entries.

## Stack

- React Native (Expo)
- SQLite (`expo-sqlite`)
- Local-only storage (no cloud sync in v1)

## Features (v1)

- Manual daily entry:
  - Date (selected with native date picker, shown like `March 16, 2026`)
  - AM Time In / Time Out (selected with native time picker)
  - PM Time In / Time Out (selected with native time picker)
  - Clear AM session / Clear PM session for half-day records
- Validation:
  - At least one session (AM or PM) is required
  - For any used session, both in and out are required
  - Time format is 12-hour (`h:mm AM/PM`)
  - AM out must be after AM in
  - PM out must be after PM in
  - PM in must not be earlier than AM out
- Daily and weekly hour totals
- Configurable required OJT hours (Settings)
  - Saved required hours are locked until Edit is clicked
- Progress view: completed, required, and remaining hours
  - Shows all-time OJT rendered, required OJT time, and time remaining
- Recent manual entries history
  - Paged logs (10 entries per page) with Previous/Next navigation
  - Edit any entry in a modal form
  - Delete any entry
- Backup and restore (v2)
  - Export local data to versioned JSON backup
  - Creates local backup archive and stores latest backup metadata
  - Restore from latest backup with snapshot-first safety
  - Automatic rollback to snapshot if restore fails

## Run

```bash
npm install
npm run start
```

Then open in Expo Go, Android emulator, iOS simulator (macOS), or web.

## Tests

```bash
npm run test

## Backup/Restore notes

- Backups are saved in app storage (`documentDirectory/ojt-backups`).
- `Export backup` attempts to open share sheet to save/send JSON.
- `Restore backup` restores from `latest-backup.json` and first creates a snapshot.
- If restore fails, app automatically rolls back to the snapshot.

## Deploy (Android, EAS)

1. Install and log in to EAS CLI:

```bash
npm install -g eas-cli
eas login
```

2. Set your unique app IDs in `app.json`:

- `expo.android.package` (example: `com.school.ojttracker`)
- `expo.ios.bundleIdentifier` (if you will also deploy iOS)

3. Build production Android app bundle (recommended smaller store download size):

```bash
eas build --platform android --profile production
```

For internal testing APK:

```bash
eas build --platform android --profile preview
```

4. Submit to Google Play (after build is finished):

```bash
eas submit --platform android --profile production
```
