import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          CoreHealth ("we", "our", "us") is committed to protecting your privacy and health information. This Privacy Policy explains how we collect, use, store, and protect your personal and health data in compliance with GDPR, HIPAA, CCPA, and other applicable privacy laws.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Personal Information:</Text>
          {'\n'}• Name, email address, date of birth
          {'\n'}• Account credentials and profile information
          {'\n'}• Device information and app usage data
          {'\n\n'}<Text style={styles.bold}>Health Information:</Text>
          {'\n'}• Vital signs (heart rate, blood pressure, temperature)
          {'\n'}• Lab results and medical test data
          {'\n'}• Medications and treatment information
          {'\n'}• Symptoms and health observations
          {'\n'}• Sleep patterns and activity data
          {'\n'}• Emergency contact information
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use your information to:
          {'\n'}• Provide personalized health tracking and insights
          {'\n'}• Send important health reminders and notifications
          {'\n'}• Sync data across your devices
          {'\n'}• Improve app functionality and user experience
          {'\n'}• Provide customer support
          {'\n'}• Comply with legal obligations
          {'\n\n'}We do NOT use your health data for advertising or marketing purposes.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.text}>
          Your health data security is our top priority:
          {'\n'}• <Text style={styles.bold}>End-to-end encryption</Text> for all health data
          {'\n'}• <Text style={styles.bold}>HIPAA-compliant</Text> data storage and transmission
          {'\n'}• <Text style={styles.bold}>Multi-factor authentication</Text> options
          {'\n'}• <Text style={styles.bold}>Regular security audits</Text> and penetration testing
          {'\n'}• <Text style={styles.bold}>Zero-knowledge architecture</Text> - we cannot access your unencrypted health data
        </Text>

        <Text style={styles.sectionTitle}>5. Data Sharing</Text>
        <Text style={styles.text}>
          We do NOT sell your personal or health information. We may share data only in these limited circumstances:
          {'\n\n'}<Text style={styles.bold}>With Your Consent:</Text>
          {'\n'}• Healthcare providers you authorize
          {'\n'}• Family members or caregivers you designate
          {'\n'}• Third-party health apps you connect
          {'\n\n'}<Text style={styles.bold}>For Safety:</Text>
          {'\n'}• Emergency contacts during medical emergencies
          {'\n'}• Healthcare professionals if required by law
          {'\n\n'}<Text style={styles.bold}>Anonymized Data:</Text>
          {'\n'}• Aggregated, non-identifiable data for medical research (opt-in only)
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights (GDPR/CCPA)</Text>
        <Text style={styles.text}>
          You have the right to:
          {'\n'}• <Text style={styles.bold}>Access</Text> your personal data
          {'\n'}• <Text style={styles.bold}>Rectify</Text> inaccurate information
          {'\n'}• <Text style={styles.bold}>Erase</Text> your data ("right to be forgotten")
          {'\n'}• <Text style={styles.bold}>Port</Text> your data to another service
          {'\n'}• <Text style={styles.bold}>Restrict</Text> processing of your data
          {'\n'}• <Text style={styles.bold}>Object</Text> to data processing
          {'\n'}• <Text style={styles.bold}>Withdraw consent</Text> at any time
          {'\n\n'}To exercise these rights, contact us at privacy@corehealth.app
        </Text>

        <Text style={styles.sectionTitle}>7. Data Retention</Text>
        <Text style={styles.text}>
          We retain your data only as long as necessary:
          {'\n'}• <Text style={styles.bold}>Active accounts:</Text> Data retained while account is active
          {'\n'}• <Text style={styles.bold}>Deleted accounts:</Text> Data permanently deleted within 30 days
          {'\n'}• <Text style={styles.bold}>Legal requirements:</Text> Some data may be retained longer if required by law
          {'\n'}• <Text style={styles.bold}>Backup systems:</Text> Data removed from backups within 90 days
        </Text>

        <Text style={styles.sectionTitle}>8. International Transfers</Text>
        <Text style={styles.text}>
          Your data may be processed in countries other than your own. We ensure adequate protection through:
          {'\n'}• Standard Contractual Clauses (SCCs)
          {'\n'}• Adequacy decisions by relevant authorities
          {'\n'}• Appropriate safeguards under GDPR Article 46
        </Text>

        <Text style={styles.sectionTitle}>9. Third-Party Integrations</Text>
        <Text style={styles.text}>
          CoreHealth may integrate with:
          {'\n'}• <Text style={styles.bold}>Apple Health:</Text> Subject to Apple's privacy policy
          {'\n'}• <Text style={styles.bold}>Google Fit:</Text> Subject to Google's privacy policy
          {'\n'}• <Text style={styles.bold}>Healthcare providers:</Text> Subject to their privacy policies
          {'\n\n'}You control which integrations to enable and can revoke access at any time.
        </Text>

        <Text style={styles.sectionTitle}>10. Children's Privacy</Text>
        <Text style={styles.text}>
          CoreHealth is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.
        </Text>

        <Text style={styles.sectionTitle}>11. Data Breach Notification</Text>
        <Text style={styles.text}>
          In the unlikely event of a data breach affecting your personal information, we will:
          {'\n'}• Notify relevant authorities within 72 hours (GDPR requirement)
          {'\n'}• Notify affected users without undue delay
          {'\n'}• Provide clear information about the breach and our response
          {'\n'}• Take immediate steps to secure the data and prevent further breaches
        </Text>

        <Text style={styles.sectionTitle}>12. Updates to This Policy</Text>
        <Text style={styles.text}>
          We may update this Privacy Policy to reflect changes in our practices or legal requirements. Material changes will be communicated through:
          {'\n'}• In-app notifications
          {'\n'}• Email notifications
          {'\n'}• Prominent notice on our website
        </Text>

        <Text style={styles.sectionTitle}>13. Contact Information</Text>
        <Text style={styles.text}>
          For privacy-related questions or concerns:
          {'\n\n'}<Text style={styles.bold}>Privacy Officer:</Text>
          {'\n'}Email: privacy@corehealth.app
          {'\n'}Address: [Your Company Address]
          {'\n\n'}<Text style={styles.bold}>Data Protection Officer (EU):</Text>
          {'\n'}Email: dpo@corehealth.app
          {'\n\n'}<Text style={styles.bold}>General Support:</Text>
          {'\n'}Email: support@corehealth.app
        </Text>

        <View style={styles.hipaaNotice}>
          <Text style={styles.noticeTitle}>HIPAA Compliance</Text>
          <Text style={styles.noticeText}>
            CoreHealth is designed to be HIPAA-compliant. We implement appropriate administrative, physical, and technical safeguards to protect your health information as required by the Health Insurance Portability and Accountability Act.
          </Text>
        </View>

        <View style={styles.gdprNotice}>
          <Text style={styles.noticeTitle}>GDPR Compliance</Text>
          <Text style={styles.noticeText}>
            For users in the European Union, we comply with the General Data Protection Regulation (GDPR). You have enhanced rights regarding your personal data, including the right to data portability and the right to be forgotten.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '600',
  },
  hipaaNotice: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  gdprNotice: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  noticeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 15,
    color: '#2E7D32',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default PrivacyPolicyScreen; 