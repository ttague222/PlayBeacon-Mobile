# Claude Instructions for PlayBeacon Mobile App

This file contains instructions for Claude when working on this codebase.

## Pre-Build Checklist (REQUIRED)

**Before submitting ANY EAS build, run these commands locally:**

```bash
# 1. Verify dependencies are in sync (CRITICAL)
npm ci

# 2. Check for Expo version conflicts
npx expo-doctor

# 3. Run tests
npm test
```

If any of these fail, fix the issue before submitting the build. See [BUILD_CHECKLIST.md](BUILD_CHECKLIST.md) for detailed guidance.

## iOS White Screen Prevention

iOS is stricter than Android. To prevent white screen crashes:

1. **Never import SDKs at module level if they might fail:**
   ```javascript
   // BAD
   import * as Sentry from '@sentry/react-native';

   // GOOD - lazy load
   const getSentry = () => {
     try {
       return require('@sentry/react-native');
     } catch { return null; }
   };
   ```

2. **Wrap all initialization code in try/catch:**
   ```javascript
   try {
     const app = initializeApp(config);
   } catch (error) {
     console.warn('Init failed:', error);
   }
   ```

3. **Add null checks for Firebase exports:**
   ```javascript
   if (!auth) {
     setLoading(false);
     return;
   }
   ```

## Dependency Conflicts

### AsyncStorage Version Conflict

Firebase requires `@react-native-async-storage/async-storage@^1.18.1`, but Expo SDK 54 wants `2.2.0`.

**Solution:** Pin to `1.24.0` and exclude from Expo auto-upgrade:
```json
{
  "expo": {
    "install": {
      "exclude": ["@react-native-async-storage/async-storage"]
    }
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.24.0"
  }
}
```

## Build Commands

```bash
# iOS production build
npx eas build --platform ios --profile production

# Android production build
npx eas build --platform android --profile production

# Submit to stores
npx eas submit --platform ios --latest
npx eas submit --platform android --latest
```

## Critical Files

These files require extra care when modifying:

- `src/config/firebase.js` - Firebase initialization (crashes here = white screen)
- `src/config/sentry.js` - Sentry initialization (must lazy load)
- `src/context/AuthContext.js` - Auth state (imports firebase.js)
- `src/components/ErrorBoundary.js` - Error handling (must lazy load sentry)
- `App.js` - App entry point (all providers must handle null gracefully)
- `package.json` - Dependencies (always run npm ci after changes)

## Testing Changes

Before committing changes that affect initialization:

1. Clear Metro cache: `npx expo start --clear`
2. Test on iOS simulator (more strict than Android)
3. Verify app launches without white screen
4. Check console for initialization errors

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| npm ci fails | package-lock.json out of sync | `rm package-lock.json && npm install` |
| White screen on iOS | Module-level crash | Wrap in try/catch, lazy load |
| Expo doctor warnings | Version mismatch | Add to expo.install.exclude or update |
| Build timeout | Large dependencies | Use --clear-cache flag |
