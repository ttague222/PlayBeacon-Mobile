# CI/CD Setup Guide

This guide explains the automated build pipeline configuration for PlayBeacon mobile app.

## Overview

The PlayBeacon mobile app uses **GitHub Actions** and **EAS Build** to automate the build and deployment process. This allows for:

- Automated builds on every push to main branches
- Manual builds triggered via GitHub UI
- Automatic submission to app stores
- Build status tracking via PR comments

## Pipeline Architecture

```
GitHub Push/PR
    ↓
GitHub Actions Workflow
    ↓
EAS Build (Expo servers)
    ↓
App Store / Play Store (auto-submit)
```

## GitHub Actions Workflow

### Workflow File

Location: `.github/workflows/eas-build.yml`

### Triggers

The workflow runs on:
1. **Push** to main, master, or develop branches
2. **Pull requests** to main or master branches
3. **Manual dispatch** (via GitHub Actions UI)

### Manual Builds

To trigger a manual build:
1. Go to GitHub repository > Actions tab
2. Select "EAS Build" workflow
3. Click "Run workflow"
4. Choose platform (ios/android/all) and profile (development/preview/production)
5. Click "Run workflow"

## Required Secrets

### Setting up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:

#### EXPO_TOKEN (Required)

Generate an Expo access token:

```bash
# Login to Expo CLI
eas login

# Generate token
eas build:configure

# Or create a token manually at:
# https://expo.dev/accounts/[username]/settings/access-tokens
```

Add the token as `EXPO_TOKEN` in GitHub secrets.

## Build Profiles

### Development Profile
- For internal testing
- Includes debug features
- iOS simulator support
- **Not** auto-submitted to stores

**Trigger**: Manual dispatch or push to develop branch

### Preview Profile
- For beta testing
- Production-like configuration
- **Auto-submitted** to TestFlight/Internal Testing
- No simulator support

**Trigger**: Manual dispatch or push to main/master branch

### Production Profile
- For app store releases
- Optimized builds
- **Auto-submitted** to app stores
- **Manual trigger only** (requires explicit approval)

**Trigger**: Manual dispatch only

## Workflow Steps

### 1. Checkout Code
```yaml
- uses: actions/checkout@v4
```
Checks out the repository code.

### 2. Setup Node.js
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'
```
Sets up Node.js environment with npm caching.

### 3. Setup Expo and EAS
```yaml
- uses: expo/expo-github-action@v8
  with:
    eas-version: latest
    token: ${{ secrets.EXPO_TOKEN }}
```
Configures EAS CLI with authentication.

### 4. Install Dependencies
```yaml
- run: npm ci
```
Installs all npm dependencies from package-lock.json.

### 5. Verify Configuration
```yaml
- run: npx expo config --type public
```
Validates app.json and eas.json configuration.

### 6. Build on EAS
```yaml
- run: eas build --platform $PLATFORM --profile $PROFILE
```
Triggers the build on Expo Application Services.

### 7. Comment PR (for PRs only)
```yaml
- uses: actions/github-script@v7
```
Posts a comment on pull requests with build status and link.

## Auto-Submission

The workflow automatically submits builds to app stores for **preview** and **production** profiles:

- **iOS**: Submitted to TestFlight
- **Android**: Submitted to Play Console internal testing track

This requires:
- App Store Connect credentials (configured in eas.json)
- Google Play service account (configured in eas.json)

## Monitoring Builds

### Via GitHub Actions
- View workflow runs in the Actions tab
- See real-time logs and status

### Via Expo Dashboard
- Visit: https://expo.dev/accounts/[username]/projects/playbeacon/builds
- View detailed build logs
- Download build artifacts
- Access submitted builds

## Customizing the Workflow

### Change Trigger Branches

Edit [.github/workflows/eas-build.yml](.github/workflows/eas-build.yml:1):

```yaml
on:
  push:
    branches:
      - main        # Add or remove branches
      - staging
```

### Add Build Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Build completed: ${{ github.sha }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Add Tests Before Build

Insert before the build step:

```yaml
- name: Run tests
  run: npm test

- name: Run linter
  run: npm run lint
```

### Build Only on Version Changes

Check if version changed before building:

```yaml
- name: Check version change
  id: version
  run: |
    VERSION_CHANGED=$(git diff HEAD~1 app.json | grep '"version"')
    echo "changed=$VERSION_CHANGED" >> $GITHUB_OUTPUT

- name: Build on EAS
  if: steps.version.outputs.changed != ''
  run: eas build ...
```

## Local Testing

Test the workflow locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
choco install act  # Windows

# Run workflow locally
act push

# Test specific job
act -j build
```

## Environment Variables

### Available in Workflow

- `${{ github.event_name }}` - Event that triggered workflow
- `${{ github.ref }}` - Branch or tag ref
- `${{ github.sha }}` - Commit SHA
- `${{ github.actor }}` - User who triggered workflow

### Adding Custom Environment Variables

```yaml
env:
  API_URL: https://api.playbeacon.com
  BUILD_NUMBER: ${{ github.run_number }}
```

## Branch Protection Rules

Recommend setting up branch protection for production:

1. Go to Settings > Branches
2. Add rule for `main` or `master`
3. Enable:
   - Require pull request reviews
   - Require status checks (EAS Build)
   - Require branches to be up to date

## Cost Optimization

### EAS Build Credits
- Free tier: 30 builds/month
- Priority builds: Additional cost
- Resource classes affect cost

**Optimization strategies**:
1. Use `--no-wait` flag to avoid waiting in CI
2. Build only on version changes
3. Use development builds for testing
4. Limit automatic builds to main branches

### GitHub Actions Minutes
- Free tier: 2000 minutes/month (public repos)
- Private repos: 2000 minutes/month

**Optimization strategies**:
1. Use caching for npm dependencies
2. Use `npm ci` instead of `npm install`
3. Limit workflow triggers
4. Use self-hosted runners for private repos

## Troubleshooting

### Build Fails - EXPO_TOKEN Invalid
```
Error: Authentication failed
```

**Solution**:
1. Generate new token: `eas build:configure`
2. Update GitHub secret with new token
3. Retry build

### Build Fails - Missing Configuration
```
Error: eas.json not found
```

**Solution**:
1. Ensure `eas.json` is committed to repository
2. Check file is in root directory
3. Verify file format is valid JSON

### Workflow Not Triggering
```
No workflow runs appear
```

**Solution**:
1. Check workflow file is in `.github/workflows/`
2. Verify YAML syntax is valid
3. Ensure push is to correct branch
4. Check repository has Actions enabled

### Auto-Submit Fails
```
Error: Missing credentials
```

**Solution**:
1. Verify credentials in `eas.json`
2. Check service account has correct permissions
3. Ensure app exists in store console

## Security Best Practices

1. **Never commit secrets**
   - Use GitHub Secrets for all sensitive data
   - Add secrets to `.gitignore`

2. **Limit workflow permissions**
   ```yaml
   permissions:
     contents: read  # Minimum required
   ```

3. **Use dependabot for dependencies**
   - Enable Dependabot in repository settings
   - Keep dependencies up to date

4. **Review third-party actions**
   - Use official actions when possible
   - Pin actions to specific versions
   - Review action source code

## Advanced Configuration

### Multi-Environment Builds

Build different configurations based on branch:

```yaml
- name: Determine environment
  id: env
  run: |
    if [ "${{ github.ref }}" = "refs/heads/main" ]; then
      echo "environment=production" >> $GITHUB_OUTPUT
    else
      echo "environment=staging" >> $GITHUB_OUTPUT
    fi

- name: Build with environment
  run: eas build --profile ${{ steps.env.outputs.environment }}
```

### Parallel Builds

Build iOS and Android simultaneously:

```yaml
strategy:
  matrix:
    platform: [ios, android]

steps:
  - run: eas build --platform ${{ matrix.platform }}
```

### Build Artifacts

Save and upload build artifacts:

```yaml
- name: Download build
  run: eas build:download --latest

- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: app-builds
    path: '*.ipa,*.apk,*.aab'
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo GitHub Action](https://github.com/expo/expo-github-action)
- [CI/CD Best Practices](https://docs.expo.dev/build-reference/ci/)
