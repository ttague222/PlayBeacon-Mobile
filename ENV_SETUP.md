# Environment Configuration Guide

This document explains how to set up and manage environment variables for the PlayBeacon mobile app.

## Overview

The app uses different environment configurations for development and production:

- **Development**: Local development with localhost API
- **Production**: Production deployment with live API

## Files

- `app.config.js` - Dynamic configuration that reads from environment variables
- `.env` - Current environment (auto-loaded, git-ignored)
- `.env.development` - Development environment template (git-ignored)
- `.env.production.example` - Production environment template (committed to git as example)
- `.env.production` - Production environment (git-ignored, create from example)

## Setup Instructions

### For Development

1. Copy your current `.env` to `.env.development` (already done):
   ```bash
   cp .env .env.development
   ```

2. The app will automatically use `.env` for local development

### For Production

1. Create a production environment file:
   ```bash
   cp .env.production.example .env.production
   ```

2. Fill in your production values in `.env.production`:
   - Set up a separate Firebase project for production
   - Configure production API endpoint
   - Add production OAuth credentials

3. When building for production, use:
   ```bash
   APP_ENV=production npx expo build
   ```

## Environment Variables

### Required Variables

- `APP_ENV` - Environment name (development, production, staging)
- `EXPO_PUBLIC_API_BASE_URL` - API endpoint URL
- `EXPO_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

### Optional Variables

- `EAS_PROJECT_ID` - Expo Application Services project ID (for production builds)

## Security Best Practices

1. **Never commit sensitive files**:
   - `.env`
   - `.env.development`
   - `.env.production`
   - `.env.staging`

2. **Use separate Firebase projects**:
   - Development Firebase project for testing
   - Production Firebase project for live users

3. **Rotate credentials regularly**:
   - Change API keys every 90 days
   - Update OAuth credentials when team members leave

4. **Limit credential access**:
   - Only share production credentials with necessary team members
   - Use Firebase security rules to limit access

## Switching Environments

To switch between environments, copy the desired environment file to `.env`:

```bash
# Switch to development
cp .env.development .env

# Switch to production
cp .env.production .env
```

Or set the `APP_ENV` variable when running commands:

```bash
APP_ENV=production npx expo start
```

## Troubleshooting

### App can't connect to API
- Check `EXPO_PUBLIC_API_BASE_URL` is correct
- Verify the API server is running
- Check network/firewall settings

### Firebase authentication fails
- Verify all Firebase config variables are correct
- Check Firebase project settings match the environment
- Ensure OAuth credentials are configured in Firebase Console

### Build fails
- Ensure all required variables are set
- Check for syntax errors in `.env` files
- Verify app.config.js can read the variables
