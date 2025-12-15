/**
 * Privacy Policy Screen
 *
 * Displays the Privacy Policy in an easy-to-read format within the app.
 * COPPA-compliant with special kid-friendly summary section.
 * Updated for Apple App Store and Google Play compliance.
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
const COMPANY_NAME = 'Watchlight Interactive LLC';
const COMPANY_ADDRESS = ''; // Optional - email contact is sufficient for COPPA compliance
const EFFECTIVE_DATE = 'December 15, 2024';
const WEBSITE_URL = 'https://playbeacon.app';

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

  const handleWebsitePress = () => {
    Linking.openURL(WEBSITE_URL);
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
          <Text style={styles.summaryTitle}>👋 Hey there!</Text>
          <Text style={styles.summaryText}>
            Here's what you need to know about how PlayBeacon keeps your information safe:
          </Text>
          <View style={styles.summaryPoints}>
            <Text style={styles.summaryPoint}>✅ We save your favorite games so you can find them later</Text>
            <Text style={styles.summaryPoint}>✅ We don't share your information with anyone</Text>
            <Text style={styles.summaryPoint}>✅ We don't show you ads based on what you do</Text>
            <Text style={styles.summaryPoint}>✅ Your parents can ask us any questions</Text>
          </View>
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>Last Updated: {EFFECTIVE_DATE}</Text>

        {/* Introduction */}
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          {COMPANY_NAME} ("we," "us," or "our") operates the PlayBeacon mobile application (the "App").
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information
          when you use our App.
        </Text>
        <Text style={styles.paragraph}>
          PlayBeacon is a Roblox game discovery app designed for users of all ages, with special
          protections for children under 13 in compliance with the Children's Online Privacy
          Protection Act (COPPA).
        </Text>
        <Text style={styles.highlightBox}>
          By using PlayBeacon, you agree to the collection and use of information in accordance
          with this Privacy Policy. If you do not agree with this policy, please do not use our App.
        </Text>

        {/* Operator Information - Required for COPPA */}
        <Text style={styles.sectionTitle}>2. Operator Information</Text>
        <Text style={styles.paragraph}>
          PlayBeacon is operated by:
        </Text>
        <View style={styles.contactBox}>
          <Text style={styles.contactText}>{COMPANY_NAME}</Text>
          {COMPANY_ADDRESS ? <Text style={styles.contactText}>{COMPANY_ADDRESS}</Text> : null}
          <Text style={styles.contactText}>Email: {SUPPORT_EMAIL}</Text>
        </View>

        {/* Information We Collect */}
        <Text style={styles.sectionTitle}>3. Information We Collect</Text>

        <Text style={styles.subTitle}>3.1 Information Collected Automatically</Text>
        <Text style={styles.paragraph}>When you use PlayBeacon, we may automatically collect:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Device Information:</Text> Device type, operating system version, and unique device identifiers for app functionality and analytics</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Usage Data:</Text> Features you use, games you view, and interaction patterns (anonymized and not linked to personal identity)</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Log Data:</Text> IP address, access times, and technical error logs for debugging purposes</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Analytics:</Text> Aggregated usage statistics to improve our App</Text>
        </View>

        <Text style={styles.subTitle}>3.2 Information You Provide</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Anonymous Account:</Text> No personal information is required to use the basic features of PlayBeacon</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Roblox Username:</Text> If you choose to connect your Roblox account, we only access your public profile information</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Wishlists and Collections:</Text> Games you save are stored securely in your account</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Age Information:</Text> Birth year to determine if COPPA protections apply</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Optional Sign-In:</Text> If you sign in with Google, we receive your email address and profile name (with parental consent for users under 13)</Text>
        </View>

        <Text style={styles.subTitle}>3.3 Information We Do NOT Collect</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• We do not collect precise geolocation data</Text>
          <Text style={styles.bulletItem}>• We do not collect photos, videos, or audio from your device</Text>
          <Text style={styles.bulletItem}>• We do not collect contact lists or address books</Text>
          <Text style={styles.bulletItem}>• We do not collect financial or payment information directly (handled by app stores)</Text>
        </View>

        {/* How We Use Information */}
        <Text style={styles.sectionTitle}>4. How We Use Information</Text>
        <Text style={styles.paragraph}>We use the information we collect to:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Provide, maintain, and improve the PlayBeacon App</Text>
          <Text style={styles.bulletItem}>• Save your wishlists, collections, and preferences</Text>
          <Text style={styles.bulletItem}>• Personalize game recommendations based on your interactions</Text>
          <Text style={styles.bulletItem}>• Analyze usage patterns to improve user experience</Text>
          <Text style={styles.bulletItem}>• Diagnose technical problems and fix bugs</Text>
          <Text style={styles.bulletItem}>• Ensure compliance with our Terms of Service</Text>
          <Text style={styles.bulletItem}>• Respond to your inquiries and support requests</Text>
        </View>

        <Text style={styles.warningBox}>
          We do NOT sell, rent, or trade your personal information to third parties. We do NOT use
          your information for behavioral advertising or profiling.
        </Text>

        {/* Children's Privacy - COPPA Section */}
        <Text style={styles.sectionTitle}>5. Children's Privacy (COPPA Compliance)</Text>
        <Text style={styles.paragraph}>
          PlayBeacon is committed to protecting the privacy of children. We comply with the
          Children's Online Privacy Protection Act (COPPA) and take the following measures:
        </Text>

        <Text style={styles.subTitle}>5.1 Age Verification</Text>
        <Text style={styles.paragraph}>
          We use a neutral age-screening mechanism (birth year selection) to identify users under 13.
          We do not encourage children to provide false age information.
        </Text>

        <Text style={styles.subTitle}>5.2 Parental Consent</Text>
        <Text style={styles.paragraph}>
          For users identified as under 13, we require verifiable parental consent before collecting
          any personal information beyond what is necessary to support our internal operations.
        </Text>

        <Text style={styles.subTitle}>5.3 Limited Data Collection</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• We collect only the minimum information necessary to provide our services</Text>
          <Text style={styles.bulletItem}>• Anonymous accounts require no personal information</Text>
          <Text style={styles.bulletItem}>• We do not condition participation on disclosure of more information than necessary</Text>
        </View>

        <Text style={styles.subTitle}>5.4 No Behavioral Advertising</Text>
        <Text style={styles.paragraph}>
          We do not serve personalized or behavioral advertising to users identified as children.
          Any ads shown are contextual and age-appropriate.
        </Text>

        <Text style={styles.subTitle}>5.5 No Social Features</Text>
        <Text style={styles.paragraph}>
          PlayBeacon does not include chat, messaging, user-generated content sharing, or any
          features that would allow children to communicate with other users or share personal information publicly.
        </Text>

        {/* Parental Rights */}
        <Text style={styles.sectionTitle}>6. Parental Rights</Text>
        <Text style={styles.paragraph}>
          Parents and legal guardians of children under 13 have the following rights under COPPA:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>1. <Text style={styles.bold}>Review:</Text> Request to review the personal information we have collected from your child</Text>
          <Text style={styles.bulletItem}>2. <Text style={styles.bold}>Deletion:</Text> Request that we delete your child's personal information</Text>
          <Text style={styles.bulletItem}>3. <Text style={styles.bold}>Refuse Collection:</Text> Refuse to allow further collection of your child's information</Text>
          <Text style={styles.bulletItem}>4. <Text style={styles.bold}>Withdraw Consent:</Text> Withdraw your consent at any time</Text>
        </View>
        <Text style={styles.paragraph}>
          To exercise these rights, please contact us at {SUPPORT_EMAIL}. We will respond to
          verified requests within 30 days.
        </Text>

        {/* Third-Party Services */}
        <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
        <Text style={styles.paragraph}>PlayBeacon uses the following third-party services:</Text>

        <Text style={styles.subTitle}>7.1 Google Firebase</Text>
        <Text style={styles.paragraph}>
          We use Firebase for authentication, data storage, and analytics. Firebase's privacy policy
          can be found at: https://firebase.google.com/support/privacy
        </Text>

        <Text style={styles.subTitle}>7.2 Google AdMob</Text>
        <Text style={styles.paragraph}>
          We display advertisements through Google AdMob. For users identified as children, we serve
          only non-personalized, child-safe advertisements. AdMob's privacy policy can be found at:
          https://policies.google.com/privacy
        </Text>

        <Text style={styles.subTitle}>7.3 Roblox API</Text>
        <Text style={styles.paragraph}>
          We access publicly available Roblox game information to provide game recommendations.
          We do not share your data with Roblox. Roblox's privacy policy can be found at:
          https://en.help.roblox.com/hc/articles/115004630823
        </Text>

        <Text style={styles.subTitle}>7.4 Expo / React Native</Text>
        <Text style={styles.paragraph}>
          Our App is built using Expo and React Native frameworks. These may collect anonymous
          crash reports and usage statistics.
        </Text>

        {/* Data Security */}
        <Text style={styles.sectionTitle}>8. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate technical and organizational measures to protect your information:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• All data transmission is encrypted using industry-standard TLS/SSL</Text>
          <Text style={styles.bulletItem}>• Data is stored securely in Google Cloud infrastructure</Text>
          <Text style={styles.bulletItem}>• Access to personal information is restricted to authorized personnel only</Text>
          <Text style={styles.bulletItem}>• We regularly review and update our security practices</Text>
        </View>
        <Text style={styles.paragraph}>
          While we strive to protect your information, no method of electronic transmission or
          storage is 100% secure. We cannot guarantee absolute security.
        </Text>

        {/* Data Retention */}
        <Text style={styles.sectionTitle}>9. Data Retention</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Anonymous Accounts:</Text> Data is retained while the account is active. Accounts inactive for 12 months may be deleted.</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Signed-In Accounts:</Text> Data is retained until you request deletion or delete your account.</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Analytics Data:</Text> Aggregated, anonymized data may be retained indefinitely for product improvement.</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Support Communications:</Text> Retained for up to 2 years for quality assurance purposes.</Text>
        </View>

        {/* Your Rights - For all users */}
        <Text style={styles.sectionTitle}>10. Your Rights</Text>
        <Text style={styles.paragraph}>Depending on your location, you may have the following rights:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Access:</Text> Request a copy of your personal data</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Correction:</Text> Request correction of inaccurate data</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Deletion:</Text> Request deletion of your data</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Portability:</Text> Request your data in a portable format</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Opt-Out:</Text> Opt out of certain data collection practices</Text>
        </View>

        <Text style={styles.subTitle}>10.1 How to Delete Your Account</Text>
        <Text style={styles.paragraph}>
          You can delete your account and all associated data by:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>1. Going to Settings in the App</Text>
          <Text style={styles.bulletItem}>2. Selecting "Delete Account"</Text>
          <Text style={styles.bulletItem}>3. Confirming your choice</Text>
        </View>
        <Text style={styles.paragraph}>
          Alternatively, you can email us at {SUPPORT_EMAIL} to request account deletion.
          We will process deletion requests within 30 days.
        </Text>

        {/* California Privacy Rights */}
        <Text style={styles.sectionTitle}>11. California Privacy Rights (CCPA)</Text>
        <Text style={styles.paragraph}>
          If you are a California resident, you have additional rights under the California Consumer
          Privacy Act (CCPA):
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Right to know what personal information we collect and how it's used</Text>
          <Text style={styles.bulletItem}>• Right to delete your personal information</Text>
          <Text style={styles.bulletItem}>• Right to opt-out of the sale of personal information (we do not sell personal information)</Text>
          <Text style={styles.bulletItem}>• Right to non-discrimination for exercising your privacy rights</Text>
        </View>

        {/* International Users */}
        <Text style={styles.sectionTitle}>12. International Users</Text>
        <Text style={styles.paragraph}>
          PlayBeacon is operated from the United States. If you are accessing our App from outside
          the United States, please be aware that your information may be transferred to, stored,
          and processed in the United States where our servers are located.
        </Text>
        <Text style={styles.paragraph}>
          By using PlayBeacon, you consent to the transfer of your information to the United States
          and the use of your information in accordance with this Privacy Policy.
        </Text>

        {/* Changes to Privacy Policy */}
        <Text style={styles.sectionTitle}>13. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Posting the new Privacy Policy in the App</Text>
          <Text style={styles.bulletItem}>• Updating the "Last Updated" date at the top of this policy</Text>
          <Text style={styles.bulletItem}>• Sending a notification through the App for material changes</Text>
        </View>
        <Text style={styles.paragraph}>
          We encourage you to review this Privacy Policy periodically. Your continued use of
          PlayBeacon after any changes constitutes acceptance of the updated policy.
        </Text>

        {/* Contact */}
        <Text style={styles.sectionTitle}>14. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, wish to exercise your rights, or have
          concerns about how we handle your information, please contact us:
        </Text>
        <View style={styles.contactBox}>
          <Text style={styles.contactLabel}>Email:</Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.emailLink}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
          {COMPANY_ADDRESS ? (
            <>
              <Text style={styles.contactLabel}>Mail:</Text>
              <Text style={styles.contactText}>{COMPANY_NAME}</Text>
              <Text style={styles.contactText}>{COMPANY_ADDRESS}</Text>
            </>
          ) : null}
        </View>
        <Text style={styles.paragraph}>
          We will respond to all inquiries within 30 days.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This Privacy Policy is effective as of {EFFECTIVE_DATE}.
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
    marginTop: 8,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
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
