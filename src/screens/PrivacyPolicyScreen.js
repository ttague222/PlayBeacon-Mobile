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

const SUPPORT_EMAIL = 'support@watchlightinteractive.com';
const COMPANY_NAME = 'Watchlight Interactive LLC';
const EFFECTIVE_DATE = 'December 15, 2024';

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
          <Text style={styles.summaryTitle}>👋 Kid-Friendly Summary (For Families)</Text>
          <Text style={styles.summaryText}>
            Here's what you need to know about how PlayBeacon keeps your information safe:
          </Text>
          <View style={styles.summaryPoints}>
            <Text style={styles.summaryPoint}>✅ We save your favorite games so you can find them again</Text>
            <Text style={styles.summaryPoint}>✅ We don't sell or share your personal information</Text>
            <Text style={styles.summaryPoint}>✅ We don't use your information for targeted ads</Text>
            <Text style={styles.summaryPoint}>✅ We collect only what's needed to make the app work</Text>
            <Text style={styles.summaryPoint}>✅ Parents can contact us anytime with questions</Text>
          </View>
        </View>

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>Last Updated: {EFFECTIVE_DATE}</Text>

        {/* Introduction */}
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          PlayBeacon is operated by {COMPANY_NAME} ("we," "us," or "our"). This Privacy Policy explains
          how we collect, use, and protect information when you use the PlayBeacon mobile application (the "App").
        </Text>
        <Text style={styles.paragraph}>
          PlayBeacon is a game discovery companion app designed for users of all ages, with additional
          protections for children under 13 in compliance with the Children's Online Privacy Protection Act (COPPA).
        </Text>
        <Text style={styles.highlightBox}>
          By using the App, you agree to the practices described in this Privacy Policy. If you do not agree,
          please do not use the App.
        </Text>

        {/* Operator Information */}
        <Text style={styles.sectionTitle}>2. Operator Information</Text>
        <View style={styles.contactBox}>
          <Text style={styles.contactText}><Text style={styles.bold}>Operator:</Text> {COMPANY_NAME}</Text>
          <Text style={styles.contactText}><Text style={styles.bold}>Support Email:</Text> {SUPPORT_EMAIL}</Text>
        </View>

        {/* Information We Collect */}
        <Text style={styles.sectionTitle}>3. Information We Collect</Text>

        <Text style={styles.subTitle}>3.1 Information Collected Automatically</Text>
        <Text style={styles.paragraph}>
          We may collect limited technical information to operate and improve the App:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Device Information:</Text> Device type, operating system version</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Usage Data:</Text> Features used, games viewed, and in-app interactions</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Log Data:</Text> IP address, timestamps, and error logs for debugging</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Analytics Data:</Text> Aggregated and anonymized usage statistics</Text>
        </View>
        <Text style={styles.paragraph}>
          This information is not used to identify individual users.
        </Text>

        <Text style={styles.subTitle}>3.2 Information You Provide</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Anonymous Use:</Text> No personal information is required to use PlayBeacon's core features</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Roblox Username (Optional):</Text> If you choose to connect Roblox, we access only publicly available profile data</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Wishlists & Collections:</Text> Games you choose to save</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Age Information:</Text> Birth year to determine whether child-specific protections apply</Text>
        </View>

        <Text style={styles.subTitle}>Optional Sign-In</Text>
        <Text style={styles.paragraph}>
          Third-party sign-in (such as Google) is only available to users aged 13 and older.
          Children under 13 are not permitted to use third-party sign-in methods.
        </Text>

        <Text style={styles.subTitle}>3.3 Information We Do Not Collect</Text>
        <Text style={styles.paragraph}>We do not collect:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Precise geolocation data</Text>
          <Text style={styles.bulletItem}>• Photos, videos, or audio from your device</Text>
          <Text style={styles.bulletItem}>• Contact lists or address books</Text>
          <Text style={styles.bulletItem}>• Chat messages or user-generated content</Text>
          <Text style={styles.bulletItem}>• Financial or payment information (handled by app stores)</Text>
        </View>

        {/* How We Use Information */}
        <Text style={styles.sectionTitle}>4. How We Use Information</Text>
        <Text style={styles.paragraph}>We use collected information to:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Provide and maintain the App</Text>
          <Text style={styles.bulletItem}>• Save user preferences, wishlists, and collections</Text>
          <Text style={styles.bulletItem}>• Offer game discovery features based on in-app interactions</Text>
          <Text style={styles.bulletItem}>• Improve app performance and usability</Text>
          <Text style={styles.bulletItem}>• Diagnose technical issues and fix bugs</Text>
          <Text style={styles.bulletItem}>• Respond to support requests</Text>
        </View>

        <Text style={styles.warningBox}>
          We do not sell, rent, or trade personal information.{'\n'}
          We do not use personal information for behavioral advertising or cross-app tracking.
        </Text>

        {/* Children's Privacy */}
        <Text style={styles.sectionTitle}>5. Children's Privacy (COPPA Compliance)</Text>
        <Text style={styles.paragraph}>
          Protecting children's privacy is a core principle of PlayBeacon.
        </Text>

        <Text style={styles.subTitle}>5.1 Age Screening</Text>
        <Text style={styles.paragraph}>
          We use a neutral age-screening process (birth year) to identify users under 13.
        </Text>

        <Text style={styles.subTitle}>5.2 Limited Data Collection</Text>
        <Text style={styles.paragraph}>For children under 13:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Only the minimum data required for internal app functionality is collected</Text>
          <Text style={styles.bulletItem}>• Anonymous use is supported</Text>
          <Text style={styles.bulletItem}>• Participation is never conditioned on providing unnecessary information</Text>
        </View>

        <Text style={styles.subTitle}>5.3 Parental Consent</Text>
        <Text style={styles.paragraph}>
          If personal information beyond internal operations is ever required, verifiable parental consent will be obtained first.
        </Text>

        <Text style={styles.subTitle}>5.4 No Behavioral Advertising</Text>
        <Text style={styles.paragraph}>
          We do not serve personalized or behavioral advertising to children.
        </Text>

        <Text style={styles.subTitle}>5.5 No Social Features</Text>
        <Text style={styles.paragraph}>PlayBeacon does not include:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Chat or messaging</Text>
          <Text style={styles.bulletItem}>• Public profiles</Text>
          <Text style={styles.bulletItem}>• User-generated content sharing</Text>
        </View>

        {/* Parental Rights */}
        <Text style={styles.sectionTitle}>6. Parental Rights</Text>
        <Text style={styles.paragraph}>Parents and legal guardians may:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Review information collected from their child</Text>
          <Text style={styles.bulletItem}>• Request deletion of their child's data</Text>
          <Text style={styles.bulletItem}>• Refuse or withdraw consent</Text>
        </View>
        <Text style={styles.paragraph}>
          Requests can be made by contacting: {SUPPORT_EMAIL}
        </Text>
        <Text style={styles.paragraph}>
          We respond to verified requests within 30 days.
        </Text>

        {/* Third-Party Services */}
        <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
        <Text style={styles.paragraph}>PlayBeacon uses the following services:</Text>

        <Text style={styles.subTitle}>7.1 Google Firebase</Text>
        <Text style={styles.paragraph}>
          Used for authentication, secure data storage, and analytics.{'\n'}
          Privacy Policy: https://firebase.google.com/support/privacy
        </Text>

        <Text style={styles.subTitle}>7.2 Google AdMob</Text>
        <Text style={styles.paragraph}>
          We may display advertisements through Google AdMob.
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Ads are non-personalized</Text>
          <Text style={styles.bulletItem}>• No interest-based or cross-app tracking</Text>
          <Text style={styles.bulletItem}>• For children under 13, ads are contextual and age-appropriate, or may be disabled entirely</Text>
        </View>
        <Text style={styles.paragraph}>
          Privacy Policy: https://policies.google.com/privacy
        </Text>

        <Text style={styles.subTitle}>7.3 Roblox API</Text>
        <Text style={styles.paragraph}>
          Used to access publicly available game information.{'\n'}
          We do not share user data with Roblox.{'\n'}
          Privacy Policy: https://en.help.roblox.com/hc/articles/115004630823
        </Text>

        <Text style={styles.subTitle}>7.4 Expo / React Native</Text>
        <Text style={styles.paragraph}>
          These frameworks may collect anonymous crash and performance data.
        </Text>

        <Text style={styles.subTitle}>7.5 Error Monitoring</Text>
        <Text style={styles.paragraph}>
          We use error monitoring services to identify and fix technical issues.
          No personal information is collected through these services.
        </Text>

        {/* Data Security */}
        <Text style={styles.sectionTitle}>8. Data Security</Text>
        <Text style={styles.paragraph}>
          We use industry-standard safeguards to protect information:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Encrypted data transmission (TLS/SSL)</Text>
          <Text style={styles.bulletItem}>• Secure cloud infrastructure</Text>
          <Text style={styles.bulletItem}>• Restricted access to authorized personnel only</Text>
        </View>
        <Text style={styles.paragraph}>
          No system is 100% secure, but we regularly review and improve our protections.
        </Text>

        {/* Data Retention */}
        <Text style={styles.sectionTitle}>9. Data Retention</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Anonymous Accounts:</Text> Retained while active; may be deleted after 12 months of inactivity</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Signed-In Accounts:</Text> Retained until deleted by the user</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Analytics Data:</Text> Aggregated, anonymized data may be retained long-term</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.bold}>Support Communications:</Text> Retained up to 2 years</Text>
        </View>

        {/* Your Rights */}
        <Text style={styles.sectionTitle}>10. Your Rights</Text>
        <Text style={styles.paragraph}>Depending on your location, you may have the right to:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Access your data</Text>
          <Text style={styles.bulletItem}>• Correct inaccuracies</Text>
          <Text style={styles.bulletItem}>• Request deletion</Text>
          <Text style={styles.bulletItem}>• Request data portability</Text>
        </View>

        <Text style={styles.subTitle}>10.1 Account Deletion</Text>
        <Text style={styles.paragraph}>You can delete your account by:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Using the in-app "Delete Account" option, or</Text>
          <Text style={styles.bulletItem}>• Emailing {SUPPORT_EMAIL}</Text>
        </View>
        <Text style={styles.paragraph}>
          Requests are processed within 30 days.
        </Text>

        {/* California Privacy Rights */}
        <Text style={styles.sectionTitle}>11. California Privacy Rights (CCPA)</Text>
        <Text style={styles.paragraph}>California residents have the right to:</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Know what personal data is collected</Text>
          <Text style={styles.bulletItem}>• Request deletion</Text>
          <Text style={styles.bulletItem}>• Opt out of the sale of personal data (we do not sell data)</Text>
          <Text style={styles.bulletItem}>• Receive equal service regardless of privacy choices</Text>
        </View>

        {/* International Users */}
        <Text style={styles.sectionTitle}>12. International Users</Text>
        <Text style={styles.paragraph}>
          PlayBeacon is operated from the United States. If you access the App from outside the U.S.,
          your information may be processed in the U.S. in accordance with this policy.
        </Text>

        {/* Changes */}
        <Text style={styles.sectionTitle}>13. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Changes will be communicated by:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Updating this page</Text>
          <Text style={styles.bulletItem}>• Updating the "Last Updated" date</Text>
          <Text style={styles.bulletItem}>• Providing in-app notice for material changes</Text>
        </View>
        <Text style={styles.paragraph}>
          Continued use of the App constitutes acceptance of the updated policy.
        </Text>

        {/* Contact */}
        <Text style={styles.sectionTitle}>14. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions or concerns about this Privacy Policy, contact:
        </Text>
        <View style={styles.contactBox}>
          <Text style={styles.contactText}>{COMPANY_NAME}</Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.emailLink}>📧 {SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
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
    fontSize: 18,
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
