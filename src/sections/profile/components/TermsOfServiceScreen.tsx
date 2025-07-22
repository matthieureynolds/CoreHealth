import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

const TermsOfServiceScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

        <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
        <Text style={styles.text}>
          By accessing and using CoreHealth ("the App"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Medical Disclaimer</Text>
        <Text style={styles.text}>
          CoreHealth is NOT a medical device and is not intended to diagnose, treat, cure, or prevent any disease. The App is designed for informational and tracking purposes only. Always consult with qualified healthcare professionals before making any medical decisions.
        </Text>

        <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
        <Text style={styles.text}>
          You agree to:
          {'\n'}• Provide accurate and complete health information
          {'\n'}• Keep your account credentials secure
          {'\n'}• Use the App in compliance with all applicable laws
          {'\n'}• Not share misleading or harmful health information
          {'\n'}• Not use the App for illegal or unauthorized purposes
        </Text>

        <Text style={styles.sectionTitle}>4. Health Data and Privacy</Text>
        <Text style={styles.text}>
          Your health data is sensitive and important to us. We handle your personal health information in accordance with our Privacy Policy and applicable laws including HIPAA, GDPR, and CCPA. You retain ownership of your health data and can export or delete it at any time.
        </Text>

        <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
        <Text style={styles.text}>
          CoreHealth and its developers shall not be liable for any damages arising from:
          {'\n'}• Use or inability to use the App
          {'\n'}• Medical decisions made based on App information
          {'\n'}• Data loss or security breaches beyond our control
          {'\n'}• Third-party integrations or services
        </Text>

        <Text style={styles.sectionTitle}>6. Emergency Situations</Text>
        <Text style={styles.text}>
          CoreHealth is NOT designed for emergency medical situations. In case of a medical emergency, contact local emergency services (911, 112, etc.) immediately. Do not rely on the App for urgent medical needs.
        </Text>

        <Text style={styles.sectionTitle}>7. Data Accuracy</Text>
        <Text style={styles.text}>
          While we strive to provide accurate health tracking features, you acknowledge that:
          {'\n'}• App measurements may have inherent limitations
          {'\n'}• Technology can have errors or malfunctions
          {'\n'}• You should verify important health data with medical professionals
        </Text>

        <Text style={styles.sectionTitle}>8. Account Termination</Text>
        <Text style={styles.text}>
          We reserve the right to terminate or suspend your account if you violate these terms. You may also delete your account at any time through the App settings. Upon termination, your data will be handled according to our Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>9. Third-Party Integrations</Text>
        <Text style={styles.text}>
          CoreHealth may integrate with third-party health services (Apple Health, Google Fit, etc.). Your use of these services is subject to their respective terms and privacy policies. We are not responsible for third-party service policies or actions.
        </Text>

        <Text style={styles.sectionTitle}>10. Intellectual Property</Text>
        <Text style={styles.text}>
          The App and its original content, features, and functionality are owned by CoreHealth and are protected by international copyright, trademark, and other intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>11. Updates and Changes</Text>
        <Text style={styles.text}>
          We reserve the right to modify these terms at any time. Material changes will be communicated through the App or email. Continued use after changes indicates your acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>12. Governing Law</Text>
        <Text style={styles.text}>
          These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
        </Text>

        <Text style={styles.sectionTitle}>13. Contact Information</Text>
        <Text style={styles.text}>
          For questions about these Terms of Service, please contact us at:
          {'\n\n'}Email: legal@corehealth.app
          {'\n'}Address: [Your Company Address]
          {'\n\n'}For technical support: support@corehealth.app
        </Text>

        <View style={styles.importantNotice}>
          <Text style={styles.noticeTitle}>Important Notice</Text>
          <Text style={styles.noticeText}>
            These terms constitute a legally binding agreement. Please read them carefully and consult legal counsel if you have questions about your rights and obligations.
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
  importantNotice: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFE066',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  noticeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#B8860B',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 15,
    color: '#8E7A00',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default TermsOfServiceScreen; 