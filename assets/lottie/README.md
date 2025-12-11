# PlayBeacon Lottie Animation System

## Folder Structure

```
assets/lottie/
├── micro/                    # Micro-interactions (fast, responsive)
│   ├── interaction_tap_sparkle.json
│   ├── interaction_heart_pop.json
│   ├── interaction_heart_remove.json
│   ├── interaction_star_burst.json
│   ├── interaction_list_add.json
│   └── swipe_hint.json
│
├── loading/                  # Loading animations (loop)
│   ├── loading_orb.json
│   ├── loading_spinning_bear.json
│   └── loading_bounce.json
│
├── celebrations/             # Reward animations (one-shot)
│   ├── confetti_small.json
│   ├── confetti_big.json
│   ├── reward_chest_open.json
│   ├── badge_reveal.json
│   ├── streak_advance.json
│   └── level_up.json
│
├── onboarding/              # Onboarding sequence
│   ├── welcome_wave.json
│   ├── tap_to_start.json
│   ├── arrow_bounce.json
│   ├── explore_games.json
│   └── wishlist_explain.json
│
├── mascot/                  # Bear the Bernese Mountain Dog
│   ├── bear_idle.json       # Default idle loop
│   ├── bear_blink.json      # Blinking idle variant
│   ├── bear_breathe.json    # Breathing idle variant
│   ├── bear_wave.json       # Waving hello
│   ├── bear_celebrate.json  # Celebrating achievements
│   ├── bear_sad.json        # Sad/disappointed
│   ├── bear_think.json      # Thinking/loading
│   ├── bear_surprised.json  # Surprised reaction
│   ├── bear_happy.json      # Happy expression
│   ├── bear_point_left.json # Pointing left
│   └── bear_point_right.json # Pointing right
│
└── empty_states/            # Empty state animations
    ├── empty_favorites.json
    ├── empty_search.json
    ├── empty_recent.json
    ├── empty_profile.json
    ├── empty_collections.json
    └── empty_queue.json
```

## Adding Animation Files

1. Export your Lottie animations as `.json` files
2. Place them in the appropriate folder
3. Update `src/config/animations.js` to register them

### Example: Adding Bear Idle Animation

1. Place `bear_idle.json` in `assets/lottie/mascot/`
2. Open `src/config/animations.js`
3. Uncomment and update the line:

```js
// Before
idle: null, // require('../../assets/lottie/mascot/bear_idle.json'),

// After
idle: require('../../assets/lottie/mascot/bear_idle.json'),
```

## Animation Guidelines

### File Size
- Keep animations under **250 KB**
- Use Lottie's optimized export settings

### Looping
- **Loop**: idle states, loading, breathing
- **No loop**: celebrations, reactions, micro-interactions

### Performance
- Maximum **2-3 animations** visible at once
- Lazy load large celebration animations
- Use `speed` prop to control playback rate

## Usage Examples

### Using Bear Mascot

```jsx
import BearMascot, { BEAR_STATES, BearWaving, BearSad } from '../components/BearMascot';

// Basic Bear (interactive by default)
<BearMascot state={BEAR_STATES.IDLE} size={150} />

// Waving Bear for welcome
<BearWaving size={200} />

// Sad Bear for empty states
<BearSad size={150} />
```

### Triggering Animations

```jsx
import { useAnimations, useLottieTrigger } from '../context/AnimationContext';

// Method 1: Using event trigger hook
const triggerHeartPop = useLottieTrigger('ADD_TO_WISHLIST');

<TouchableOpacity onPress={(e) => {
  triggerHeartPop({ position: { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY } });
}}>

// Method 2: Using context directly
const { triggerCelebration } = useAnimations();

// Trigger a celebration
triggerCelebration(ANIMATIONS.celebrations.confetti_big);
```

### Using LottieAnim Component

```jsx
import LottieAnim, { MicroAnim, LoadingAnim, CelebrationAnim } from '../components/LottieAnim';

// Generic animation
<LottieAnim
  source={require('../assets/lottie/micro/heart_pop.json')}
  autoPlay
  loop={false}
/>

// Pre-configured variants
<MicroAnim source={heartPopAnimation} />
<LoadingAnim source={loadingAnimation} />
<CelebrationAnim source={confettiAnimation} />
```

## Event Animation Mapping

Available events (defined in `src/config/animations.js`):

| Event | Animation Type | Description |
|-------|---------------|-------------|
| ADD_TO_WISHLIST | micro | Heart pop animation |
| REMOVE_FROM_WISHLIST | micro | Heart remove animation |
| ADD_TO_COLLECTION | micro | List add animation |
| BUTTON_TAP | micro | Sparkle effect |
| ACHIEVEMENT_UNLOCK | celebration | Badge reveal |
| DAILY_REWARD | celebration | Reward chest |
| LEVEL_UP | celebration | Level up effect |
| COMPLETE_MISSION | celebration | Big confetti |

## Bear State Reference

| State | Use Case | Loops |
|-------|----------|-------|
| IDLE | Default state | Yes |
| BLINK | Idle variant | Yes |
| BREATHE | Idle variant | Yes |
| WAVE | Welcome screens | No |
| CELEBRATE | Achievements | No |
| SAD | Errors/empty | Yes |
| THINK | Loading | Yes |
| SURPRISED | Reactions | No |
| HAPPY | Success | No |
| POINT_LEFT | Navigation hint | No |
| POINT_RIGHT | Navigation hint | No |
