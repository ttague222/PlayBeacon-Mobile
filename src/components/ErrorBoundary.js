/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * COPPA Note: Error messages are kid-friendly and don't expose technical details.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { withTranslation } from 'react-i18next';
import { colors } from '../styles/colors';
import { captureException, addBreadcrumb } from '../config/sentry';
import logger from '../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    logger.error('ErrorBoundary caught an error:', error);
    logger.error('Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Send to error tracking service
    addBreadcrumb('error_boundary', 'Error caught by boundary', {
      componentStack: errorInfo?.componentStack,
    });
    captureException(error, {
      componentStack: errorInfo?.componentStack,
      type: 'react_error_boundary',
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      // Render kid-friendly fallback UI
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Sad Bear Emoji */}
            <Text style={styles.emoji}>🐻💤</Text>

            <Text style={styles.title}>{t('components.errorBoundaryTitle')}</Text>

            <Text style={styles.message}>
              {t('components.errorBoundaryMessage')}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>{t('components.errorBoundaryButton')}</Text>
            </TouchableOpacity>

            {/* Show technical details only in development */}
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  retryButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: 'monospace',
  },
});

export default withTranslation()(ErrorBoundary);
