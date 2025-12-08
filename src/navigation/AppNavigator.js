import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { getTutorialCompleted } from '../utils/tutorialStorage';
import { api } from '../services/api';

// Import screens
import TutorialScreen from '../screens/TutorialScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RobloxImportScreen from '../screens/RobloxImportScreen';
import QueueScreen from '../screens/QueueScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import TasksScreen from '../screens/TasksScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for authenticated users
const MainTabs = () => {
  return (
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
        name="Achievements"
        component={AchievementsScreen}
        options={{
          tabBarLabel: 'Achievements',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'trophy' : 'trophy-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigation
export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [checkingTutorial, setCheckingTutorial] = useState(true);
  const [hasCompletedImport, setHasCompletedImport] = useState(false);
  const [checkingImportStatus, setCheckingImportStatus] = useState(false);

  useEffect(() => {
    const checkTutorial = async () => {
      const completed = await getTutorialCompleted();
      setTutorialCompleted(completed);
      setCheckingTutorial(false);
    };
    checkTutorial();
  }, []);

  useEffect(() => {
    const checkImportStatus = async () => {
      if (user && !user.isAnonymous) {
        try {
          setCheckingImportStatus(true);
          const stats = await api.getUserStats();
          setHasCompletedImport(stats.has_completed_import || false);

          // Track daily login for achievements
          try {
            await api.updateDailyLogin();
          } catch (loginError) {
            // Silently fail - don't block app loading
            console.log('Daily login tracking failed:', loginError.message);
          }
        } catch (error) {
          // Silently handle auth errors - user may not be fully authenticated yet
          if (error.response?.status === 401) {
            setHasCompletedImport(false);
          } else {
            console.error('Error checking import status:', error);
            setHasCompletedImport(false);
          }
        } finally {
          setCheckingImportStatus(false);
        }
      } else {
        // No user or anonymous user - default to not completed
        setHasCompletedImport(false);
        setCheckingImportStatus(false);
      }
    };
    checkImportStatus();
  }, [user]);

  if (loading || checkingTutorial || checkingImportStatus) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!tutorialCompleted ? (
          <Stack.Screen name="Tutorial">
            {(props) => <TutorialScreen {...props} onComplete={() => setTutorialCompleted(true)} />}
          </Stack.Screen>
        ) : !user ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : !hasCompletedImport ? (
          <Stack.Screen name="RobloxImport">
            {(props) => <RobloxImportScreen {...props} onImportComplete={() => setHasCompletedImport(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
