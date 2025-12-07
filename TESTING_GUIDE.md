# Production Build Testing Guide

This guide explains how to test production builds of the PlayBeacon mobile app on real devices before submitting to app stores.

## Prerequisites

Before testing production builds, ensure:
- [x] EAS CLI is installed (`npm install -g eas-cli`)
- [x] You're logged into your Expo account (`eas login`)
- [x] App signing is configured (see [SIGNING_SETUP.md](./SIGNING_SETUP.md))
- [x] App icons and splash screens are created (see [ASSETS_GUIDE.md](./ASSETS_GUIDE.md))
- [ ] You have access to physical iOS and Android devices
- [ ] Devices are registered for testing

## Build Types for Testing

### Preview Build (Recommended for Testing)
Preview builds are optimized for internal testing and don't require app store submission.

```bash
# iOS Preview Build
eas build --platform ios --profile preview

# Android Preview Build
eas build --platform android --profile preview

# Both platforms
eas build --platform all --profile preview
```

**Benefits**:
- Faster build times
- No app store approval needed
- Can install via direct download or TestFlight/internal testing
- Mirrors production configuration

### Production Build
Production builds are identical to what users will download from app stores.

```bash
# iOS Production Build
eas build --platform ios --profile production

# Android Production Build
eas build --platform android --profile production
```

## Installing Builds on Devices

### iOS Testing

#### Option 1: TestFlight (Recommended)
1. **Build and submit to TestFlight**:
   ```bash
   eas build --platform ios --profile preview
   eas submit --platform ios --latest
   ```

2. **Add testers in App Store Connect**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Navigate to your app > TestFlight
   - Add internal or external testers
   - Testers will receive an email invitation

3. **Testers install TestFlight**:
   - Download TestFlight app from App Store
   - Open invitation email
   - Install PlayBeacon via TestFlight

#### Option 2: Ad Hoc Distribution
1. **Register device UDIDs**:
   ```bash
   eas device:create
   ```

2. **Build with registered devices**:
   ```bash
   eas build --platform ios --profile preview
   ```

3. **Download and install**:
   - Download .ipa file from EAS build page
   - Install using Apple Configurator or Xcode

### Android Testing

#### Option 1: Internal Testing Track (Recommended)
1. **Build and submit to Play Store**:
   ```bash
   eas build --platform android --profile preview
   eas submit --platform android --latest
   ```

2. **Add testers in Play Console**:
   - Go to [Google Play Console](https://play.google.com/console/)
   - Navigate to your app > Testing > Internal testing
   - Add email addresses of testers
   - Share the testing link

3. **Testers install the app**:
   - Open the testing link on Android device
   - Accept invitation
   - Install PlayBeacon from Play Store

#### Option 2: Direct APK Installation
1. **Build APK**:
   ```bash
   eas build --platform android --profile preview
   ```

2. **Download APK**:
   - Go to [Expo dashboard](https://expo.dev/accounts/YOUR_ACCOUNT/projects/playbeacon/builds)
   - Download the .apk file

3. **Install on device**:
   - Transfer APK to device
   - Enable "Install from unknown sources" in settings
   - Open APK file and install

## Testing Checklist

### Pre-Launch Testing

#### Functional Testing
- [ ] App launches successfully
- [ ] Splash screen displays correctly
- [ ] App icon appears properly on home screen
- [ ] All navigation flows work
- [ ] User authentication works
- [ ] Game search and discovery features work
- [ ] User can like/dislike games
- [ ] Game recommendations are generated correctly
- [ ] User profile updates correctly
- [ ] Firebase connection is stable

#### Platform-Specific Testing

**iOS**:
- [ ] Test on iPhone (various models if possible)
- [ ] Test on iPad (if supported)
- [ ] Test on different iOS versions (13.4+)
- [ ] App Store icon looks correct
- [ ] Push notifications work (if implemented)
- [ ] Deep linking works (if implemented)
- [ ] App behaves correctly in background/foreground
- [ ] Memory usage is acceptable

**Android**:
- [ ] Test on multiple Android devices
- [ ] Test on different Android versions (API 21+)
- [ ] Adaptive icon looks good in various shapes
- [ ] Back button behavior is correct
- [ ] App handles rotation correctly
- [ ] Permissions are requested appropriately
- [ ] App runs smoothly on low-end devices

#### Performance Testing
- [ ] App loads quickly (< 3 seconds to interactive)
- [ ] Smooth scrolling and animations
- [ ] No memory leaks during extended use
- [ ] Battery usage is reasonable
- [ ] Network requests are efficient
- [ ] Images load quickly
- [ ] No ANR (Application Not Responding) issues on Android
- [ ] No crashes or freezes

#### UI/UX Testing
- [ ] All screens render correctly
- [ ] Text is readable on all screen sizes
- [ ] Touch targets are appropriately sized
- [ ] Color contrast is sufficient
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Empty states are informative
- [ ] Forms validate input correctly

#### Offline Testing
- [ ] App handles no internet connection gracefully
- [ ] Appropriate error messages for offline state
- [ ] Cached data displays correctly
- [ ] App recovers when connection is restored

#### Edge Cases
- [ ] App handles server errors gracefully
- [ ] App works with very long content
- [ ] App works with empty/minimal data
- [ ] App handles rapid user interactions
- [ ] App recovers from crashes
- [ ] App works after OS updates

### Security Testing
- [ ] Authentication tokens are stored securely
- [ ] API keys are not exposed in client code
- [ ] HTTPS is used for all network requests
- [ ] User data is protected
- [ ] App follows platform security guidelines

## Device Testing Matrix

### Recommended Minimum Device Coverage

**iOS**:
- iPhone SE (small screen)
- iPhone 13/14 (standard size)
- iPhone 14 Pro Max (large screen)
- iPad (if tablet support is planned)
- iOS 13.4 (minimum supported version)
- Latest iOS version

**Android**:
- Budget device (e.g., Samsung A series)
- Mid-range device (e.g., Pixel 6a)
- Flagship device (e.g., Samsung S23)
- Tablet (if tablet support is planned)
- Android 5.0 / API 21 (minimum supported version)
- Latest Android version

## Monitoring and Debugging

### Viewing Logs

**iOS (via Xcode)**:
1. Connect device to Mac
2. Open Xcode > Window > Devices and Simulators
3. Select device > View Device Logs

**Android (via ADB)**:
```bash
adb logcat | grep "PlayBeacon"
```

### Crash Reporting
Consider integrating crash reporting services:
- [Sentry](https://sentry.io/)
- [Firebase Crashlytics](https://firebase.google.com/products/crashlytics)
- [Bugsnag](https://www.bugsnag.com/)

### Performance Monitoring
- [Firebase Performance Monitoring](https://firebase.google.com/products/performance)
- [Expo Application Services Analytics](https://docs.expo.dev/eas/insights/)

## Collecting Feedback

### Internal Testing Feedback Template

Create a feedback form for testers to report:
1. Device information (model, OS version)
2. Issue description
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots/screen recordings
6. Severity (critical, major, minor, cosmetic)

### Tools for Feedback Collection
- Google Forms
- TestFlight feedback (built-in)
- Play Console feedback (built-in)
- Slack channel for testers
- GitHub Issues (for technical testers)

## Build Iterations

After receiving feedback:

1. **Fix critical issues**:
   - Crashes
   - Data loss
   - Security vulnerabilities
   - Broken core features

2. **Create new build**:
   ```bash
   eas build --platform all --profile preview
   ```

3. **Update version numbers** in app.json:
   ```json
   {
     "version": "1.0.1",
     "ios": { "buildNumber": "1.0.1" },
     "android": { "versionCode": 2 }
   }
   ```

4. **Re-test** critical fixes

5. **Iterate** until all critical issues are resolved

## Pre-Submission Checklist

Before submitting to app stores:
- [ ] All critical bugs are fixed
- [ ] App has been tested on minimum OS versions
- [ ] App has been tested on various device sizes
- [ ] Performance is acceptable on low-end devices
- [ ] App complies with platform guidelines
- [ ] Privacy policy is included (if collecting user data)
- [ ] Terms of service are included (if applicable)
- [ ] App store listing is prepared (screenshots, descriptions)
- [ ] All placeholder content is replaced with final content
- [ ] Version numbers are correctly incremented
- [ ] Release notes are prepared

## Troubleshooting

### Build Fails
```bash
# Check build logs
eas build:view [BUILD_ID]

# Clear cache and retry
eas build --clear-cache --platform ios
```

### Can't Install on Device
- **iOS**: Verify device UDID is registered
- **Android**: Enable "Install from unknown sources"
- Check for conflicting app signatures

### App Crashes Immediately
- Check device logs
- Verify all dependencies are compatible
- Test on different device/OS version
- Check for missing permissions

### Performance Issues
- Use React DevTools Profiler
- Check for memory leaks
- Optimize images and assets
- Review network requests

## Resources

- [Expo Testing Documentation](https://docs.expo.dev/build/introduction/)
- [iOS Testing Guidelines](https://developer.apple.com/testflight/)
- [Android Testing Guidelines](https://developer.android.com/studio/test)
- [React Native Performance](https://reactnative.dev/docs/performance)
