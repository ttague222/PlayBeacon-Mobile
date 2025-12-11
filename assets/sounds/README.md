# Sound Assets for PlayBeacon

This folder contains all sound effect files for the PlayBeacon app.

## Required Sound Files

Add the following MP3 files to this folder:

### UI Micro-interactions (~100-200ms, soft sounds)
| File | Description | Notes |
|------|-------------|-------|
| `ui_tap.mp3` | Button tap | Soft "pop" sound |
| `ui_swipe.mp3` | Card swipe | Gentle "whoosh" |
| `ui_tab_change.mp3` | Tab navigation | Soft click/slide |
| `ui_remove.mp3` | Remove item | Subtle "poof" |

### Reward Sounds
| File | Description | Notes |
|------|-------------|-------|
| `reward_confetti.mp3` | Achievement/celebration | Sparkle/confetti burst |
| `reward_streak.mp3` | Streak increase | Rising tone sequence |
| `reward_daily.mp3` | Daily reward available | Tiny jingle |

### Bear Mascot Sounds (Non-verbal, cartoon-like)
| File | Description | Notes |
|------|-------------|-------|
| `bear_tailwag.mp3` | Tail wagging | Subtle swish |
| `bear_sniff.mp3` | Thinking/curious | Snuffle sound |
| `bear_earwiggle.mp3` | Ear wiggle | Very tiny sparkle |
| `bear_sleep.mp3` | Going to sleep | Sleepy puff |
| `bear_sad.mp3` | Sad/error state | Low-pitch "boop" |
| `bear_celebrate.mp3` | Celebrating | Happy chime |
| `bear_surprise.mp3` | Surprised | Boing/pop |
| `bear_boop.mp3` | Tap interaction | Short "boop" |

### System Sounds
| File | Description | Notes |
|------|-------------|-------|
| `login_success.mp3` | Successful login | Soft ascending chord |
| `error_thud.mp3` | Error/failure | Muted low thud |
| `loading_complete.mp3` | Loading finished | Soft ping |
| `no_results.mp3` | Empty results | Small downward chime |
| `loading_ambient.mp3` | Loading loop | Very low volume ambient (optional) |

## Sound Design Guidelines

### Volume Levels
- UI sounds: 45-60%
- Mascot sounds: 35-50%
- Rewards: 50-70%
- Ambient: <10%

### Character
- **Light** - Never heavy or intrusive
- **Soft** - Rounded edges, no harsh transients
- **Short** - 100-200ms for UI, up to 1s for rewards
- **Pleasant** - Positive, friendly tones
- **Child-safe** - No startling or scary sounds

### Technical Requirements
- Format: MP3 (primary), WAV (fallback)
- Sample rate: 44.1kHz
- Bit depth: 16-bit
- Normalized to -6dB peak
- No clipping

## Placeholder Files

For development, you can create silent placeholder MP3 files using:

```bash
# Using ffmpeg to create silent placeholder files
for file in ui_tap ui_swipe ui_tab_change ui_remove \
             reward_confetti reward_streak reward_daily \
             bear_tailwag bear_sniff bear_earwiggle bear_sleep \
             bear_sad bear_celebrate bear_surprise bear_boop \
             login_success error_thud loading_complete no_results \
             loading_ambient; do
  ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2 -q:a 9 "${file}.mp3"
done
```

Or download placeholder sounds from royalty-free sources like:
- https://freesound.org
- https://mixkit.co/free-sound-effects/
- https://pixabay.com/sound-effects/

## Event to Sound Mapping

The app uses an event-based system. Here's the mapping:

```javascript
{
  // Wishlist
  "ADD_TO_WISHLIST": "reward_confetti",
  "REMOVE_FROM_WISHLIST": "ui_remove",

  // UI
  "TAP": "ui_tap",
  "SWIPE_LEFT": "ui_swipe",
  "SWIPE_RIGHT": "ui_swipe",
  "TAB_CHANGE": "ui_tab_change",

  // Bear
  "BEAR_CELEBRATE": "bear_celebrate",
  "BEAR_SAD": "bear_sad",
  "BEAR_THINK": "bear_sniff",
  "BEAR_SLEEP": "bear_sleep",
  "BEAR_SURPRISE": "bear_surprise",
  "BEAR_TAP": "bear_boop",
  "BEAR_TAIL_WAG": "bear_tailwag",
  "BEAR_EAR_WIGGLE": "bear_earwiggle",

  // Rewards
  "ACHIEVEMENT_UNLOCK": "reward_confetti",
  "STREAK_CONTINUE": "reward_streak",
  "DAILY_REWARD": "reward_daily",

  // System
  "LOGIN_SUCCESS": "login_success",
  "ERROR": "error_thud",
  "LOADING_COMPLETE": "loading_complete",
  "EMPTY_RESULTS": "no_results"
}
```

## Usage in Code

```javascript
import SoundManager from '../services/SoundManager';
import { useSoundEffect, useBearSounds } from '../hooks/useSoundEffect';

// Direct play
SoundManager.play('ui_tap');

// Via event
SoundManager.playEvent('ADD_TO_WISHLIST');

// Via hook
const playTap = useSoundEffect('ui_tap');
playTap();

// Bear sounds hook
const bearSounds = useBearSounds();
bearSounds.celebrate();
```
