# PlayBeacon App Store Submission Guide

## Temporarily Disabled Features

### Roblox Import (Pending Approval)
The Roblox account linking and game import feature has been **temporarily disabled** pending approval from Roblox Corporation. This affects:
- RobloxImportScreen (onboarding flow)
- Profile Screen "Link Roblox Account" button
- Related API methods and validation utilities

**Files with commented code (search for "TEMPORARILY DISABLED: Roblox import"):**
- `src/navigation/AppNavigator.js`
- `src/screens/ProfileScreen.js`
- `src/screens/TutorialScreen.js`
- `src/services/api.js`
- `src/utils/validation.js`
- `src/__tests__/services/api.test.js`

**To re-enable after Roblox approval:**
1. Search codebase for: `TEMPORARILY DISABLED: Roblox import feature pending Roblox approval`
2. Uncomment all the marked code sections
3. Test the feature thoroughly before resubmitting

---

## App Review Notes

Copy and paste this into the "Notes for Reviewers" section in App Store Connect:

---

### In-App Purchase Testing

To test the "Remove Ads" in-app purchase:

1. Open the app
2. Tap the profile icon in the top-right corner of the home screen
3. Scroll down and tap "Go Ad-Free" (shows a star icon)
4. You will see the Premium Upgrade screen
5. Hold the "Press & Hold to Continue" button for 3 seconds (Parental Gate)
6. Tap "Unlock Ad-Free Experience"

**Note:** Ads are currently disabled during review. The in-app purchase can still be tested. After approval, we will enable ads via remote configuration.

### Test Account (if needed)

This app supports anonymous play without requiring an account.

### Parental Gate

All in-app purchases require parental verification via a 3-second press-and-hold mechanism as required for COPPA compliance.

### COPPA Compliance

- App is designed for children under 13
- All ads are configured for child-directed treatment (COPPA-compliant)
- No personal data collection without parental consent
- App Tracking Transparency prompt uses child-appropriate language

---

## Remote Configuration

### Current Settings (For App Store Review)

```
ads_enabled: false       ← Ads disabled during review
ads_test_mode: true      ← Would use test ads if enabled
```

### Post-Approval Settings

```
ads_enabled: true        ← Enable real ads
ads_test_mode: false     ← Use production ad units
```

## Post-Approval Deployment Checklist

After Apple approves the app, follow these steps before releasing:

### 1. Verify IAP is Ready
- [ ] Confirm IAP (com.playbeacon.app.removeads3) status is "Ready to Submit" or "Approved"
- [ ] Ensure IAP localization is complete and not "Rejected"

### 2. Enable Ads via Remote Config
You have two options:

**Option A: API Endpoint (if configured)**
Update your remote config endpoint to return:
```json
{
  "ads_enabled": true,
  "ads_test_mode": false
}
```

**Option B: Code Update + EAS Update (no new build needed)**
1. Update `src/services/RemoteConfig.js`:
   ```javascript
   const DEFAULT_CONFIG = {
     ads_enabled: true,           // Changed from false
     ads_test_mode: false,        // Changed from true
     min_app_version: '1.0.0',
     maintenance_mode: false,
   };
   ```
2. Push the update via EAS Update:
   ```bash
   npx eas update --branch production --message "Enable ads post-approval"
   ```

### 3. Verify Ad Unit IDs
- [ ] Confirm production AdMob App IDs are set in `app.json`:
  - iOS: `ca-app-pub-6866584041914873~6185141102`
  - Android: `ca-app-pub-6866584041914873~1187787683`
- [ ] Verify ad unit environment variables are configured in EAS secrets

### 4. Test Before Release
- [ ] Download the approved build from TestFlight/App Store Connect
- [ ] Verify ads appear after 20 games (free period)
- [ ] Test the IAP purchase flow works
- [ ] Verify premium users don't see ads

### 5. Release
- [ ] Release the app from App Store Connect
- [ ] Monitor crash reports and ad revenue in AdMob dashboard

## Ad Behavior Summary

| Condition | Ads Shown |
|-----------|-----------|
| During App Review | No (disabled via remote config) |
| First 20 games/day | No (free period) |
| After 20 games | Yes (every 5 games) |
| Premium user | No (purchased ad-free) |
| Expo Go development | No (native modules unavailable) |

## Files Modified for This Feature

- `src/services/RemoteConfig.js` - Remote config service
- `src/context/AdContext.js` - Ad context with remote config integration
- `src/config/admob.js` - Test mode support
- `app.json` - ATT description updated
- `app.config.js` - ATT description (already correct)

## Troubleshooting

### Ads Not Appearing After Approval
1. Check RemoteConfig defaults: `ads_enabled` should be `true`
2. Verify EAS Update was published to production channel
3. Check AdMob dashboard for fill rate issues
4. Verify ad unit IDs match those in AdMob console

### IAP Not Working
1. Verify product ID matches: `com.playbeacon.app.removeads3`
2. Check IAP status in App Store Connect (should be "Ready for Sale")
3. Ensure localization is not in "Rejected" state
4. For sandbox testing, use a Sandbox Apple ID
