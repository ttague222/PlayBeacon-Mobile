/**
 * KidNavBar Component
 *
 * Kid-friendly navigation bar with:
 * - Large touch targets
 * - Icons with labels
 * - Bubble-style active state
 * - Animated transitions
 * - Fun, playful design
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { kidTheme } from '../../styles/kidTheme';
import SoundManager from '../../services/SoundManager';

const {
  radii,
  spacing,
  typography,
  colors,
  shadows,
  componentSizes,
} = kidTheme;

/**
 * Default navigation items
 */
const DEFAULT_TABS = [
  { key: 'home', label: 'Home', icon: 'home', activeIcon: 'home' },
  { key: 'discover', label: 'Discover', icon: 'compass-outline', activeIcon: 'compass' },
  { key: 'wishlist', label: 'Wishlist', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

/**
 * Individual tab button
 */
function NavTab({
  item,
  isActive,
  onPress,
  index,
  totalTabs,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bubbleAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  // Animate bubble when active state changes
  useEffect(() => {
    Animated.spring(bubbleAnim, {
      toValue: isActive ? 1 : 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [isActive, bubbleAnim]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (!isActive) {
      SoundManager.play('ui.tab_change');
    }
    onPress?.(item.key, index);
  }, [isActive, item.key, index, onPress]);

  const iconName = isActive ? item.activeIcon : item.icon;
  const iconColor = isActive ? colors.text.light : colors.text.tertiary;
  const labelColor = isActive ? colors.primary.blue : colors.text.tertiary;

  return (
    <Animated.View
      style={[
        styles.tabContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.tabPressable}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {/* Bubble background for active state */}
        <Animated.View
          style={[
            styles.bubbleBackground,
            {
              opacity: bubbleAnim,
              transform: [
                {
                  scale: bubbleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bubbleGradient}
          />
        </Animated.View>

        {/* Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                {
                  translateY: bubbleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -2],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={componentSizes.navbar.iconSize}
            color={iconColor}
          />
        </Animated.View>

        {/* Label - only show when not active */}
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: labelColor,
              opacity: bubbleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Main Navigation Bar Component
 */
export default function KidNavBar({
  tabs = DEFAULT_TABS,
  activeTab = 'home',
  onTabPress,
  style,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, spacing.s),
        },
        shadows.medium,
        style,
      ]}
    >
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <NavTab
            key={tab.key}
            item={tab}
            isActive={activeTab === tab.key}
            onPress={onTabPress}
            index={index}
            totalTabs={tabs.length}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Floating style navigation bar
 */
export function KidNavBarFloating({
  tabs = DEFAULT_TABS,
  activeTab = 'home',
  onTabPress,
  style,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.floatingContainer,
        {
          bottom: Math.max(insets.bottom, spacing.m) + spacing.s,
        },
        style,
      ]}
    >
      <View style={[styles.floatingBar, shadows.xlarge]}>
        {tabs.map((tab, index) => (
          <NavTab
            key={tab.key}
            item={tab}
            isActive={activeTab === tab.key}
            onPress={onTabPress}
            index={index}
            totalTabs={tabs.length}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Navigation with center FAB button
 */
export function KidNavBarWithFAB({
  tabs = DEFAULT_TABS,
  activeTab = 'home',
  onTabPress,
  fabIcon = 'add',
  onFABPress,
  style,
}) {
  const insets = useSafeAreaInsets();
  const fabScale = useRef(new Animated.Value(1)).current;

  const handleFABPressIn = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [fabScale]);

  const handleFABPressOut = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [fabScale]);

  const handleFABPress = useCallback(() => {
    SoundManager.play('ui.tap');
    onFABPress?.();
  }, [onFABPress]);

  // Split tabs for left and right sides
  const midPoint = Math.ceil(tabs.length / 2);
  const leftTabs = tabs.slice(0, midPoint);
  const rightTabs = tabs.slice(midPoint);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, spacing.s),
        },
        shadows.medium,
        style,
      ]}
    >
      <View style={styles.tabsContainer}>
        {/* Left tabs */}
        {leftTabs.map((tab, index) => (
          <NavTab
            key={tab.key}
            item={tab}
            isActive={activeTab === tab.key}
            onPress={onTabPress}
            index={index}
            totalTabs={tabs.length}
          />
        ))}

        {/* Center FAB */}
        <View style={styles.fabSpace}>
          <Animated.View
            style={[
              styles.fabContainer,
              { transform: [{ scale: fabScale }] },
              shadows.coloredMedium(colors.primary.blue),
            ]}
          >
            <Pressable
              onPress={handleFABPress}
              onPressIn={handleFABPressIn}
              onPressOut={handleFABPressOut}
              style={styles.fabPressable}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <Ionicons name={fabIcon} size={32} color={colors.text.light} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        {/* Right tabs */}
        {rightTabs.map((tab, index) => (
          <NavTab
            key={tab.key}
            item={tab}
            isActive={activeTab === tab.key}
            onPress={onTabPress}
            index={midPoint + index}
            totalTabs={tabs.length}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Simple icon-only bottom bar
 */
export function KidNavBarSimple({
  tabs = DEFAULT_TABS,
  activeTab = 'home',
  onTabPress,
  style,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.simpleContainer,
        {
          paddingBottom: Math.max(insets.bottom, spacing.s),
        },
        style,
      ]}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              if (!isActive) SoundManager.play('ui.tab_change');
              onTabPress?.(tab.key, index);
            }}
            style={styles.simpleTab}
            hitSlop={8}
          >
            <View style={[styles.simpleIconBg, isActive && styles.simpleIconBgActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={26}
                color={isActive ? colors.primary.blue : colors.text.tertiary}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container
  container: {
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.background.elevated,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: componentSizes.navbar.height,
    paddingHorizontal: spacing.s,
  },

  // Tab styles
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    minWidth: 60,
    minHeight: 56,
  },
  bubbleBackground: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  bubbleGradient: {
    flex: 1,
    borderRadius: 26,
  },
  iconContainer: {
    marginBottom: spacing.xxs,
  },
  tabLabel: {
    fontSize: componentSizes.navbar.labelSize,
    fontWeight: typography.fontWeight.medium,
  },

  // Floating variant
  floatingContainer: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: radii.xxl,
    height: componentSizes.navbar.height,
    paddingHorizontal: spacing.m,
  },

  // FAB variant
  fabSpace: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.s,
  },
  fabPressable: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Simple variant
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.background.elevated,
    paddingTop: spacing.s,
  },
  simpleTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  simpleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleIconBgActive: {
    backgroundColor: colors.background.elevated,
  },
});
