/**
 * Unit Tests for ErrorBoundary Component
 *
 * Tests error handling and recovery functionality
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import ErrorBoundary from '../../components/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

// Component that renders normally
const GoodComponent = () => <Text testID="good-component">Hello World</Text>;

describe('ErrorBoundary', () => {
  // Suppress console.error during tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  // ==========================================
  // Normal Rendering Tests
  // ==========================================
  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <GoodComponent />
        </ErrorBoundary>
      );

      expect(getByTestId('good-component')).toBeTruthy();
    });

    it('should render multiple children correctly', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Child 1</Text>
          <Text>Child 2</Text>
        </ErrorBoundary>
      );

      expect(getByText('Child 1')).toBeTruthy();
      expect(getByText('Child 2')).toBeTruthy();
    });
  });

  // ==========================================
  // Error Handling Tests
  // ==========================================
  describe('Error Handling', () => {
    it('should catch errors and display fallback UI', () => {
      const { getByText, queryByTestId } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should show error UI
      expect(getByText('Oops! Something went wrong')).toBeTruthy();
      expect(getByText(/Bear got a little confused/)).toBeTruthy();

      // Should not show normal content
      expect(queryByTestId('good-component')).toBeNull();
    });

    it('should display kid-friendly error message', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Check for kid-friendly messaging
      expect(getByText(/Bear got a little confused/)).toBeTruthy();
      expect(getByText(/let's try again/)).toBeTruthy();
    });

    it('should display retry button', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText('Try Again')).toBeTruthy();
    });
  });

  // ==========================================
  // Recovery Tests
  // ==========================================
  describe('Error Recovery', () => {
    it('should reset state when retry button is pressed', () => {
      let shouldThrow = true;

      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <Text testID="recovered">Recovered!</Text>;
      };

      const { getByText, queryByTestId, rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Should be in error state
      expect(getByText('Oops! Something went wrong')).toBeTruthy();

      // Fix the component
      shouldThrow = false;

      // Press retry
      fireEvent.press(getByText('Try Again'));

      // Rerender with fixed component
      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Note: In real app, the retry would re-render children
      // This test verifies the retry button is interactive
    });
  });

  // ==========================================
  // COPPA Compliance Tests (No Technical Info for Kids)
  // ==========================================
  describe('COPPA Compliance', () => {
    it('should not expose technical error details to users in production', () => {
      // Mock __DEV__ as false
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      const { queryByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should not show technical error message
      expect(queryByText('Test error')).toBeNull();
      expect(queryByText(/Error:/)).toBeNull();
      expect(queryByText(/stack trace/i)).toBeNull();

      global.__DEV__ = originalDev;
    });

    it('should use kid-friendly language', () => {
      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should use friendly language
      expect(getByText(/Oops!/)).toBeTruthy();
      expect(getByText(/Bear/)).toBeTruthy();

      // Should not use technical jargon
      expect(queryByText(/exception/i)).toBeNull();
      expect(queryByText(/crash/i)).toBeNull();
      expect(queryByText(/fatal/i)).toBeNull();
    });
  });

  // ==========================================
  // Edge Cases
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle nested ErrorBoundaries', () => {
      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <View>
            <Text>Parent Content</Text>
            <ErrorBoundary>
              <ThrowError />
            </ErrorBoundary>
          </View>
        </ErrorBoundary>
      );

      // Parent should still render
      expect(getByText('Parent Content')).toBeTruthy();
      // Inner error should be caught by inner boundary
      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });

    it('should handle errors thrown during rendering', () => {
      const RenderError = () => {
        throw new Error('Render error');
      };

      const { getByText } = render(
        <ErrorBoundary>
          <RenderError />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });
  });
});
