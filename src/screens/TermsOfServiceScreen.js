/**
 * Terms of Service Screen
 *
 * Displays the Terms of Service in an easy-to-read format within the app.
 * Kid-friendly with summary section.
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
const COMPANY_NAME = 'PlayBeacon';
const EFFECTIVE_DATE = 'December 2024';

export default function TermsOfServiceScreen({ navigation, onClose }) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=PlayBeacon Terms Question`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          accessible={true}
          accessibilityLabel="Close Terms of Service"
          accessibilityRole="button"
        >
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Kid-Friendly Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Hey there!</Text>
          <Text style={styles.summaryText}>
            Here are the rules for using PlayBeacon:
          </Text>
          <View style={styles.summaryPoints}>
            <Text style={styles.summaryPoint}>Use the app to discover cool Roblox games</Text>
            <Text style={styles.summaryPoint}>Be nice and use the app the right way</Text>
            <Text style={styles.summaryPoint}>Tell a grown-up if something seems wrong</Text>
            <Text style={styles.summaryPoint}>Have fun exploring!</Text>
          </View>
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>Last Updated: {EFFECTIVE_DATE}</Text>

        {/* Welcome */}
        <Text style={styles.paragraph}>
          These Terms of Service ("Terms") govern your use of the PlayBeacon mobile application ("App").
          By using PlayBeacon, you agree to these Terms. If you do not agree, please do not use the App.
        </Text>
        <Text style={styles.highlightBox}>
          For Parents and Guardians: PlayBeacon is designed for children. Please review these Terms
          and supervise your child's use of the App.
        </Text>

        {/* About PlayBeacon */}
        <Text style={styles.sectionTitle}>1. About PlayBeacon</Text>
        <Text style={styles.paragraph}>
          PlayBeacon is a game discovery app that helps users find and organize Roblox games. We provide:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Game recommendations and discovery features</Text>
          <Text style={styles.bulletItem}>• Personal wishlists and collections</Text>
          <Text style={styles.bulletItem}>• A fun, kid-friendly interface</Text>
        </View>
        <Text style={styles.warningBox}>
          PlayBeacon is NOT affiliated with Roblox Corporation. We display publicly available Roblox
          game information to help users discover games.
        </Text>

        {/* Who Can Use */}
        <Text style={styles.sectionTitle}>2. Who Can Use PlayBeacon</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• PlayBeacon is available to users of all ages</Text>
          <Text style={styles.bulletItem}>• Users under 13 may use the App with parental consent</Text>
          <Text style={styles.bulletItem}>• Parents/guardians are responsible for supervising their children's use</Text>
          <Text style={styles.bulletItem}>• Google Sign-In requires parental consent for users under 13</Text>
        </View>

        {/* Your Account */}
        <Text style={styles.sectionTitle}>3. Your Account</Text>

        <Text style={styles.subTitle}>Anonymous Accounts</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• By default, you use PlayBeacon with an anonymous account</Text>
          <Text style={styles.bulletItem}>• No personal information is required</Text>
          <Text style={styles.bulletItem}>• Your wishlists and collections are saved to your device</Text>
        </View>

        <Text style={styles.subTitle}>Google Sign-In (Optional)</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Requires parental consent for users under 13</Text>
          <Text style={styles.bulletItem}>• Allows syncing data across devices</Text>
          <Text style={styles.bulletItem}>• You can unlink your Google account at any time</Text>
        </View>

        <Text style={styles.subTitle}>Account Responsibilities</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Keep your device secure</Text>
          <Text style={styles.bulletItem}>• Do not share your account with others</Text>
          <Text style={styles.bulletItem}>• Report any unauthorized access to us</Text>
        </View>

        {/* Acceptable Use */}
        <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
        <Text style={styles.paragraph}>When using PlayBeacon, you agree to:</Text>

        <Text style={styles.subTitle}>DO:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Use the App for personal, non-commercial purposes</Text>
          <Text style={styles.bulletItem}>• Respect other users and our team</Text>
          <Text style={styles.bulletItem}>• Report bugs or issues to help us improve</Text>
          <Text style={styles.bulletItem}>• Follow all applicable laws</Text>
        </View>

        <Text style={styles.subTitle}>DO NOT:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Attempt to hack, reverse engineer, or modify the App</Text>
          <Text style={styles.bulletItem}>• Use automated systems to access the App</Text>
          <Text style={styles.bulletItem}>• Misuse or abuse the App in any way</Text>
          <Text style={styles.bulletItem}>• Impersonate others or provide false information</Text>
        </View>

        {/* Content and IP */}
        <Text style={styles.sectionTitle}>5. Content and Intellectual Property</Text>

        <Text style={styles.subTitle}>Our Content</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• PlayBeacon and its original content are owned by us</Text>
          <Text style={styles.bulletItem}>• You may not copy, modify, or distribute our content without permission</Text>
        </View>

        <Text style={styles.subTitle}>Roblox Content</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Game information, images, and descriptions are from Roblox</Text>
          <Text style={styles.bulletItem}>• Roblox content is subject to Roblox's terms of service</Text>
          <Text style={styles.bulletItem}>• We display this content under fair use for informational purposes</Text>
        </View>

        <Text style={styles.subTitle}>Your Content</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Your wishlists and collections are yours</Text>
          <Text style={styles.bulletItem}>• We do not claim ownership of your saved content</Text>
          <Text style={styles.bulletItem}>• You grant us permission to store and display your content within the App</Text>
        </View>

        {/* Third-Party Services */}
        <Text style={styles.sectionTitle}>6. Third-Party Services</Text>
        <Text style={styles.paragraph}>PlayBeacon uses third-party services including:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Google Firebase:</Text> For authentication and data storage</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Google AdMob:</Text> For displaying advertisements</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Roblox:</Text> For game information (display only)</Text>
        </View>
        <Text style={styles.paragraph}>
          Your use of these services is subject to their respective terms and privacy policies.
        </Text>

        {/* Advertisements */}
        <Text style={styles.sectionTitle}>7. Advertisements</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• PlayBeacon displays advertisements to support the App</Text>
          <Text style={styles.bulletItem}>• Ads are child-directed and non-personalized</Text>
          <Text style={styles.bulletItem}>• We do not control the content of third-party ads</Text>
          <Text style={styles.bulletItem}>• Report inappropriate ads to us immediately</Text>
        </View>

        {/* Disclaimers */}
        <Text style={styles.sectionTitle}>8. Disclaimers</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>AS IS:</Text> PlayBeacon is provided "as is" without warranties of any kind.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>AVAILABILITY:</Text> We do not guarantee the App will always be available or error-free.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>ROBLOX GAMES:</Text> We do not control Roblox games. Game availability and content
          may change without notice. Always review game ratings and content before playing.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>PARENTAL SUPERVISION:</Text> We recommend parents supervise their children's gaming
          activities, including games discovered through PlayBeacon.
        </Text>

        {/* Limitation of Liability */}
        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
        <Text style={styles.paragraph}>To the maximum extent permitted by law:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• We are not liable for any damages arising from your use of the App</Text>
          <Text style={styles.bulletItem}>• We are not responsible for Roblox game content or availability</Text>
          <Text style={styles.bulletItem}>• We are not liable for third-party content or services</Text>
        </View>

        {/* Changes */}
        <Text style={styles.sectionTitle}>10. Changes to These Terms</Text>
        <Text style={styles.paragraph}>
          We may update these Terms from time to time. We will notify users of significant changes by:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Updating the "Last Updated" date</Text>
          <Text style={styles.bulletItem}>• Displaying a notice in the App</Text>
        </View>
        <Text style={styles.paragraph}>
          Continued use of PlayBeacon after changes constitutes acceptance of the new Terms.
        </Text>

        {/* Termination */}
        <Text style={styles.sectionTitle}>11. Termination</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• You may stop using PlayBeacon at any time</Text>
          <Text style={styles.bulletItem}>• We may suspend or terminate access for violations of these Terms</Text>
          <Text style={styles.bulletItem}>• Upon termination, your right to use the App ends immediately</Text>
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about these Terms, please contact us:
        </Text>
        <View style={styles.contactBox}>
          <Text style={styles.contactLabel}>Email:</Text>
          <TouchableOpacity
            onPress={handleEmailPress}
            accessible={true}
            accessibilityLabel={`Email ${SUPPORT_EMAIL}`}
            accessibilityRole="link"
          >
            <Text style={styles.emailLink}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These Terms of Service are effective as of {EFFECTIVE_DATE}.
          </Text>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
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
    paddingLeft: 8,
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
  bold: {
    fontWeight: '600',
    color: colors.text.primary,
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
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  contactBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: radii.s,
    padding: 16,
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  emailLink: {
    fontSize: 16,
    color: colors.accent.primary,
    textDecorationLine: 'underline',
    paddingVertical: 4,
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
