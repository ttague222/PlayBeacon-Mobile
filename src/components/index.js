/**
 * Component Exports
 *
 * Central export file for all reusable components.
 */

// Bear Mascot (New unified component with state machine)
export { default as Bear, BearState, BearPositioned, BearReactive } from './Bear';

// Bear Screen Wrappers (Page-level Bear components)
export {
  BearHome,
  BearDiscovery,
  BearWishlist,
  BearProfile,
  BearOnboarding,
  BearGameDetail,
  BearLoadingScreen,
  BearError,
  BearEmpty,
  GlobalBear,
} from './BearScreens';

// Legacy Bear Mascot (kept for backwards compatibility)
export { default as BearMascot, BEAR_STATES } from './BearMascot';
export {
  BearSmall,
  BearMedium,
  BearLarge,
  BearThinking,
  BearSad,
  BearCelebrating,
  BearWaving,
  BearJumping,
  BearSleeping,
  BearYes,
  BearNo,
  BearSurprised,
  BearHappy,
} from './BearMascot';

// Lottie Animations
export { default as LottieAnim } from './LottieAnim';
export {
  MicroAnim,
  LoadingAnim,
  CelebrationAnim,
  MascotAnim,
  EmptyStateAnim,
} from './LottieAnim';

// Empty States
export { default as EmptyState } from './EmptyState';
export {
  EmptySearchState,
  EmptyFavoritesState,
  EmptyCollectionsState,
  EmptyQueueState,
  ErrorState,
  LoadingState,
  WelcomeState,
  OfflineState,
} from './EmptyState';

// Bear Loading
export { default as BearLoading } from './BearLoading';
export {
  BearLoadingOverlay,
  BearLoadingInline,
  BearLoadingPlaceholder,
} from './BearLoading';

// Sound Settings
export { default as SoundSettings, SoundToggle, BearSoundToggle } from './SoundSettings';

// Sound-enabled Touchables
export {
  default as TouchableWithSound,
  TouchableOpacityWithSound,
  TouchableHighlightWithSound,
  PressableWithSound,
  ButtonWithSound,
  CardWithSound,
  TabButtonWithSound,
  FavoriteButtonWithSound,
  ModalTriggerWithSound,
  withSound,
} from './TouchableWithSound';

// Kid-Friendly Component Library
export {
  // Buttons
  KidButton,
  KidIconButton,
  KidFAB,
  KidPillButton,
  // Game Cards
  KidGameCard,
  KidGameCardCompact,
  KidGameCardFeatured,
  // Sections & Layout
  KidSection,
  KidSectionHeader,
  KidSectionCard,
  KidHorizontalSection,
  KidGridSection,
  KidSectionDivider,
  KidSectionEmpty,
  // Modals
  KidModal,
  KidAlertModal,
  KidBottomSheet,
  KidActionSheet,
  // Navigation
  KidNavBar,
  KidNavBarFloating,
  KidNavBarWithFAB,
  KidNavBarSimple,
} from './kid';

// Existing Components
export { default as OptimizedImage } from './OptimizedImage';
export { default as SkeletonLoader } from './SkeletonLoader';
export { default as ProfileButton } from './ProfileButton';
export { default as CollectionPickerModal } from './CollectionPickerModal';

// Image Caching
export { default as CachedImage, preloadImages, clearImageCache, getImageCacheStats } from './CachedImage';

// Network & Offline
export { default as OfflineBanner, OfflineIndicator } from './OfflineBanner';

// Lists & Refresh
export { default as RefreshableList, RefreshableScrollView } from './RefreshableList';

// Loading States
export {
  default as LoadingOverlay,
  InlineLoader,
  ButtonLoader,
  FullScreenLoader,
} from './LoadingOverlay';

// Error Handling
export { default as ErrorBoundary } from './ErrorBoundary';
