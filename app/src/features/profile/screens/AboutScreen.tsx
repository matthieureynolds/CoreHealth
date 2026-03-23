import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen: React.FC = () => {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const InfoItem = ({ 
    icon, 
    title, 
    value,
    onPress 
  }: {
    icon: string;
    title: string;
    value: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.infoItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.infoItemLeft}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
        <Text style={styles.infoItemTitle}>{title}</Text>
      </View>
      <View style={styles.infoItemRight}>
        <Text style={[styles.infoItemValue, onPress && styles.linkText]}>{value}</Text>
        {onPress && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      {/* App Logo and Name */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={64} color="#FF3B30" />
        </View>
        <Text style={styles.appName}>CoreHealth</Text>
        <Text style={styles.tagline}>Your Personal Health Companion</Text>
        <Text style={styles.version}>Version 1.0.0 (Build 001)</Text>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <SectionHeader title="App Information" />
        
        <InfoItem
          icon="information-circle-outline"
          title="Version"
          value="1.0.0"
        />
        
        <InfoItem
          icon="calendar-outline"
          title="Release Date"
          value="December 2024"
        />
        
        <InfoItem
          icon="download-outline"
          title="Size"
          value="42.8 MB"
        />
        
        <InfoItem
          icon="shield-checkmark-outline"
          title="Compatibility"
          value="iOS 14.0+, Android 8.0+"
        />
        
        <InfoItem
          icon="language-outline"
          title="Languages"
          value="English, French, Spanish"
        />
      </View>

      {/* What's New */}
      <View style={styles.section}>
        <SectionHeader title="What's New" />
        
        <View style={styles.releaseNotes}>
          <Text style={styles.releaseTitle}>Version 1.0.0 - Initial Release</Text>
          <Text style={styles.releaseText}>
            • Complete health data tracking
            {'\n'}• Travel health monitoring
            {'\n'}• Biometric authentication
            {'\n'}• Apple Health & Google Fit integration
            {'\n'}• Advanced privacy controls
            {'\n'}• Emergency contact management
            {'\n'}• Personalized health insights
          </Text>
        </View>
      </View>

      {/* About CoreHealth */}
      <View style={styles.section}>
        <SectionHeader title="Our Mission" />
        
        <View style={styles.missionContent}>
          <Text style={styles.missionText}>
            CoreHealth was created to empower individuals to take control of their health through intelligent tracking, personalized insights, and seamless data management. We believe that everyone deserves access to comprehensive health tools that respect privacy and put the user in control.
          </Text>
          
          <Text style={styles.featuresTitle}>Key Features:</Text>
          <Text style={styles.featuresText}>
            🏥 Comprehensive health tracking
            {'\n'}🔒 End-to-end encryption
            {'\n'}✈️ Travel health monitoring
            {'\n'}📊 Personalized insights
            {'\n'}🚨 Emergency preparedness
            {'\n'}🔄 Multi-platform sync
            {'\n'}🎯 HIPAA & GDPR compliant
          </Text>
        </View>
      </View>

      {/* Team */}
      <View style={styles.section}>
        <SectionHeader title="Development Team" />
        
        <InfoItem
          icon="person-outline"
          title="Lead Developer"
          value="Matthieu Reynolds"
          onPress={() => handleEmailPress('matthieu@corehealth.app')}
        />
        
        <InfoItem
          icon="medical-outline"
          title="Medical Advisor"
          value="Dr. Sarah Chen, MD"
        />
        
        <InfoItem
          icon="shield-outline"
          title="Security Consultant"
          value="Alex Thompson"
        />
        
        <InfoItem
          icon="analytics-outline"
          title="Data Scientist"
          value="Maya Patel, PhD"
        />
      </View>

      {/* Technology */}
      <View style={styles.section}>
        <SectionHeader title="Powered By" />
        
        <InfoItem
          icon="logo-react"
          title="Frontend"
          value="React Native + Expo"
        />
        
        <InfoItem
          icon="server-outline"
          title="Backend"
          value="Supabase + PostgreSQL"
        />
        
        <InfoItem
          icon="shield-outline"
          title="Security"
          value="AES-256 Encryption"
        />
        
        <InfoItem
          icon="cloud-outline"
          title="Cloud"
          value="AWS + HIPAA Compliance"
        />
        
        <InfoItem
          icon="analytics-outline"
          title="AI/ML"
          value="TensorFlow + OpenAI"
        />
      </View>

      {/* Links */}
      <View style={styles.section}>
        <SectionHeader title="Connect With Us" />
        
        <InfoItem
          icon="globe-outline"
          title="Website"
          value="corehealth.app"
          onPress={() => handleLinkPress('https://corehealth.app')}
        />
        
        <InfoItem
          icon="logo-twitter"
          title="Twitter"
          value="@CoreHealthApp"
          onPress={() => handleLinkPress('https://twitter.com/corehealthapp')}
        />
        
        <InfoItem
          icon="logo-linkedin"
          title="LinkedIn"
          value="CoreHealth"
          onPress={() => handleLinkPress('https://linkedin.com/company/corehealth')}
        />
        
        <InfoItem
          icon="logo-github"
          title="GitHub"
          value="Open Source Components"
          onPress={() => handleLinkPress('https://github.com/corehealth')}
        />
        
        <InfoItem
          icon="mail-outline"
          title="Contact"
          value="hello@corehealth.app"
          onPress={() => handleEmailPress('hello@corehealth.app')}
        />
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <SectionHeader title="Legal & Compliance" />
        
        <InfoItem
          icon="document-text-outline"
          title="HIPAA Compliant"
          value="Health data protection"
        />
        
        <InfoItem
          icon="shield-checkmark-outline"
          title="GDPR Compliant"
          value="EU privacy standards"
        />
        
        <InfoItem
          icon="checkmark-circle-outline"
          title="SOC 2 Type II"
          value="Security certification"
        />
        
        <InfoItem
          icon="medical-outline"
          title="FDA Registered"
          value="Medical device database"
        />
      </View>

      {/* Acknowledgments */}
      <View style={styles.section}>
        <SectionHeader title="Acknowledgments" />
        
        <View style={styles.acknowledgments}>
          <Text style={styles.acknowledgeText}>
            Special thanks to the open-source community, our beta testers, healthcare professionals who provided guidance, and the amazing libraries that make CoreHealth possible:
          </Text>
          
          <Text style={styles.librariesText}>
            • React Native & Expo
            {'\n'}• Supabase
            {'\n'}• Ionicons
            {'\n'}• React Navigation
            {'\n'}• TensorFlow
            {'\n'}• And many more...
          </Text>
        </View>
      </View>

      {/* Copyright */}
      <View style={styles.footer}>
        <Text style={styles.copyright}>
          © 2024 CoreHealth. All rights reserved.
        </Text>
        <Text style={styles.footerText}>
          Made with ❤️ for better health outcomes
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#8E8E93',
  },
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
  infoItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 17,
    color: '#000000',
    marginLeft: 12,
  },
  infoItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemValue: {
    fontSize: 17,
    color: '#8E8E93',
    marginRight: 8,
  },
  linkText: {
    color: '#007AFF',
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
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 35,
  },
  copyright: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default AboutScreen; 