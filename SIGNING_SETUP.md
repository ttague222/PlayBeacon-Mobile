# App Signing Setup Guide

This guide explains how to set up app signing for PlayBeacon mobile app on both iOS and Android platforms.

## Prerequisites

Before you begin, ensure you have:
- An active Expo account
- Apple Developer account (for iOS)
- Google Play Console account (for Android)

## Quick Start

1. **Create EAS Account and Project**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS project
eas build:configure
```

2. **Update Configuration Files**
   - Update `app.json` with your Expo project ID
   - Update `eas.json` with your credentials

## iOS Setup

### Option 1: Let EAS Manage Signing (Recommended)

EAS can automatically create and manage your iOS certificates and provisioning profiles.

```bash
# Build for iOS (EAS will prompt for credentials)
eas build --platform ios --profile production
```

EAS will:
- Create an Apple Distribution Certificate
- Generate a Provisioning Profile
- Store them securely in Expo's servers

### Option 2: Manual Certificate Management

If you prefer to manage certificates yourself:

1. **Create Distribution Certificate**
   - Go to [Apple Developer Portal](https://developer.apple.com/account)
   - Navigate to Certificates, Identifiers & Profiles
   - Create a new iOS Distribution certificate
   - Download the certificate (.p12 file)

2. **Create App ID**
   - Create an App ID with identifier: `com.playbeacon.app`
   - Enable required capabilities (Push Notifications, etc.)

3. **Create Provisioning Profile**
   - Create a new App Store provisioning profile
   - Associate it with your App ID and Distribution Certificate
   - Download the profile (.mobileprovision file)

4. **Configure credentials.json**
   - Copy `credentials.example.json` to `credentials.json`
   - Fill in your Apple Developer credentials:
     ```json
     {
       "ios": {
         "appleId": "your-email@example.com",
         "appleTeamId": "TEAM_ID_HERE",
         "ascAppId": "ASC_APP_ID_HERE",
         "distributionCertificate": {
           "path": "path/to/cert.p12",
           "password": "CERTIFICATE_PASSWORD"
         },
         "provisioningProfilePath": "path/to/profile.mobileprovision"
       }
     }
     ```

5. **Update eas.json**
   - Add your Apple ID and Team ID in the `submit.production.ios` section

## Android Setup

### Option 1: Let EAS Manage Signing (Recommended)

```bash
# Build for Android (EAS will create keystore)
eas build --platform android --profile production
```

EAS will automatically:
- Generate a new keystore
- Store it securely
- Use it for all future builds

### Option 2: Manual Keystore Management

If you already have a keystore or want to create one manually:

1. **Create Keystore**
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore playbeacon-release.keystore \
  -alias playbeacon-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

2. **Configure credentials.json**
   - Copy `credentials.example.json` to `credentials.json`
   - Fill in your keystore details:
     ```json
     {
       "android": {
         "keystore": {
           "keystorePath": "playbeacon-release.keystore",
           "keystorePassword": "YOUR_KEYSTORE_PASSWORD",
           "keyAlias": "playbeacon-key-alias",
           "keyPassword": "YOUR_KEY_PASSWORD"
         }
       }
     }
     ```

3. **Upload to EAS**
```bash
eas credentials --platform android
```

## Google Play Store Service Account

For automated submissions to Google Play Store:

1. **Create Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new service account
   - Grant necessary permissions for Play Store

2. **Download Service Account Key**
   - Download the JSON key file
   - Save it as `playbeacon-play-store-service-account.json`

3. **Configure eas.json**
   - The `submit.production.android.serviceAccountKeyPath` is already set
   - Ensure the JSON file is in the root directory

## App Store Connect Setup

For automated submissions to Apple App Store:

1. **Get App Store Connect Credentials**
   - Log in to [App Store Connect](https://appstoreconnect.apple.com/)
   - Create your app listing
   - Note down your App ID (ASC App ID)

2. **Update eas.json**
   - Fill in `appleId`, `ascAppId`, and `appleTeamId` in the iOS submit configuration

## Building Apps

### Development Build
```bash
# iOS
eas build --platform ios --profile development

# Android
eas build --platform android --profile development
```

### Preview Build
```bash
# iOS
eas build --platform ios --profile preview

# Android
eas build --platform android --profile preview
```

### Production Build
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Submitting to App Stores

### Submit to Google Play Store
```bash
eas submit --platform android --latest
```

### Submit to Apple App Store
```bash
eas submit --platform ios --latest
```

## Security Best Practices

1. **Never commit sensitive files to git**
   - `credentials.json` is already in `.gitignore`
   - All keystores, certificates, and service account keys are ignored
   - Use `credentials.example.json` as a template only

2. **Store credentials securely**
   - Use EAS Secrets for sensitive values
   - Keep keystores backed up in a secure location
   - Use password managers for passwords

3. **Rotate credentials regularly**
   - Update service account keys annually
   - Regenerate certificates before expiration

## Troubleshooting

### iOS Build Fails
- Verify Apple Developer account is active
- Check that bundle identifier matches in all configs
- Ensure certificates haven't expired

### Android Build Fails
- Verify keystore password is correct
- Check that package name matches in all configs
- Ensure JDK version is compatible

### Submission Fails
- Verify app listing exists in store console
- Check that all required metadata is filled
- Ensure app version is incremented

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Apple Developer Portal](https://developer.apple.com/)
- [Google Play Console](https://play.google.com/console/)
