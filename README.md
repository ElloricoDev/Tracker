# OJT Hours Duty Tracker - Modern Material UI with Drawer Navigation

An offline mobile app for tracking OJT duty hours with a modern Material-inspired design system, soft gradients, and intuitive drawer navigation.

## ✨ What's New - Refactored Architecture + Drawer Navigation

This app has been **completely refactored** from a monolithic 1797-line App.js into a modern, maintainable architecture with dedicated screens:

- **App.js:** 1797 lines → **59 lines** (97% reduction!)
- **4 dedicated screens** (Home, Logs, Settings, Backup)
- **Drawer navigation** with Material styling
- **28 reusable components** with reusable design tokens
- **Complete design system** with light/dark themes
- **All tests passing** (25/25)
- **Performance optimized** with React.memo, useCallback, useMemo

## 🎨 Modern Design System

Clean, modern UI design with:
- Material-inspired surface hierarchy
- Soft gradient-toned backgrounds
- Tactile press animations
- Smooth transitions
- Consistent spacing and typography
- Full dark mode support
- Custom styled drawer navigation

## 📱 Navigation Structure

The app features a **drawer navigation** system with 4 main screens:

1. **Home** - Progress circle and duty hour statistics
2. **Logs** - Duty entry form and entries management
3. **Settings** - Theme toggle and required hours configuration
4. **Backup & Restore** - Data backup and restore functionality

Each screen has a hamburger menu button to access the drawer, and the active screen is visually highlighted.

## Stack

- React Native (Expo)
- React Navigation v7 (Drawer)
- SQLite (`expo-sqlite`)
- Custom reusable UI components
- Context-based theme system
- Local-only storage (no cloud sync)

## Features

- ✅ Manual daily time entry (AM/PM sessions)
- ✅ Date and time picker integration
- ✅ Validation for time entries
- ✅ Progress tracking with animated circle
- ✅ Configurable required hours
- ✅ Recent entries with edit/delete
- ✅ Backup and restore functionality
- ✅ Dark mode toggle (accessible from drawer)
- ✅ Toast notifications
- ✅ Drawer navigation with 4 screens
- ✅ Responsive design

## Architecture

### Navigation Structure

```
AppNavigator (Drawer)
├── Home Screen       # Progress & statistics
├── Logs Screen       # Entry form & list
├── Settings Screen   # Theme & goals
└── Backup Screen     # Backup & restore
```

### Component Structure

```
src/
├── navigation/         # AppNavigator with drawer config
├── theme/             # Material-inspired theme system
├── hooks/             # useTheme, useToast, animation hooks
├── components/
│   ├── common/        # Button, Card, Modal, Toast, etc.
│   └── form/          # Input, DatePicker, TimePicker, SessionFields
├── features/
│   ├── duty/
│   │   ├── screens/   # HomeScreen, LogsScreen
│   │   └── components/ # Entry forms, lists, progress
│   ├── settings/
│   │   ├── screens/   # SettingsScreen
│   │   └── components/ # Settings section
│   └── backup/
│       ├── screens/   # BackupScreen
│       └── components/ # Backup/restore
└── data/              # Database layer
```

### Key Components

**Screens (4 screens):**
- HomeScreen, LogsScreen, SettingsScreen, BackupScreen

**Common (8 components):**
- Button, Card, IconButton, Modal, Toast, ProgressCircle, LoadingScreen, DeleteConfirmModal

**Form (4 components):**
- Input, TimePickerButton, DatePickerButton, SessionTimeFields

**Feature Components (8 components):**
- DutyEntryForm, EntriesList, EntryItem, EditEntryModal, ProgressSection, SettingsSection, BackupSection

### Hooks

- `useTheme` - Theme context with light/dark mode
- `useToast` - Toast notifications
- `useNeomorphismAnimation` - Press, fade, pulse, slide animations (legacy hook name)
- `useSessionForm` - Session time form state management

## Run

```bash
npm install
npm run start
```

Then open in Expo Go, Android emulator, iOS simulator (macOS), or web.

## Tests

```bash
npm run test
```

All 25 tests passing ✅

## Design System

### Colors

**Light Theme:** Base #f4f7fe with layered surfaces  
**Dark Theme:** Base #0b1220 with elevated containers  
**Primary:** Blue (#365edc / #8fa9ff)  
**Accent Colors:** Success, Warning, Error

### Elevations

- `flat` - No shadow
- `low` - Subtle depth
- `medium` - Standard elevated surface (default)
- `high` - Prominent depth
- `floating` - Elevated floating effect

### Spacing

xs(4) • sm(8) • md(12) • lg(16) • xl(20) • xxl(24) • xxxl(32)

### Border Radius

sm(8) • md(12) • lg(16) • xl(20) • round(999)

## Component Usage

### Button

```jsx
<Button
  variant="primary"  // primary, secondary, danger, success, flat
  size="medium"      // small, medium, large
  loading={false}
  icon={<Ionicons name="save-outline" size={16} />}
  onPress={handleSave}
>
  Save Entry
</Button>
```

### Card

```jsx
<Card elevation="medium">
  <Text>Your content here</Text>
</Card>
```

### Theme

```jsx
const { theme, isDarkMode, toggleTheme } = useTheme();
```

### Toast

```jsx
const { showToast } = useToast();
showToast('Entry saved!', 'success');
```

## Deploy (Android, EAS)

1. Install and log in to EAS CLI:

```bash
npm install -g eas-cli
eas login
```

2. Set your unique app IDs in `app.json`:

- `expo.android.package` (example: `com.school.ojttracker`)
- `expo.ios.bundleIdentifier` (if you will also deploy iOS)

3. Build production Android app bundle:

```bash
eas build --platform android --profile production
```

For internal testing APK:

```bash
eas build --platform android --profile preview
```

4. Submit to Google Play:

```bash
eas submit --platform android --profile production
```

## Benefits of Refactoring

✅ **Maintainability:** Clear separation of concerns  
✅ **Reusability:** 28 reusable components  
✅ **Consistency:** Unified design system  
✅ **Performance:** Optimized rendering  
✅ **Developer Experience:** Easy to understand and extend  
✅ **User Experience:** Modern, clean, and readable UI  
✅ **Scalability:** Easy to add new features  

## Performance Optimizations

- React.memo for all list items
- useCallback for event handlers
- useMemo for computed values
- Separate context providers
- Feature-based code splitting
- Optimized re-renders

## License

Private
