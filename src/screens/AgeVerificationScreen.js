/**
 * Age Verification Screen
 *
 * COPPA-compliant age gate that determines if the user is under 13.
 * Uses a neutral approach (birth year selection) rather than asking
 * users to lie about their age.
 *
 * For users under 13:
 * - Requires parental consent acknowledgment
 * - Explains privacy protections in kid-friendly language
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../styles/colors';
import { radii, shadows } from '../styles/kidTheme';
import { setAgeVerificationStatus } from '../utils/ageVerification';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import TermsOfServiceScreen from './TermsOfServiceScreen';
import SoundManager from '../services/SoundManager';

// Lighthouse animation for welcome screen
const lighthouseAnimation = require('../../assets/lottie/onboarding/Lighthouse Animation.json');

// Generate birth years (ages roughly 5-100)
const currentYear = new Date().getFullYear();
const COPPA_AGE_THRESHOLD = 13;
const birthYears = [];
for (let year = currentYear - 5; year >= currentYear - 100; year--) {
  birthYears.push(year);
}

export default function AgeVerificationScreen({ onComplete }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('welcome'); // welcome, birth_year, parental_consent, complete
  const [selectedYear, setSelectedYear] = useState(null);
  const [isChild, setIsChild] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  // Animation values for welcome screen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
        delay: 400,
      }),
    ]).start();
  }, []);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    const age = currentYear - year;
    const isUnderAge = age < COPPA_AGE_THRESHOLD;
    setIsChild(isUnderAge);

    if (isUnderAge) {
      // Under 13 - need parental consent
      setStep('parental_consent');
    } else {
      // 13 or older - can proceed directly
      completeVerification(false, false);
    }
  };

  const handleParentalConsent = async (hasConsent) => {
    if (hasConsent) {
      await completeVerification(true, true);
    } else {
      // No consent - cannot use the app
      Alert.alert(
        t('ageVerification.parentalPermissionTitle'),
        t('ageVerification.parentalPermissionMessage'),
        [{ text: t('common.ok'), onPress: () => setStep('birth_year') }]
      );
    }
  };

  const completeVerification = async (isChild, hasParentalConsent) => {
    await setAgeVerificationStatus({ isChild, hasParentalConsent });
    onComplete();
  };

  const handleGetStarted = () => {
    SoundManager.play('ui.tap');
    setStep('birth_year');
  };

  // Welcome screen
  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContent}>
          {/* Lighthouse Animation */}
          <Animated.View
            style={[
              styles.animationContainer,
              { opacity: fadeAnim }
            ]}
          >
            <LottieView
              source={lighthouseAnimation}
              autoPlay
              loop
              style={styles.lighthouseAnimation}
            />
          </Animated.View>

          {/* Text Content */}
          <Animated.View
            style={[
              styles.textContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeTitle}>PlayBeacon</Text>
            <Text style={styles.welcomeTagline}>
              {t('ageVerification.welcomeTagline')}
            </Text>
          </Animated.View>

          {/* Get Started Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text style={styles.getStartedButtonText}>{t('ageVerification.getStarted')}</Text>
            </TouchableOpacity>

            <Text style={styles.safetyNote}>
              🔒 {t('ageVerification.noAccountRequired')}
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Birth year selection
  if (step === 'birth_year') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('ageVerification.birthYearTitle')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('ageVerification.birthYearSubtitle')}
          </Text>
        </View>

        <ScrollView
          style={styles.yearList}
          contentContainerStyle={styles.yearListContent}
          showsVerticalScrollIndicator={true}
        >
          {birthYears.map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearItem,
                selectedYear === year && styles.yearItemSelected,
              ]}
              onPress={() => handleYearSelect(year)}
            >
              <Text
                style={[
                  styles.yearText,
                  selectedYear === year && styles.yearTextSelected,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Parental consent for under-13 users
  if (step === 'parental_consent') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.consentContent}>
          <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.title}>{t('ageVerification.parentNeededTitle')}</Text>

          <View style={styles.consentBox}>
            <Text style={styles.consentTitle}>
              {t('ageVerification.heyParents')}
            </Text>
            <Text style={styles.consentText}>
              {t('ageVerification.parentInfo')}
            </Text>

            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                • {t('ageVerification.bulletNoAccount')}
              </Text>
              <Text style={styles.bulletItem}>
                • {t('ageVerification.bulletNoChat')}
              </Text>
              <Text style={styles.bulletItem}>
                • {t('ageVerification.bulletNoSocial')}
              </Text>
              <Text style={styles.bulletItem}>
                • {t('ageVerification.bulletBrowseGames')}
              </Text>
              <Text style={styles.bulletItem}>
                • {t('ageVerification.bulletNoSellData')}
              </Text>
            </View>

            <Text style={styles.consentText}>
              {t('ageVerification.byTapping')}
            </Text>

            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>
                1. {t('ageVerification.confirmParent')}
              </Text>
              <Text style={styles.bulletItem}>
                2. {t('ageVerification.confirmPermission')}
              </Text>
              <Text style={styles.bulletItem}>
                3. {t('ageVerification.confirmPrivacy')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleParentalConsent(true)}
          >
            <Text style={styles.primaryButtonText}>{t('ageVerification.iAmParentAgree')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleParentalConsent(false)}
          >
            <Text style={styles.secondaryButtonText}>{t('common.goBack')}</Text>
          </TouchableOpacity>

          <View style={styles.legalLinks}>
            <TouchableOpacity
              onPress={() => setShowPrivacyPolicy(true)}
              accessible={true}
              accessibilityLabel={t('legal.privacyPolicyAccessibility')}
              accessibilityRole="link"
            >
              <Text style={styles.policyLink}>
                📜 {t('legal.privacyPolicy')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>|</Text>
            <TouchableOpacity
              onPress={() => setShowTermsOfService(true)}
              accessible={true}
              accessibilityLabel={t('legal.termsAccessibility')}
              accessibilityRole="link"
            >
              <Text style={styles.policyLink}>
                📋 {t('legal.termsOfService')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Privacy Policy Modal */}
        <Modal
          visible={showPrivacyPolicy}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <PrivacyPolicyScreen onClose={() => setShowPrivacyPolicy(false)} />
        </Modal>

        {/* Terms of Service Modal */}
        <Modal
          visible={showTermsOfService}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <TermsOfServiceScreen onClose={() => setShowTermsOfService(false)} />
        </Modal>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Welcome screen styles
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60, // Offset to visually center content better
  },
  animationContainer: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  lighthouseAnimation: {
    width: '100%',
    height: '100%',
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  welcomeTagline: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  getStartedButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: radii.pill,
    ...shadows.large,
    width: '100%',
    maxWidth: 300,
  },
  getStartedButtonText: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  safetyNote: {
    marginTop: 20,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  // Legacy styles for other steps
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.m,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: radii.xl,
    ...shadows.large,
  },
  primaryButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: colors.text.tertiary,
    fontSize: 16,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  yearList: {
    flex: 1,
  },
  yearListContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  yearItem: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radii.s,
    marginBottom: 8,
    alignItems: 'center',
  },
  yearItemSelected: {
    backgroundColor: colors.accent.primary,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  yearTextSelected: {
    color: colors.text.primary,
  },
  consentContent: {
    padding: 24,
    alignItems: 'center',
  },
  consentBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.m,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  consentText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 24,
    paddingLeft: 8,
  },
  policyLink: {
    fontSize: 14,
    color: colors.accent.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 32,
    gap: 12,
  },
  linkSeparator: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
