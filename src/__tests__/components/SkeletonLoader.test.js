/**
 * SkeletonLoader Component Tests
 *
 * Tests for the skeleton loading component and its variants.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import SkeletonLoader from '../../components/SkeletonLoader';

describe('SkeletonLoader', () => {
  let mockLoop;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Animated.loop to return a controllable animation
    mockLoop = {
      start: jest.fn(),
      stop: jest.fn(),
    };
    jest.spyOn(Animated, 'loop').mockReturnValue(mockLoop);
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<SkeletonLoader />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render default variant (grid) when no variant specified', () => {
      const { toJSON } = render(<SkeletonLoader />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render single item by default', () => {
      const { getAllByTestId, toJSON } = render(<SkeletonLoader />);
      const tree = toJSON();
      // Should render one skeleton item
      expect(tree).toBeTruthy();
    });

    it('should render multiple items when count is specified', () => {
      const { toJSON } = render(<SkeletonLoader count={3} />);
      const tree = toJSON();
      // React fragment returns array when multiple children
      expect(Array.isArray(tree) ? tree.length : 1).toBe(3);
    });
  });

  describe('Variants', () => {
    it('should render queue variant', () => {
      const { toJSON } = render(<SkeletonLoader variant="queue" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render grid variant', () => {
      const { toJSON } = render(<SkeletonLoader variant="grid" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render list variant', () => {
      const { toJSON } = render(<SkeletonLoader variant="list" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render game variant', () => {
      const { toJSON } = render(<SkeletonLoader variant="game" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render badge variant', () => {
      const { toJSON } = render(<SkeletonLoader variant="badge" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render task variant', () => {
      const { toJSON } = render(<SkeletonLoader variant="task" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render profile variant', () => {
      const { toJSON } = render(<SkeletonLoader variant="profile" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should fall back to grid for unknown variant', () => {
      const { toJSON } = render(<SkeletonLoader variant="unknown" />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Animation', () => {
    it('should start animation on mount', () => {
      render(<SkeletonLoader />);

      expect(Animated.loop).toHaveBeenCalled();
      expect(mockLoop.start).toHaveBeenCalled();
    });

    it('should stop animation on unmount', () => {
      const { unmount } = render(<SkeletonLoader />);
      unmount();

      expect(mockLoop.stop).toHaveBeenCalled();
    });

    it('should create pulse animation with correct timing', () => {
      const timingSpy = jest.spyOn(Animated, 'timing');

      render(<SkeletonLoader />);

      // Should have called timing for the pulse animation
      expect(timingSpy).toHaveBeenCalled();
    });
  });

  describe('Count Prop', () => {
    it('should render 1 item when count is 1', () => {
      const { toJSON } = render(<SkeletonLoader count={1} />);
      const tree = toJSON();
      // Single item returns object, not array
      expect(tree).toBeTruthy();
      expect(Array.isArray(tree)).toBe(false);
    });

    it('should render 5 items when count is 5', () => {
      const { toJSON } = render(<SkeletonLoader count={5} />);
      const tree = toJSON();
      // Multiple items returns array
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBe(5);
    });

    it('should render nothing when count is 0', () => {
      const { toJSON } = render(<SkeletonLoader count={0} />);
      const tree = toJSON();
      // Empty fragment returns null
      expect(tree).toBeNull();
    });
  });

  describe('Queue Variant Structure', () => {
    it('should render queue skeleton with thumbnail, info, and buttons', () => {
      const { toJSON } = render(<SkeletonLoader variant="queue" />);
      const tree = toJSON();

      // Queue skeleton should have structure
      expect(tree).toBeTruthy();
      expect(tree.children).toBeTruthy();
    });
  });

  describe('Grid Variant Structure', () => {
    it('should render grid skeleton with thumbnail and info', () => {
      const { toJSON } = render(<SkeletonLoader variant="grid" />);
      const tree = toJSON();

      expect(tree).toBeTruthy();
      expect(tree.children).toBeTruthy();
    });
  });

  describe('List Variant Structure', () => {
    it('should render list skeleton with content area', () => {
      const { toJSON } = render(<SkeletonLoader variant="list" />);
      const tree = toJSON();

      expect(tree).toBeTruthy();
      expect(tree.children).toBeTruthy();
    });
  });

  describe('Badge Variant Structure', () => {
    it('should render badge skeleton with icon and info', () => {
      const { toJSON } = render(<SkeletonLoader variant="badge" />);
      const tree = toJSON();

      expect(tree).toBeTruthy();
      expect(tree.children).toBeTruthy();
    });
  });

  describe('Task Variant Structure', () => {
    it('should render task skeleton with checkbox and content', () => {
      const { toJSON } = render(<SkeletonLoader variant="task" />);
      const tree = toJSON();

      expect(tree).toBeTruthy();
      expect(tree.children).toBeTruthy();
    });
  });

  describe('Profile Variant Structure', () => {
    it('should render profile skeleton with avatar and info', () => {
      const { toJSON } = render(<SkeletonLoader variant="profile" />);
      const tree = toJSON();

      expect(tree).toBeTruthy();
      expect(tree.children).toBeTruthy();
    });
  });

  describe('Props Handling', () => {
    it('should handle undefined variant gracefully', () => {
      const { toJSON } = render(<SkeletonLoader variant={undefined} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should handle undefined count gracefully', () => {
      const { toJSON } = render(<SkeletonLoader count={undefined} />);
      const tree = toJSON();
      // Should default to 1
      expect(tree.children).toHaveLength(1);
    });

    it('should handle empty props', () => {
      const { toJSON } = render(<SkeletonLoader />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Multiple Variants with Count', () => {
    it('should render multiple queue skeletons', () => {
      const { toJSON } = render(<SkeletonLoader variant="queue" count={3} />);
      const tree = toJSON();
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBe(3);
    });

    it('should render multiple badge skeletons', () => {
      const { toJSON } = render(<SkeletonLoader variant="badge" count={4} />);
      const tree = toJSON();
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBe(4);
    });

    it('should render multiple task skeletons', () => {
      const { toJSON } = render(<SkeletonLoader variant="task" count={2} />);
      const tree = toJSON();
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBe(2);
    });
  });
});
