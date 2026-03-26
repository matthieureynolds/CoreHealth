import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import AboutInfoItem from './AboutInfoItem';

const handleLinkPress = (url: string) => Linking.openURL(url);
const handleEmailPress = (email: string) => Linking.openURL(`mailto:${email}`);

export const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

export const AppInfoSection: React.FC = () => (
  <View style={styles.section}>
    <SectionHeader title="App Information" />
    <AboutInfoItem icon="information-circle-outline" title="Version" value="1.0.0" />
    <AboutInfoItem icon="calendar-outline" title="Release Date" value="December 2024" />
    <AboutInfoItem icon="download-outline" title="Size" value="42.8 MB" />
    <AboutInfoItem icon="shield-checkmark-outline" title="Compatibility" value="iOS 14.0+, Android 8.0+" />
    <AboutInfoItem icon="language-outline" title="Languages" value="English, French, Spanish" />
  </View>
);

export const WhatsNewSection: React.FC = () => (
  <View style={styles.section}>
    <SectionHeader title="What's New" />
    <View style={styles.releaseNotes}>
      <Text style={styles.releaseTitle}>Version 1.0.0 - Initial Release</Text>
      <Text style={styles.releaseText}>
        {'• Complete health data tracking\n• Travel health monitoring\n• Biometric authentication\n• Apple Health & Google Fit integration\n• Advanced privacy controls\n• Emergency contact management\n• Personalized health insights'}
      </Text>
    </View>
  </View>
);

export const MissionSection: React.FC = () => (
  <View style={styles.section}>
    <SectionHeader title="Our Mission" />
    <View style={styles.missionContent}>
      <Text style={styles.missionText}>
        TOTO was created to empower individuals to take control of their health through intelligent tracking, personalized insights, and seamless data management. We believe that everyone deserves access to comprehensive health tools that respect privacy and put the user in control.
      </Text>
      <Text style={styles.featuresTitle}>Key Features:</Text>
      <Text style={styles.featuresText}>
        {'🏥 Comprehensive health tracking\n🔒 End-to-end encryption\n✈️ Travel health monitoring\n📊 Personalized insights\n🚨 Emergency preparedness\n🔄 Multi-platform sync\n🎯 HIPAA & GDPR compliant'}
      </Text>
    </View>
  </View>
);

export const TeamSection: React.FC = () => (
  <View style={styles.section}>
    <SectionHeader title="Development Team" />
    <AboutInfoItem icon="person-outline" title="Lead Developer" value="Matthieu Reynolds" onPress={() => handleEmailPress('matthieu@corehealth.app')} />
    <AboutInfoItem icon="medical-outline" title="Medical Advisor" value="Dr. Sarah Chen, MD" />
    <AboutInfoItem icon="shield-outline" title="Security Consultant" value="Alex Thompson" />
    <AboutInfoItem icon="analytics-outline" title="Data Scientist" value="Maya Patel, PhD" />
  </View>
);

export const TechSection: React.FC = () => (
  <View style={styles.section}>
    <SectionHeader title="Powered By" />
    <AboutInfoItem icon="logo-react" title="Frontend" value="React Native + Expo" />
    <AboutInfoItem icon="server-outline" title="Backend" value="Supabase + PostgreSQL" />
    <AboutInfoItem icon="shield-outline" title="Security" value="AES-256 Encryption" />
    <AboutInfoItem icon="cloud-outline" title="Cloud" value="AWS + HIPAA Compliance" />
    <AboutInfoItem icon="analytics-outline" title="AI/ML" value="TensorFlow + OpenAI" />
  </View>
);

export const ConnectSection: React.FC = () => (
  <View style={styles.section}>
    <SectionHeader title="Connect With Us" />
    <AboutInfoItem icon="globe-outline" title="Website" value="corehealth.app" onPress={() => handleLinkPress('https://corehealth.app')} />
    <AboutInfoItem icon="logo-twitter" title="Twitter" value="@TOTOApp" onPress={() => handleLinkPress('https://twitter.com/corehealthapp')} />
    <AboutInfoItem icon="logo-linkedin" title="LinkedIn" value="TOTO" onPress={() => handleLinkPress('https://linkedin.com/company/corehealth')} />
    <AboutInfoItem icon="logo-github" title="GitHub" value="Open Source Components" onPress={() => handleLinkPress('https://github.com/corehealth')} />
    <AboutInfoItem icon="mail-outline" title="Contact" value="hello@corehealth.app" onPress={() => handleEmailPress('hello@corehealth.app')} />
  </View>
);

export const LegalSection: React.FC = () => (
  <View style={styles.section}>
    <SectionHeader title="Legal & Compliance" />
    <AboutInfoItem icon="document-text-outline" title="HIPAA Compliant" value="Health data protection" />
    <AboutInfoItem icon="shield-checkmark-outline" title="GDPR Compliant" value="EU privacy standards" />
    <AboutInfoItem icon="checkmark-circle-outline" title="SOC 2 Type II" value="Security certification" />
    <AboutInfoItem icon="medical-outline" title="FDA Registered" value="Medical device database" />
  </View>
);

export const AcknowledgmentsSection: React.FC = () => (
  <View style={styles.section}>
    <SectionHeader title="Acknowledgments" />
    <View style={styles.acknowledgments}>
      <Text style={styles.acknowledgeText}>
        Special thanks to the open-source community, our beta testers, healthcare professionals who provided guidance, and the amazing libraries that make TOTO possible:
      </Text>
      <Text style={styles.librariesText}>
        {'• React Native & Expo\n• Supabase\n• Ionicons\n• React Navigation\n• TensorFlow\n• And many more...'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginTop: 35,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6D6D72',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 6,
    letterSpacing: -0.08,
  },
  releaseNotes: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  releaseTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  releaseText: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 20,
  },
  missionContent: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  missionText: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 22,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  featuresText: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 20,
  },
  acknowledgments: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  acknowledgeText: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 12,
  },
  librariesText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
});
