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
  // BEAR MASCOT ANIMATIONS
  // ============================================
  mascot: {
    // Idle states
    idle: require('../../assets/lottie/mascot/bear_idle.json'),
    blink: require('../../assets/lottie/mascot/bear_blink.json'),
    sleep: require('../../assets/lottie/mascot/bear_sleep.json'),

    // Helpful animations
    point_left: require('../../assets/lottie/mascot/bear_point_left.json'),
    point_right: require('../../assets/lottie/mascot/bear_point_right.json'),
    wave: require('../../assets/lottie/mascot/bear_wave.json'),

    // Emotional animations
    celebrate: require('../../assets/lottie/mascot/bear_celebrate.json'),
    sad: require('../../assets/lottie/mascot/bear_sad.json'),
    think: require('../../assets/lottie/mascot/bear_think.json'),
    surprise: require('../../assets/lottie/mascot/bear_surprise.json'),
    jump: require('../../assets/lottie/mascot/bear_jump.json'),

    // Reaction animations
    yes: require('../../assets/lottie/mascot/bear_yes.json'),
    no: require('../../assets/lottie/mascot/bear_no.json'),
    tail_wag: require('../../assets/lottie/mascot/bear_tail_wag.json'),
    ear_wiggle: require('../../assets/lottie/mascot/bear_ear_wiggle.json'),

    // Micro-interactions
    tap_bounce: require('../../assets/lottie/mascot/bear_tap_bounce.json'),
    paw_pop: require('../../assets/lottie/mascot/bear_paw_pop.json'),
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

  // Mascot reactions
  MASCOT_WELCOME: { source: ANIMATIONS.mascot.wave, type: 'mascot' },
  MASCOT_CELEBRATE: { source: ANIMATIONS.mascot.celebrate, type: 'mascot' },
  MASCOT_SAD: { source: ANIMATIONS.mascot.sad, type: 'mascot' },
  MASCOT_THINK: { source: ANIMATIONS.mascot.think, type: 'mascot' },
  MASCOT_POINT_LEFT: { source: ANIMATIONS.mascot.point_left, type: 'mascot' },
  MASCOT_POINT_RIGHT: { source: ANIMATIONS.mascot.point_right, type: 'mascot' },
  MASCOT_YES: { source: ANIMATIONS.mascot.yes, type: 'mascot' },
  MASCOT_NO: { source: ANIMATIONS.mascot.no, type: 'mascot' },
  MASCOT_JUMP: { source: ANIMATIONS.mascot.jump, type: 'mascot' },
  MASCOT_SURPRISE: { source: ANIMATIONS.mascot.surprise, type: 'mascot' },
  MASCOT_TAIL_WAG: { source: ANIMATIONS.mascot.tail_wag, type: 'mascot' },
  MASCOT_TAP: { source: ANIMATIONS.mascot.tap_bounce, type: 'micro' },
  MASCOT_PAW_POP: { source: ANIMATIONS.mascot.paw_pop, type: 'micro' },
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
  mascot: {
    duration: null,
    loop: true,
    speed: 0.8,
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
