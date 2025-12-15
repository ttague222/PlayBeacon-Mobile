# Build Checklist

Pre-build validation checklist for PlayBeacon mobile app. **Run these checks before every EAS build** to catch issues early and avoid failed builds.

## Quick Pre-Build Commands

Run these commands before submitting a build:

```bash
# 1. Verify dependencies are in sync
npm ci

# 2. Check for Expo SDK version conflicts
npx expo-doctor

# 3. Run tests
npm test

# 4. Type check (if using TypeScript)
npx tsc --noEmit
```

## Detailed Checklist

### 1. Dependencies

- [ ] `npm ci` succeeds without errors
- [ ] `package.json` and `package-lock.json` are both committed
- [ ] No version conflicts between dependencies
- [ ] Critical packages are pinned to exact versions (no `^` or `~`)

**Known Conflicts:**
- `@react-native-async-storage/async-storage`: Firebase requires `^1.18.1`, Expo SDK 54 wants `2.2.0`. Solution: Pin to `1.24.0` and add to `expo.install.exclude` in package.json.

### 2. Expo Doctor

- [ ] `npx expo-doctor` passes (or warnings are acknowledged)
- [ ] Any version mismatches are intentional and documented

**Handling Version Warnings:**
If Expo wants to upgrade a package that would break another dependency, add it to the exclude list:

```json
// package.json
{
  "expo": {
    "install": {
      "exclude": ["@react-native-async-storage/async-storage"]
    }
  }
}
```

### 3. iOS-Specific

iOS is less forgiving than Android. Ensure:

- [ ] All SDK initializations are wrapped in try/catch
- [ ] Sentry/analytics are lazy-loaded (not imported at module level)
- [ ] Firebase initialization has error handling
- [ ] Optional features fail gracefully without crashing the app

**Example: Safe Module Initialization**
```javascript
// BAD - crashes app if Sentry fails
import * as Sentry from '@sentry/react-native';
Sentry.init({ dsn: '...' });

// GOOD - fails gracefully
try {
  const Sentry = require('@sentry/react-native');
  Sentry.init({ dsn: '...' });
} catch (error) {
  console.warn('Sentry init failed:', error);
}
```

**Example: Lazy Loading**
```javascript
// BAD - module-level import can crash before React renders
import { captureException } from '../config/sentry';

// GOOD - lazy load inside function
const getSentry = () => {
  try {
    return require('../config/sentry');
  } catch { return null; }
};
```

### 4. Configuration Files

- [ ] `app.json` is valid JSON
- [ ] `eas.json` is valid JSON
- [ ] Build number is appropriate (auto-incremented by EAS)
- [ ] Environment variables are set in EAS dashboard

### 5. Code Quality

- [ ] No TypeScript/ESLint errors
- [ ] Tests pass (`npm test`)
- [ ] No console.error calls that could indicate problems

## Common Build Failures

### npm ci EUSAGE Error
```
npm error code EUSAGE
npm error Missing: @some-package@X.X.X from lock file
```

**Cause:** package-lock.json is out of sync with package.json

**Fix:**
```bash
rm package-lock.json
npm install
git add package.json package-lock.json
git commit -m "Sync package-lock.json"
```

### iOS White Screen

**Cause:** JavaScript crash before React can render (usually initialization code)

**Fix:**
1. Wrap all SDK inits in try/catch
2. Lazy load optional modules
3. Add null checks for Firebase `auth`/`db` exports
4. Check import chains for cascading failures

**Files to check:**
- `src/config/firebase.js` - Firebase initialization
- `src/config/sentry.js` - Sentry initialization
- `src/context/AuthContext.js` - Auth state management
- `src/components/ErrorBoundary.js` - Error handling

### Expo Version Mismatch

```
Some dependencies are incompatible with the installed expo package version
```

**Fix:** Either update the dependency or exclude it:
```json
{
  "expo": {
    "install": {
      "exclude": ["problematic-package"]
    }
  }
}
```

## Build Commands

### Development Build (for testing)
```bash
npx eas build --platform ios --profile development
npx eas build --platform android --profile development
```

### Production Build
```bash
# iOS
npx eas build --platform ios --profile production

# Android
npx eas build --platform android --profile production

# Both
npx eas build --platform all --profile production
```

### Submit to App Stores
```bash
# Submit latest iOS build to App Store Connect
npx eas submit --platform ios --latest

# Submit latest Android build to Google Play
npx eas submit --platform android --latest
```

### Force Fresh Build (clear cache)
```bash
npx eas build --platform ios --profile production --clear-cache
```

## Post-Build Verification

After a successful build:

1. **iOS:** Install via TestFlight and verify:
   - App launches without white screen
   - All screens load correctly
   - Authentication works
   - API calls succeed

2. **Android:** Install via internal testing and verify:
   - App launches correctly
   - All features work as expected

## Dependency Version Reference

Current working versions (as of December 2025):

| Package | Version | Notes |
|---------|---------|-------|
| expo | ~54.0.29 | SDK 54 |
| react | 19.1.0 | |
| react-native | 0.81.5 | |
| @react-native-async-storage/async-storage | 1.24.0 | Pinned for Firebase compatibility |
| firebase | ^12.6.0 | |
| @sentry/react-native | ~7.2.0 | |

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Doctor](https://docs.expo.dev/workflow/doctor/)
- [Troubleshooting Guide](https://docs.expo.dev/build-reference/troubleshooting/)
