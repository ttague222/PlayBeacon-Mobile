/**
 * Premium Upgrade Screen
 *
 * Allows users to purchase the ad-free experience.
 * Includes confirmation gate for purchase actions.
 * Shows restore purchases option for existing customers.
 * Supports RevenueCat paywall when enabled.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { usePremium, ENABLE_REVENUECAT } from '../context/PremiumContext';
import ConfirmationGate from '../components/ConfirmationGate';
import { colors } from '../styles/colors';
import { radii, shadows } from '../styles/kidTheme';

export default function PremiumUpgradeScreen({ navigation }) {
  const { t } = useTranslation();
  const {
    isPremium,
    isLoading,
    isPurchasing,
    isIapAvailable,
    isExpoGo,
    isRevenueCatEnabled,
    purchasePremium,
    restorePurchases,
    getProductInfo,
    retryConnection,
    presentPaywall,
    showCustomerCenter,
  } = usePremium();

  const [showParentalGate, setShowParentalGate] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [productInfo, setProductInfo] = useState({
    title: 'Remove Ads',
    description: 'Remove all ads forever with a one-time purchase.',
    price: '$1.99',
    currency: 'USD',
  });

  // Load product info (async for RevenueCat)
  useEffect(() => {
    const loadProductInfo = async () => {
      const info = await getProductInfo();
      if (info) {
        setProductInfo(info);
      }
    };
    loadProductInfo();
  }, [getProductInfo]);

  const handleRetryConnection = async () => {
    if (retryConnection) {
      setIsRetrying(true);
      await retryConnection();
      setIsRetrying(false);
    }
  };

  const handlePurchasePress = () => {
    setPendingAction('purchase');
    setShowParentalGate(true);
  };

  const handlePaywallPress = () => {
    setPendingAction('paywall');
    setShowParentalGate(true);
  };

  const handleRestorePress = () => {
    setPendingAction('restore');
    setShowParentalGate(true);
  };

  const handleParentalGatePass = async () => {
    setShowParentalGate(false);

    if (pendingAction === 'purchase') {
      await purchasePremium();
    } else if (pendingAction === 'paywall') {
      // Present RevenueCat paywall
      if (presentPaywall) {
        await presentPaywall();
      } else {
        await purchasePremium();
      }
    } else if (pendingAction === 'restore') {
      await restorePurchases();
    }

    setPendingAction(null);
  };

  const handleParentalGateCancel = () => {
    setShowParentalGate(false);
    setPendingAction(null);
  };

  // Already premium - show success state
  if (isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>{t('common.done')}</Text>
        </TouchableOpacity>

        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>{t('premium.successTitle')}</Text>
          <Text style={styles.successText}>
            {t('premium.successText')}
          </Text>

          {/* Show Customer Center option for RevenueCat users */}
          {isRevenueCatEnabled && showCustomerCenter && (
            <TouchableOpacity
              style={styles.customerCenterButton}
              onPress={showCustomerCenter}
            >
              <Text style={styles.customerCenterButtonText}>
                {t('premium.managePurchase')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>{t('common.close')}</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.badge}>{t('premium.badge')}</Text>

        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>{t('premium.title')}</Text>
        <Text style={styles.subtitle}>
          {t('premium.subtitle')}
        </Text>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>{t('premium.featuresTitle')}</Text>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🚫</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('premium.featureNoAdsTitle')}</Text>
              <Text style={styles.featureDescription}>
                {t('premium.featureNoAdsDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>⚡</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('premium.featureFasterTitle')}</Text>
              <Text style={styles.featureDescription}>
                {t('premium.featureFasterDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>💝</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('premium.featureSupportTitle')}</Text>
              <Text style={styles.featureDescription}>
                {t('premium.featureSupportDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🔄</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{t('premium.featureRestoreTitle')}</Text>
              <Text style={styles.featureDescription}>
                {t('premium.featureRestoreDesc')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{productInfo.price}</Text>
          <Text style={styles.priceLabel}>{t('premium.oneTimePayment')}</Text>
        </View>

        {isExpoGo ? (
          <View style={styles.devModeNotice}>
            <Text style={styles.devModeText}>
              {t('premium.devModeNotice')}
            </Text>
          </View>
        ) : !isIapAvailable ? (
          <View style={styles.connectionErrorContainer}>
            <Text style={styles.connectionErrorText}>
              {t('premium.connectionError')}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, isRetrying && styles.buttonDisabled]}
              onPress={handleRetryConnection}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator color={colors.accent.primary} size="small" />
              ) : (
                <Text style={styles.retryButtonText}>{t('common.tryAgain')}</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.connectionHintText}>
              {t('premium.connectionHint')}
            </Text>
          </View>
        ) : (
          <>
            {/* Use RevenueCat paywall button when enabled */}
            {isRevenueCatEnabled ? (
              <TouchableOpacity
                style={[styles.purchaseButton, isPurchasing && styles.buttonDisabled]}
                onPress={handlePaywallPress}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <Text style={styles.purchaseButtonText}>
                    {t('premium.unlockButton')}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.purchaseButton, isPurchasing && styles.buttonDisabled]}
                onPress={handlePurchasePress}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <Text style={styles.purchaseButtonText}>
                    {t('premium.unlockButton')}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestorePress}
              disabled={isPurchasing}
            >
              <Text style={styles.restoreButtonText}>{t('premium.restorePurchase')}</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.purchaseNote}>
          {t('premium.purchaseNote')}
        </Text>
      </ScrollView>

      <ConfirmationGate
        visible={showParentalGate}
        onPass={handleParentalGatePass}
        onCancel={handleParentalGateCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 10 : 30, // Adjust for SafeAreaView
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 50 : 60, // SafeAreaView handles top inset
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 20 : 40, // SafeAreaView handles bottom inset
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.accent.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.l,
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.accent.primary,
    marginBottom: 20,
    overflow: 'hidden',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.m,
    padding: 20,
    width: '100%',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  purchaseButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radii.s,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  restoreButtonText: {
    fontSize: 15,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  purchaseNote: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  customerCenterButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  customerCenterButtonText: {
    fontSize: 15,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  devModeNotice: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.s,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  devModeText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  connectionErrorContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.m,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  connectionErrorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: radii.s,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  connectionHintText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
