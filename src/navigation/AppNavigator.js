import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { getTutorialCompleted } from '../utils/tutorialStorage';
// TEMPORARILY DISABLED: Age verification not needed for 16+ rating
// import { getAgeVerificationStatus } from '../utils/ageVerification';
import { api } from '../services/api';
import SoundManager from '../services/SoundManager';
import OfflineBanner from '../components/OfflineBanner';
import logger from '../utils/logger';
import { UnlockModalManager } from '../components/badges';

// Import screens
// TEMPORARILY DISABLED: Age verification not needed for 16+ rating
// import AgeVerificationScreen from '../screens/AgeVerificationScreen';
import TutorialScreen from '../screens/TutorialScreen';
// TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
// import RobloxImportScreen from '../screens/RobloxImportScreen';
import QueueScreen from '../screens/QueueScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import TasksScreen from '../screens/TasksScreen';
import BadgesScreen from '../screens/BadgesScreen';
import CollectablesScreen from '../screens/CollectablesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';
import EmailSignInScreen from '../screens/EmailSignInScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for authenticated users
const MainTabs = () => {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <OfflineBanner />
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tab.active,
        tabBarInactiveTintColor: colors.tab.inactive,
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.divider,
        },
        tabBarHideOnKeyboard: true,
      }}
      screenListeners={{
        tabPress: () => {
          SoundManager.play('ui.tap');
        },
      }}
    >
      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          tabBarLabel: t('navigation.discover'),
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'play-circle' : 'play-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{
          tabBarLabel: t('navigation.collections'),
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'albums' : 'albums-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: t('navigation.tasks'),
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'checkbox' : 'checkbox-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Badges"
        component={BadgesScreen}
        options={{
          tabBarLabel: t('navigation.badges'),
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'ribbon' : 'ribbon-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
    </View>
  );
};

// Root navigation
// Users are automatically signed in anonymously
// No login required for any features - email sign-in is optional
export default function AppNavigator() {
  const { user, loading } = useAuth();
  // TEMPORARILY DISABLED: Age verification not needed for 16+ rating
  // const [ageVerified, setAgeVerified] = useState(null); // null = checking
  const ageVerified = true; // Skip age verification for 16+ rated app
  const [tutorialCompleted, setTutorialCompleted] = useState(null); // null = checking
  // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
  // const [hasCompletedImport, setHasCompletedImport] = useState(null); // null = checking
  const hasCompletedImport = true; // Skip Roblox import screen

  // Check tutorial and import status once auth is ready
  useEffect(() => {
    const initializeAppState = async () => {
      // TEMPORARILY DISABLED: Age verification not needed for 16+ rating
      // const agePromise = getAgeVerificationStatus()
      //   .then(status => status !== null)
      //   .catch(() => false);

      // Start tutorial check immediately (local storage - fast)
      const tutorialPromise = getTutorialCompleted().catch(() => false);

      // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
      // Start import status check if user exists (API call)
      // const importPromise = user
      //   ? api.getUserStats()
      //       .then(stats => stats.has_completed_import || false)
      //       .catch(error => {
      //         if (error.response?.status !== 401) {
      //           logger.error('Error checking import status:', error);
      //         }
      //         return false;
      //       })
      //   : Promise.resolve(false);

      // Wait for tutorial check to complete
      const tutorialResult = await tutorialPromise;

      // setAgeVerified(ageResult);
      setTutorialCompleted(tutorialResult);
      // setHasCompletedImport(importResult);

      // Track daily login in background (non-blocking)
      if (user) {
        api.updateDailyLogin().catch(error => {
          logger.log('Daily login tracking failed:', error.message);
        });
      }
    };

    // Only run when auth loading is complete
    if (!loading) {
      initializeAppState();
    }
  }, [user, loading]);

  // Show loading while auth or app state is initializing
  // TEMPORARILY DISABLED: Removed ageVerified and hasCompletedImport checks
  const isInitializing = loading || tutorialCompleted === null;

  if (isInitializing || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* TEMPORARILY DISABLED: Age verification not needed for 16+ rating */}
        {/* {!ageVerified ? (
          <Stack.Screen name="AgeVerification">
            {(props) => <AgeVerificationScreen {...props} onComplete={() => setAgeVerified(true)} />}
          </Stack.Screen>
        ) : */ !tutorialCompleted ? (
          <Stack.Screen name="Tutorial">
            {(props) => <TutorialScreen {...props} onComplete={() => setTutorialCompleted(true)} />}
          </Stack.Screen>
        ) : (
          // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
          // ) : !hasCompletedImport ? (
          //   <Stack.Screen name="RobloxImport">
          //     {(props) => <RobloxImportScreen {...props} onImportComplete={() => setHasCompletedImport(true)} />}
          //   </Stack.Screen>
          // ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
            <Stack.Screen name="Collectables" component={CollectablesScreen} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="Premium"
              component={PremiumUpgradeScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="EmailSignIn"
              component={EmailSignInScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
      {/* UnlockModalManager must be inside NavigationContainer to access navigation */}
      <UnlockModalManager />
    </NavigationContainer>
  );
}
