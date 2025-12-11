/**
 * Privacy Policy Screen
 *
 * Displays the Privacy Policy in an easy-to-read format within the app.
 * COPPA-compliant with special kid-friendly summary section.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { radii } from '../styles/kidTheme';

const SUPPORT_EMAIL = 'support@playbeacon.app';

export default function PrivacyPolicyScreen({ navigation, onClose }) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=PlayBeacon Privacy Question`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Kid-Friendly Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>🐻 Hey there!</Text>
          <Text style={styles.summaryText}>
            Here's what you need to know about how PlayBeacon keeps your information safe:
          </Text>
          <View style={styles.summaryPoints}>
            <Text style={styles.summaryPoint}>✅ We save your favorite games so you can find them later!</Text>
            <Text style={styles.summaryPoint}>✅ We DON'T share your information with anyone</Text>
            <Text style={styles.summaryPoint}>✅ We DON'T show you ads based on what you do</Text>
            <Text style={styles.summaryPoint}>✅ Your parents can ask us any questions!</Text>
          </View>
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

        {/* Introduction */}
        <Text style={styles.sectionTitle}>Introduction</Text>
        <Text style={styles.paragraph}>
          PlayBeacon is committed to protecting the privacy of children who use our mobile application.
          This Privacy Policy explains how we collect, use, and protect information from users of PlayBeacon,
          a Roblox game discovery app designed for children.
        </Text>
        <Text style={styles.highlightBox}>
          PlayBeacon is designed to comply with the Children's Online Privacy Protection Act (COPPA)
          and is intended for users of all ages, with special protections for children under 13.
        </Text>

        {/* Information We Collect */}
        <Text style={styles.sectionTitle}>Information We Collect</Text>

        <Text style={styles.subTitle}>Information Collected Automatically</Text>
        <Text style={styles.paragraph}>When you use PlayBeacon, we may automatically collect:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Device Information: Device type and operating system for app functionality</Text>
          <Text style={styles.bulletItem}>• Usage Data: Which features you use and games you view (not linked to you personally)</Text>
          <Text style={styles.bulletItem}>• Error Logs: Technical information to help us fix bugs</Text>
        </View>

        <Text style={styles.subTitle}>Information You Provide</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Anonymous Account: No personal information required to use the app</Text>
          <Text style={styles.bulletItem}>• Wishlist & Collections: Games you save are stored securely</Text>
          <Text style={styles.bulletItem}>• Optional Google Sign-In: Only with parental consent for users under 13</Text>
        </View>

        {/* How We Use Information */}
        <Text style={styles.sectionTitle}>How We Use Information</Text>
        <Text style={styles.paragraph}>We use collected information to:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Provide and improve the PlayBeacon app</Text>
          <Text style={styles.bulletItem}>• Save your wishlists and game collections</Text>
          <Text style={styles.bulletItem}>• Personalize game recommendations</Text>
          <Text style={styles.bulletItem}>• Fix bugs and improve performance</Text>
        </View>

        <Text style={styles.warningBox}>
          We do NOT sell personal information, use it for behavioral advertising, or share it with third parties except as described here.
        </Text>

        {/* Children's Privacy */}
        <Text style={styles.sectionTitle}>Children's Privacy</Text>
        <Text style={styles.paragraph}>We take children's privacy seriously:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• No Required Personal Information</Text>
          <Text style={styles.bulletItem}>• Parent-Gated Features for sensitive actions</Text>
          <Text style={styles.bulletItem}>• No Chat or Messaging features</Text>
          <Text style={styles.bulletItem}>• No Behavioral Advertising to children</Text>
        </View>

        {/* Parental Rights */}
        <Text style={styles.sectionTitle}>Parental Rights</Text>
        <Text style={styles.paragraph}>Parents and guardians have the right to:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>1. Review information we've collected from their child</Text>
          <Text style={styles.bulletItem}>2. Request deletion of their child's information</Text>
          <Text style={styles.bulletItem}>3. Refuse further collection of information</Text>
          <Text style={styles.bulletItem}>4. Withdraw consent at any time</Text>
        </View>

        {/* Third-Party Services */}
        <Text style={styles.sectionTitle}>Third-Party Services</Text>
        <Text style={styles.paragraph}>PlayBeacon uses the following services:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Google Firebase (authentication and storage)</Text>
          <Text style={styles.bulletItem}>• Google AdMob (child-safe, non-personalized ads)</Text>
          <Text style={styles.bulletItem}>• Roblox (public game information display only)</Text>
        </View>

        {/* Data Retention */}
        <Text style={styles.sectionTitle}>Data Retention</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Anonymous accounts: Data retained while active, may be deleted after 12 months of inactivity</Text>
          <Text style={styles.bulletItem}>• Google-linked accounts: Data retained until deletion is requested</Text>
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy or wish to exercise your parental rights:
        </Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.emailLink}>📧 {SUPPORT_EMAIL}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This Privacy Policy is effective as of December 2024.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryBox: {
    backgroundColor: colors.accent.primary + '20',
    borderRadius: radii.m,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.primary,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  summaryPoints: {
    gap: 8,
  },
  summaryPoint: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 4,
  },
  highlightBox: {
    backgroundColor: colors.accent.secondary + '20',
    borderRadius: radii.s,
    padding: 16,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: colors.warning + '20',
    borderRadius: radii.s,
    padding: 16,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 12,
  },
  emailLink: {
    fontSize: 16,
    color: colors.accent.primary,
    textDecorationLine: 'underline',
    paddingVertical: 12,
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
