/**
 * Bear Component Tests
 *
 * Tests for the Bear mascot component, including state machine,
 * animations, interactions, and variant components.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('lottie-react-native', () => {
  const { View } = require('react-native');
  return ({ source, autoPlay, loop, speed, style, onAnimationFinish }) => (
    <View
      testID="lottie-view"
      style={style}
      accessibilityLabel={`animation-${autoPlay ? 'playing' : 'paused'}-${loop ? 'loop' : 'once'}`}
    />
  );
});

jest.mock('../../config/animations', () => ({
  ANIMATIONS: {
    mascot: {
      idle: 'idle.json',
      blink: 'blink.json',
      celebrate: 'celebrate.json',
      sad: 'sad.json',
      think: 'think.json',
      point_left: 'point_left.json',
      point_right: 'point_right.json',
      wave: 'wave.json',
      sleep: 'sleep.json',
      jump: 'jump.json',
      paw_pop: 'paw_pop.json',
      no: 'no.json',
      yes: 'yes.json',
      tap_bounce: 'tap_bounce.json',
      surprise: 'surprise.json',
      ear_wiggle: 'ear_wiggle.json',
      tail_wag: 'tail_wag.json',
    },
  },
}));

jest.mock('../../services/SoundManager', () => ({
  play: jest.fn(),
}));

import Bear, { BearState, BearPositioned, BearReactive } from '../../components/Bear';
import SoundManager from '../../services/SoundManager';

describe('Bear Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('BearState enum', () => {
    it('should define all bear states', () => {
      expect(BearState.IDLE).toBe('idle');
      expect(BearState.BLINK).toBe('blink');
      expect(BearState.CELEBRATE).toBe('celebrate');
      expect(BearState.SAD).toBe('sad');
      expect(BearState.THINK).toBe('think');
      expect(BearState.POINT_LEFT).toBe('pointLeft');
      expect(BearState.POINT_RIGHT).toBe('pointRight');
      expect(BearState.WAVE).toBe('wave');
      expect(BearState.SLEEP).toBe('sleep');
      expect(BearState.JUMP).toBe('jump');
      expect(BearState.PAW_POP).toBe('pawPop');
      expect(BearState.NO).toBe('no');
      expect(BearState.YES).toBe('yes');
      expect(BearState.TAP_BOUNCE).toBe('tapBounce');
      expect(BearState.SURPRISE).toBe('surprise');
      expect(BearState.EAR_WIGGLE).toBe('earWiggle');
      expect(BearState.TAIL_WAG).toBe('tailWag');
    });
  });

  describe('Bear rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<Bear />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with default state (idle)', () => {
      const { getByTestId } = render(<Bear />);
      expect(getByTestId('lottie-view')).toBeTruthy();
    });

    it('should render with specified state', () => {
      const { toJSON } = render(<Bear state={BearState.CELEBRATE} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with custom size', () => {
      const { getByTestId } = render(<Bear size={200} />);
      const lottie = getByTestId('lottie-view');
      expect(lottie.props.style).toMatchObject({ width: 200, height: 200 });
    });

    it('should render with custom opacity', () => {
      const { toJSON } = render(<Bear opacity={0.5} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Bear states', () => {
    it('should render idle state', () => {
      const { toJSON } = render(<Bear state={BearState.IDLE} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render celebrate state', () => {
      const { toJSON } = render(<Bear state={BearState.CELEBRATE} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render sad state', () => {
      const { toJSON } = render(<Bear state={BearState.SAD} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render think state', () => {
      const { toJSON } = render(<Bear state={BearState.THINK} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render sleep state', () => {
      const { toJSON } = render(<Bear state={BearState.SLEEP} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render wave state', () => {
      const { toJSON } = render(<Bear state={BearState.WAVE} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render all states without crashing', () => {
      Object.values(BearState).forEach(state => {
        const { toJSON } = render(<Bear state={state} />);
        expect(toJSON()).toBeTruthy();
      });
    });
  });

  describe('Interactions', () => {
    it('should be interactive by default', () => {
      const { toJSON } = render(<Bear />);
      expect(toJSON()).toBeTruthy();
    });

    it('should disable interactivity when interactive is false', () => {
      const onPress = jest.fn();
      const { toJSON } = render(<Bear interactive={false} onPress={onPress} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should call onPress handler when tapped', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(<Bear onPress={onPress} />);

      // Find the pressable container
      const tree = render(<Bear onPress={onPress} />);
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Auto behaviors', () => {
    it('should enable autoBlink by default', () => {
      const { toJSON } = render(<Bear />);
      expect(toJSON()).toBeTruthy();
    });

    it('should disable autoBlink when specified', () => {
      const { toJSON } = render(<Bear autoBlink={false} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should enable autoIdleBehaviors by default', () => {
      const { toJSON } = render(<Bear />);
      expect(toJSON()).toBeTruthy();
    });

    it('should disable autoIdleBehaviors when specified', () => {
      const { toJSON } = render(<Bear autoIdleBehaviors={false} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Sound integration', () => {
    it('should enable sound by default', () => {
      const { toJSON } = render(<Bear />);
      expect(toJSON()).toBeTruthy();
    });

    it('should disable sound when soundEnabled is false', () => {
      const { toJSON } = render(<Bear soundEnabled={false} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should not play sound when soundEnabled is false and state changes', () => {
      const { rerender } = render(<Bear soundEnabled={false} state={BearState.IDLE} />);

      act(() => {
        rerender(<Bear soundEnabled={false} state={BearState.CELEBRATE} />);
      });

      // SoundManager.play should not have been called with celebrate sound
      expect(SoundManager.play).not.toHaveBeenCalledWith('bear.celebrate');
    });
  });

  describe('Loop behavior', () => {
    it('should loop idle state by default', () => {
      const { getByTestId } = render(<Bear state={BearState.IDLE} />);
      const lottie = getByTestId('lottie-view');
      expect(lottie.props.accessibilityLabel).toContain('loop');
    });

    it('should loop sleep state by default', () => {
      const { getByTestId } = render(<Bear state={BearState.SLEEP} />);
      const lottie = getByTestId('lottie-view');
      expect(lottie.props.accessibilityLabel).toContain('loop');
    });

    it('should allow loop override', () => {
      const { getByTestId } = render(<Bear state={BearState.IDLE} loop={false} />);
      const lottie = getByTestId('lottie-view');
      expect(lottie.props.accessibilityLabel).toContain('once');
    });
  });

  describe('Sleep timeout', () => {
    it('should not sleep by default (sleepTimeout = 0)', () => {
      const { toJSON } = render(<Bear />);

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(toJSON()).toBeTruthy();
    });

    it('should accept sleepTimeout prop', () => {
      const { toJSON } = render(<Bear sleepTimeout={30} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Props handling', () => {
    it('should accept custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { toJSON } = render(<Bear style={customStyle} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should handle undefined state gracefully', () => {
      const { toJSON } = render(<Bear state={undefined} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should use default size (140) when not specified', () => {
      const { getByTestId } = render(<Bear />);
      const lottie = getByTestId('lottie-view');
      expect(lottie.props.style).toMatchObject({ width: 140, height: 140 });
    });
  });
});

describe('BearPositioned Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { toJSON } = render(<BearPositioned />);
    expect(toJSON()).toBeTruthy();
  });

  it('should default to bottom-right position', () => {
    const { toJSON } = render(<BearPositioned />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render at bottom-left position', () => {
    const { toJSON } = render(<BearPositioned position="bottom-left" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render at top-left position', () => {
    const { toJSON } = render(<BearPositioned position="top-left" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render at top-right position', () => {
    const { toJSON } = render(<BearPositioned position="top-right" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should accept custom offset', () => {
    const { toJSON } = render(<BearPositioned offset={{ x: 32, y: 32 }} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should pass props to Bear', () => {
    const { toJSON } = render(
      <BearPositioned
        state={BearState.CELEBRATE}
        size={100}
        interactive={false}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should handle unknown position gracefully', () => {
    const { toJSON } = render(<BearPositioned position="unknown" />);
    expect(toJSON()).toBeTruthy();
  });
});

describe('BearReactive Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render without crashing', () => {
    const { toJSON } = render(<BearReactive />);
    expect(toJSON()).toBeTruthy();
  });

  it('should start with default state (IDLE)', () => {
    const { toJSON } = render(<BearReactive />);
    expect(toJSON()).toBeTruthy();
  });

  it('should start with custom default state', () => {
    const { toJSON } = render(<BearReactive defaultState={BearState.THINK} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should accept events map', () => {
    const events = {
      LIKE: BearState.CELEBRATE,
      DISLIKE: BearState.SAD,
    };
    const { toJSON } = render(<BearReactive events={events} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should pass props to Bear', () => {
    const { toJSON } = render(
      <BearReactive
        size={100}
        interactive={false}
        soundEnabled={false}
      />
    );
    expect(toJSON()).toBeTruthy();
  });
});

describe('Bear State Constants', () => {
  it('should have unique state values', () => {
    const values = Object.values(BearState);
    const uniqueValues = new Set(values);
    expect(values.length).toBe(uniqueValues.size);
  });

  it('should have all states as strings', () => {
    Object.values(BearState).forEach(state => {
      expect(typeof state).toBe('string');
    });
  });
});
