/**
 * Animation Configuration
 *
 * Central registry for all Lottie animations in the app.
 * Maps events to animations and provides animation metadata.
 */

// Animation sources - will be populated as you add Lottie files
// For now, using placeholder paths that will be replaced with actual files
export const ANIMATIONS = {
  // ============================================
  // MICRO-INTERACTIONS (fast, responsive feedback)
  // ============================================
  micro: {
    tap_sparkle: null, // require('../../assets/lottie/micro/interaction_tap_sparkle.json'),
    heart_pop: null, // require('../../assets/lottie/micro/interaction_heart_pop.json'),
    heart_remove: null, // require('../../assets/lottie/micro/interaction_heart_remove.json'),
    star_burst: null, // require('../../assets/lottie/micro/interaction_star_burst.json'),
    list_add: null, // require('../../assets/lottie/micro/interaction_list_add.json'),
    swipe_hint: null, // require('../../assets/lottie/micro/swipe_hint.json'),
    button_press: null, // require('../../assets/lottie/micro/btn_tap_default.json'),
  },

  // ============================================
  // LOADING ANIMATIONS
  // ============================================
  loading: {
    default: null, // require('../../assets/lottie/loading/loading_orb.json'),
    bear: null, // require('../../assets/lottie/loading/loading_spinning_bear.json'),
    bounce: null, // require('../../assets/lottie/loading/loading_bounce.json'),
  },

  // ============================================
  // CELEBRATION ANIMATIONS
  // ============================================
  celebrations: {
    confetti_small: null, // require('../../assets/lottie/celebrations/confetti_small.json'),
    confetti_big: null, // require('../../assets/lottie/celebrations/confetti_big.json'),
    reward_chest: null, // require('../../assets/lottie/celebrations/reward_chest_open.json'),
    badge_reveal: null, // require('../../assets/lottie/celebrations/badge_reveal.json'),
    streak_advance: null, // require('../../assets/lottie/celebrations/streak_advance.json'),
    level_up: null, // require('../../assets/lottie/celebrations/level_up.json'),
  },

  // ============================================
  // ONBOARDING ANIMATIONS
  // ============================================
  onboarding: {
    welcome_wave: null, // require('../../assets/lottie/onboarding/welcome_wave.json'),
    tap_to_start: null, // require('../../assets/lottie/onboarding/tap_to_start.json'),
    arrow_bounce: null, // require('../../assets/lottie/onboarding/arrow_bounce.json'),
    explore_games: null, // require('../../assets/lottie/onboarding/explore_games.json'),
    wishlist_explain: null, // require('../../assets/lottie/onboarding/wishlist_explain.json'),
  },

  // ============================================
  // EMPTY STATE ANIMATIONS
  // ============================================
  emptyStates: {
    favorites: null, // require('../../assets/lottie/empty_states/empty_favorites.json'),
    search: null, // require('../../assets/lottie/empty_states/empty_search.json'),
    recent: null, // require('../../assets/lottie/empty_states/empty_recent.json'),
    profile: null, // require('../../assets/lottie/empty_states/empty_profile.json'),
    collections: null, // require('../../assets/lottie/empty_states/empty_collections.json'),
    queue: null, // require('../../assets/lottie/empty_states/empty_queue.json'),
  },

};

/**
 * Event to Animation Mapping
 *
 * Maps app events to specific animations for the global trigger system.
 */
export const EVENT_ANIMATIONS = {
  // User actions
  ADD_TO_WISHLIST: { source: ANIMATIONS.micro.heart_pop, type: 'micro' },
  REMOVE_FROM_WISHLIST: { source: ANIMATIONS.micro.heart_remove, type: 'micro' },
  ADD_TO_COLLECTION: { source: ANIMATIONS.micro.list_add, type: 'micro' },
  MARK_FAVORITE: { source: ANIMATIONS.micro.star_burst, type: 'micro' },
  BUTTON_TAP: { source: ANIMATIONS.micro.tap_sparkle, type: 'micro' },
  SWIPE_GAME: { source: ANIMATIONS.micro.swipe_hint, type: 'micro' },

  // Achievements & Rewards
  ACHIEVEMENT_UNLOCK: { source: ANIMATIONS.celebrations.badge_reveal, type: 'celebration' },
  DAILY_REWARD: { source: ANIMATIONS.celebrations.reward_chest, type: 'celebration' },
  STREAK_CONTINUE: { source: ANIMATIONS.celebrations.streak_advance, type: 'celebration' },
  LEVEL_UP: { source: ANIMATIONS.celebrations.level_up, type: 'celebration' },
  COMPLETE_MISSION: { source: ANIMATIONS.celebrations.confetti_big, type: 'celebration' },
  SMALL_WIN: { source: ANIMATIONS.celebrations.confetti_small, type: 'celebration' },

  // Empty states
  EMPTY_FAVORITES: { source: ANIMATIONS.emptyStates.favorites, type: 'empty' },
  EMPTY_SEARCH: { source: ANIMATIONS.emptyStates.search, type: 'empty' },
  EMPTY_COLLECTIONS: { source: ANIMATIONS.emptyStates.collections, type: 'empty' },
  EMPTY_QUEUE: { source: ANIMATIONS.emptyStates.queue, type: 'empty' },
};

/**
 * Animation type configurations
 */
export const ANIMATION_CONFIG = {
  micro: {
    duration: 400, // ms
    loop: false,
    speed: 1.2,
  },
  celebration: {
    duration: 2500, // ms
    loop: false,
    speed: 1,
    fullscreen: true,
  },
  loading: {
    duration: null, // infinite
    loop: true,
    speed: 1,
  },
  empty: {
    duration: null,
    loop: true,
    speed: 0.6,
  },
  onboarding: {
    duration: null,
    loop: true,
    speed: 1,
  },
};

/**
 * Helper to get animation source by event name
 */
export function getAnimationForEvent(eventName) {
  return EVENT_ANIMATIONS[eventName] || null;
}

/**
 * Helper to check if an animation source is loaded
 */
export function isAnimationLoaded(source) {
  return source !== null && source !== undefined;
}

/**
 * Register a new animation source
 * Call this when dynamically loading animations
 */
export function registerAnimation(category, name, source) {
  if (ANIMATIONS[category]) {
    ANIMATIONS[category][name] = source;
  }
}
