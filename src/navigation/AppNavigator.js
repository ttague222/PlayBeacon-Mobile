import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

// Import screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RobloxImportScreen from '../screens/RobloxImportScreen';
import QueueScreen from '../screens/QueueScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
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
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
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

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="RobloxImport" component={RobloxImportScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
