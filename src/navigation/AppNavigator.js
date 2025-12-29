import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { getTutorialCompleted } from '../utils/tutorialStorage';
import { getAgeVerificationStatus } from '../utils/ageVerification';
import { api } from '../services/api';
import SoundManager from '../services/SoundManager';
import OfflineBanner from '../components/OfflineBanner';
import logger from '../utils/logger';
import { UnlockModalManager } from '../components/badges';

// Import screens
import AgeVerificationScreen from '../screens/AgeVerificationScreen';
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for authenticated users
const MainTabs = () => {
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
          tabBarLabel: 'Discover',
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
          tabBarLabel: 'Collections',
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
          tabBarLabel: 'Tasks',
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
          tabBarLabel: 'Badges',
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
// COPPA-compliant: Users are automatically signed in anonymously
// No login required for any features - Google sign-in is optional and parent-gated
export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [ageVerified, setAgeVerified] = useState(null); // null = checking
  const [tutorialCompleted, setTutorialCompleted] = useState(null); // null = checking
  // TEMPORARILY DISABLED: Roblox import feature pending Roblox approval
  // const [hasCompletedImport, setHasCompletedImport] = useState(null); // null = checking
  const hasCompletedImport = true; // Skip Roblox import screen

  // Check age verification, tutorial, and import status in parallel once auth is ready
  useEffect(() => {
    const initializeAppState = async () => {
      // Start age verification check (local storage - fast)
      const agePromise = getAgeVerificationStatus()
        .then(status => status !== null)
        .catch(() => false);

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

      // Wait for all to complete in parallel
      const [ageResult, tutorialResult] = await Promise.all([
        agePromise,
        tutorialPromise,
      ]);

      setAgeVerified(ageResult);
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
  // TEMPORARILY DISABLED: Removed hasCompletedImport check - Roblox import pending approval
  const isInitializing = loading || ageVerified === null || tutorialCompleted === null;

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
        {!ageVerified ? (
          <Stack.Screen name="AgeVerification">
            {(props) => <AgeVerificationScreen {...props} onComplete={() => setAgeVerified(true)} />}
          </Stack.Screen>
        ) : !tutorialCompleted ? (
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
          </>
        )}
      </Stack.Navigator>
      {/* UnlockModalManager must be inside NavigationContainer to access navigation */}
      <UnlockModalManager />
    </NavigationContainer>
  );
}
