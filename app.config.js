export default ({ config }) => {
  const env = process.env.APP_ENV || 'development';

  return {
    ...config,
    name: 'PlayBeacon',
    slug: 'playbeacon',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.playbeacon.app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSUserTrackingUsageDescription: 'PlayBeacon shows non-personalized ads. This permission helps measure ad effectiveness without tracking you personally.',
        SKAdNetworkItems: [
          { SKAdNetworkIdentifier: 'cstr6suwn9.skadnetwork' },
          { SKAdNetworkIdentifier: '4fzdc2evr5.skadnetwork' },
          { SKAdNetworkIdentifier: '2fnua5tdw4.skadnetwork' },
          { SKAdNetworkIdentifier: 'ydx93a7ass.skadnetwork' },
          { SKAdNetworkIdentifier: '5a6flpkh64.skadnetwork' },
          { SKAdNetworkIdentifier: 'p78axxw29g.skadnetwork' },
          { SKAdNetworkIdentifier: 'v72qych5uu.skadnetwork' },
          { SKAdNetworkIdentifier: 'c6k4g5qg8m.skadnetwork' },
          { SKAdNetworkIdentifier: 's39g8k73mm.skadnetwork' },
          { SKAdNetworkIdentifier: '3qy4746246.skadnetwork' },
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.playbeacon.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
          },
          ios: {
            deploymentTarget: '15.1',
          },
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          // Use production App IDs from env vars, fall back to test IDs for development
          androidAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || 'ca-app-pub-3940256099942544~3347511713',
          iosAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || 'ca-app-pub-3940256099942544~1458002511',
          userTrackingUsageDescription: 'PlayBeacon shows non-personalized ads. This permission helps measure ad effectiveness without tracking you personally.',
        },
      ],
      'expo-tracking-transparency',
      'react-native-iap',
      'expo-secure-store',
    ],
    extra: {
      env,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      eas: {
        projectId: '23865d64-b2c1-4555-89f6-e85e795bc696',
      },
    },
    updates: {
      url: 'https://u.expo.dev/23865d64-b2c1-4555-89f6-e85e795bc696',
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: '1.0.0',
  };
};
