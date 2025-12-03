# PlayBeacon Mobile App

A React Native mobile app for discovering and exploring Roblox games. Built with Expo for cross-platform support (iOS & Android).

## 🎯 Features

- **Onboarding Flow**: Welcome screen and authentication
- **Game Discovery Queue**: Swipe interface (like/skip/dislike) for personalized recommendations
- **Browse Games**: Grid view of all available games
- **User Profile**: Account management and preferences
- **Firebase Authentication**: Secure user authentication
- **Real-time Data**: Live game recommendations from crawler service
- **Native UI**: Platform-specific components for iOS and Android

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Firebase project with Authentication enabled
- Access to PlayBeacon crawler-service API

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mobile-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Crawler Service API
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 4. Start Development Server

```bash
npm start
```

Then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator  
- Press `w` to open in web browser
- Scan QR code with Expo Go app on physical device

## 🏗️ Project Structure

```
mobile-app/
├── src/
│   ├── screens/              # Screen components
│   │   ├── OnboardingScreen.js    # Welcome/intro screen
│   │   ├── LoginScreen.js         # Authentication
│   │   ├── QueueScreen.js         # Swipe discovery interface
│   │   ├── RecommendationsScreen.js # Browse all games
│   │   └── ProfileScreen.js       # User profile
│   ├── navigation/           # Navigation setup
│   │   └── AppNavigator.js   # Stack & tab navigation
│   ├── context/              # React context
│   │   └── AuthContext.js    # Firebase auth state
│   ├── services/             # API services
│   │   └── api.js            # Crawler service client
│   ├── config/               # Configuration
│   │   └── firebase.js       # Firebase initialization
│   ├── components/           # Reusable components
│   └── utils/                # Helper functions
├── App.js                    # App entry point
├── package.json              # Dependencies
└── app.json                  # Expo configuration
```

## 📱 Screens

### Onboarding Screen
- Welcome message and branding
- Get started button
- Leads to login/registration

### Login Screen
- Email/password authentication
- Toggle between login and registration
- Firebase Auth integration

### Queue Screen (Discover)
- Swipe-style game discovery
- Three actions: Like ❤️, Skip →, Dislike ✗
- Personalized recommendations
- Card-based UI with game details
- Auto-loads next batch when queue runs low

### Recommendations Screen (Browse)
- Grid view of all games
- Game thumbnails and metadata
- Tap to view details
- Infinite scroll loading

### Profile Screen
- User email display
- Account settings (placeholder)
- Logout functionality

## 🔌 API Integration

The mobile app connects to the crawler-service REST API:

### Endpoints Used:
- `POST /api/queue` - Get personalized game queue
- `POST /api/feedback` - Submit like/skip/dislike
- `GET /api/games` - Browse all games
- `GET /api/games/{id}` - Get game details
- `GET /api/recommendations/{id}` - Get similar games

Authentication tokens are automatically included in all requests via axios interceptors.

## 🎨 Design System

### Colors
- Background: `#1A1A1A` (dark)
- Cards: `#2A2A2A` (gray)
- Primary: `#FF6B6B` (coral red)
- Text: `#FFFFFF` (white)
- Secondary Text: `#999999` (gray)

### Typography
- Headers: 24-32px bold
- Body: 14-16px regular
- Captions: 11-12px

## 🚀 Running the App

### Development Mode

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run in web browser
npm run web
```

### Testing on Physical Device

1. Install "Expo Go" app from App Store/Play Store
2. Scan QR code from terminal
3. App will load on your device

## 📦 Building for Production

### iOS (requires macOS)

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

### Using EAS Build (recommended)

```bash
npm install -g eas-cli
eas build:configure
eas build --platform all
```

## 🔐 Authentication

Firebase Authentication handles user management:
- Email/password sign-in
- Persistent sessions
- Automatic token refresh
- Secure API communication

## 🤝 Integration with Other Services

### Crawler Service
The mobile app consumes the crawler-service REST API for all game data and recommendations.

### Web Admin
Shares the same Firebase backend and data schema with the web admin dashboard.

### Shared Data
All apps read from Firestore collections:
- `games` - Game metadata
- `users` - User profiles
- `user_activity` - Interaction logs

## 🐛 Debugging

### View Logs

```bash
# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android
```

### Common Issues

**Metro bundler issues:**
```bash
expo start -c  # Clear cache
```

**Dependencies issues:**
```bash
rm -rf node_modules
npm install
```

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors

PlayBeacon Team

## 📞 Support

For issues and questions, please open a GitHub issue or contact support@playbeacon.app
