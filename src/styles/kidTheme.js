/**
 * Kid-Friendly Theme System
 *
 * Comprehensive design system optimized for children:
 * - Large tap targets (48-56dp minimum)
 * - Rounded corners everywhere
 * - Bright, friendly colors
 * - Clear visual hierarchy
 * - Playful animations
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

/**
 * Corner Radius System
 * Rounded shapes feel safer, softer, and more toy-like
 */
export const radii = {
  xs: 8,
  s: 12,
  m: 16,
  l: 20,
  xl: 28,      // Primary buttons
  xxl: 40,     // Cards for kids
  pill: 999,   // Full pill shape
  circle: 9999,
};

/**
 * Spacing System
 * Kids need white space to avoid overwhelming
 */
export const spacing = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  // Safe edge padding
  edgePadding: isTablet ? 32 : 20,
  // Between elements
  elementGap: isTablet ? 20 : 16,
  // Card internal padding
  cardPadding: isTablet ? 24 : 20,
};

/**
 * Typography System
 * Rounded sans-serif, large sizes for readability
 */
// Font sizes - larger for kids
const fontSizes = {
  tiny: 12,
  small: 14,
  caption: 12, // Alias for tiny
  body: isTablet ? 18 : 16,
  bodyLarge: isTablet ? 20 : 18,
  button: isTablet ? 20 : 18,
  subtitle: isTablet ? 22 : 20,
  title: isTablet ? 28 : 24,
  header: isTablet ? 34 : 30,
  hero: isTablet ? 42 : 36,
};

export const typography = {
  // Font families (using system rounded fonts)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    // Note: For custom fonts, use Nunito, Quicksand, or Baloo
  },
  // Font sizes - larger for kids (both aliases for compatibility)
  fontSize: fontSizes,
  sizes: fontSizes, // Alias for TypeScript components
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

/**
 * Kid-Friendly Color Palette
 * Bright, saturated, friendly tones
 */
export const kidColors = {
  // Primary brand colors
  primary: {
    blue: '#4DABF7',       // Bright sky blue
    purple: '#9775FA',     // Soft purple
    pink: '#F783AC',       // Playful pink
    red: '#E64545',        // Bear's bandana red
  },

  // Secondary accent colors
  secondary: {
    yellow: '#FFD43B',     // Warm yellow
    orange: '#FF922B',     // Vibrant orange
    mint: '#63E6BE',       // Mint green
    teal: '#38D9A9',       // Fresh teal
  },

  // Backgrounds (soft, not harsh white)
  background: {
    light: '#F8F6FF',      // Soft lavender white
    card: '#FFFFFF',       // Card white
    elevated: '#F1EEFF',   // Slightly purple tint
    warm: '#FFF8F0',       // Warm cream
    cool: '#F0F8FF',       // Cool blue tint
  },

  // Dark mode backgrounds (from existing theme)
  backgroundDark: {
    primary: '#1A1625',    // Deep twilight
    secondary: '#2E2440',  // Soft dark purple
    tertiary: '#3A2F4D',   // Medium purple
    card: '#362B4A',       // Card surface
  },

  // Text colors
  text: {
    primary: '#2D2A3E',    // Dark purple-gray
    secondary: '#6B6580',  // Medium purple-gray
    tertiary: '#9B95AD',   // Light purple-gray
    light: '#FFFFFF',      // White text
    lightSecondary: '#F3D2C1', // Warm cream
  },

  // Action colors
  action: {
    like: '#FF6B6B',       // Heart red
    favorite: '#FFD43B',   // Star yellow
    add: '#63E6BE',        // Mint green
    play: '#4DABF7',       // Play blue
    info: '#9775FA',       // Info purple
  },

  // Feedback colors
  feedback: {
    success: '#51CF66',    // Fresh green
    warning: '#FFD43B',    // Attention yellow
    error: '#FF6B6B',      // Error red
    info: '#4DABF7',       // Info blue
  },

  // Bear-inspired palette
  bear: {
    brown: '#8B6914',      // Bear's fur
    darkBrown: '#5D4E37',  // Bear's darker fur
    cream: '#F5E6D3',      // Bear's light fur
    bandana: '#E64545',    // Bear's red bandana
    nose: '#2D2A3E',       // Bear's nose
  },

  // Gradients (for buttons, headers)
  gradients: {
    primary: ['#4DABF7', '#9775FA'],     // Blue to purple
    secondary: ['#FF922B', '#F783AC'],   // Orange to pink
    success: ['#51CF66', '#63E6BE'],     // Green gradient
    warm: ['#FFD43B', '#FF922B'],        // Yellow to orange
    cool: ['#38D9A9', '#4DABF7'],        // Teal to blue
    bear: ['#E64545', '#F783AC'],        // Bear's bandana gradient
  },
};

/**
 * Shadow System
 * Depth helps kids interpret UI elements
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#2D2A3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#2D2A3E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#2D2A3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  xlarge: {
    shadowColor: '#2D2A3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  // Colored shadows for buttons
  coloredSmall: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  }),
  coloredMedium: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  }),
};

/**
 * Touch Target Sizes
 * Minimum 48dp for kids
 */
export const touchTargets = {
  minimum: 48,
  standard: 52,
  large: 56,
  xlarge: 64,
  // Icon button sizes
  iconSmall: 40,
  iconMedium: 48,
  iconLarge: 56,
};

/**
 * Animation Configurations
 * Kid-friendly easing and durations
 */
export const animations = {
  // Durations
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
  },
  // Spring configs for React Native Animated
  spring: {
    bouncy: {
      tension: 100,
      friction: 7,
    },
    gentle: {
      tension: 50,
      friction: 10,
    },
    stiff: {
      tension: 200,
      friction: 15,
    },
  },
  // Button press animation
  buttonPress: {
    scale: 0.94,
    duration: 120,
  },
  // Card hover/press animation
  cardPress: {
    scale: 1.04,
    duration: 200,
  },
};

/**
 * Component Size Presets
 */
export const componentSizes = {
  // Button heights
  button: {
    small: 44,
    medium: 52,
    large: 56,
    xlarge: 64,
  },
  // Card dimensions
  card: {
    smallWidth: 160,
    mediumWidth: 200,
    largeWidth: 280,
    padding: spacing.cardPadding,
    borderRadius: radii.xxl,
  },
  // Avatar sizes
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
  // Icon sizes
  icon: {
    tiny: 16,
    small: 20,
    medium: 24,
    large: 32,
    xlarge: 40,
  },
  // Bear mascot sizes
  bear: {
    tiny: 60,
    small: 100,
    medium: 140,
    large: 180,
    xlarge: 240,
  },
  // Navbar
  navbar: {
    height: isTablet ? 80 : 70,
    iconSize: isTablet ? 28 : 24,
    labelSize: isTablet ? 14 : 12,
  },
};

/**
 * Z-Index Layers
 */
export const zIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  sticky: 20,
  navbar: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
  bear: 100,
};

/**
 * Responsive Helpers
 */
export const responsive = {
  isTablet,
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  // Responsive value helper
  value: (mobile, tablet) => (isTablet ? tablet : mobile),
  // Grid columns
  columns: isTablet ? 3 : 2,
};

/**
 * Export unified theme object
 */
export const kidTheme = {
  radii,
  spacing,
  typography,
  colors: kidColors,
  shadows,
  touchTargets,
  animations,
  componentSizes,
  zIndex,
  responsive,
};

export default kidTheme;
