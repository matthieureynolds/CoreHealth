import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const HelpSupportScreen: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I sync my health data?',
      answer: 'CoreHealth automatically syncs your data when you have an internet connection. You can also manually sync by pulling down on the main screen or going to Settings > Data & Sync > Sync Now.',
    },
    {
      id: '2',
      question: 'Is my health data secure?',
      answer: 'Yes, absolutely. We use end-to-end encryption for all health data. Your information is stored securely and never shared with third parties without your explicit consent. We comply with HIPAA, GDPR, and other privacy regulations.',
    },
    {
      id: '3',
      question: 'How do I add emergency contacts?',
      answer: 'Go to Settings > Health & Emergency > Emergency Contacts. Tap the + button to add contacts. These contacts can be reached in case of a medical emergency.',
    },
    {
      id: '4',
      question: 'Why am I not receiving notifications?',
      answer: 'Check that notifications are enabled in Settings > Notifications & Alerts. Also verify that CoreHealth has notification permissions in your device settings.',
    },
    {
      id: '5',
      question: 'How do I export my health data?',
      answer: 'Go to Settings > Privacy & Security > Export Personal Data. You can export your data as a PDF report or structured JSON file.',
    },
    {
      id: '6',
      question: 'Can I use CoreHealth while traveling?',
      answer: 'Yes! CoreHealth has dedicated travel health features. Go to Settings > Travel Settings to enable automatic travel health monitoring and timezone adjustments.',
    },
    {
      id: '7',
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password". Enter your email address and follow the instructions sent to your email.',
    },
    {
      id: '8',
      question: 'What health metrics does CoreHealth track?',
      answer: 'CoreHealth tracks vital signs, lab results, medications, symptoms, sleep patterns, exercise, and more. You can customize which metrics to track in your profile settings.',
    },
  ];

  const handleEmailSupport = () => {
    const subject = 'CoreHealth Support Request';
    const body = 'Hi CoreHealth Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nApp Version: 1.0.0\nDevice: [Your device info]\n\nThank you!';
    
    Linking.openURL(`mailto:support@corehealth.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleReportBug = () => {
    const subject = 'CoreHealth Bug Report';
    const body = 'Hi CoreHealth Team,\n\nI found a bug:\n\nWhat happened:\n[Describe the issue]\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n[What should have happened]\n\nApp Version: 1.0.0\nDevice: [Your device info]\n\nThank you!';
    
    Linking.openURL(`mailto:bugs@corehealth.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleFeatureRequest = () => {
    const subject = 'CoreHealth Feature Request';
    const body = 'Hi CoreHealth Team,\n\nI would like to suggest a new feature:\n\n[Describe your feature idea]\n\nWhy this would be helpful:\n[Explain the benefit]\n\nThank you for considering my suggestion!';
    
    Linking.openURL(`mailto:features@corehealth.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Our support team is available Monday-Friday, 9 AM - 6 PM EST. For immediate assistance, please email support@corehealth.app',
      [{ text: 'OK' }]
    );
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const ContactItem = ({ 
    icon, 
    title, 
    subtitle,
    onPress 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      <View style={styles.contactItemLeft}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
        <View style={styles.contactItemText}>
          <Text style={styles.contactItemTitle}>{title}</Text>
          <Text style={styles.contactItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const FAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedFAQ === item.id;
    
    return (
      <View style={styles.faqItem}>
        <TouchableOpacity 
          style={styles.faqQuestion}
          onPress={() => toggleFAQ(item.id)}
        >
          <Text style={styles.faqQuestionText}>{item.question}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#8E8E93" 
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Contact Support */}
      <View style={styles.section}>
        <SectionHeader title="Get Help" />
        
        <ContactItem
          icon="mail-outline"
          title="Email Support"
          subtitle="Get help from our team within 24 hours"
          onPress={handleEmailSupport}
        />
        
        <ContactItem
          icon="chatbubbles-outline"
          title="Live Chat"
          subtitle="Chat with us Monday-Friday, 9 AM - 6 PM EST"
          onPress={handleLiveChat}
        />
        
        <ContactItem
          icon="bug-outline"
          title="Report a Bug"
          subtitle="Found something that's not working?"
          onPress={handleReportBug}
        />
        
        <ContactItem
          icon="bulb-outline"
          title="Request a Feature"
          subtitle="Have an idea to improve CoreHealth?"
          onPress={handleFeatureRequest}
        />
      </View>

      {/* Frequently Asked Questions */}
      <View style={styles.section}>
        <SectionHeader title="Frequently Asked Questions" />
        
        {faqData.map((item) => (
          <FAQItem key={item.id} item={item} />
        ))}
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <SectionHeader title="Quick Links" />
        
        <ContactItem
          icon="book-outline"
          title="User Guide"
          subtitle="Learn how to use CoreHealth features"
          onPress={() => Linking.openURL('https://corehealth.app/guide')}
        />
        
        <ContactItem
          icon="videocam-outline"
          title="Video Tutorials"
          subtitle="Watch step-by-step tutorials"
          onPress={() => Linking.openURL('https://youtube.com/@corehealth')}
        />
        
        <ContactItem
          icon="document-text-outline"
          title="Release Notes"
          subtitle="See what's new in each update"
          onPress={() => Linking.openURL('https://corehealth.app/releases')}
        />
      </View>

      {/* Emergency Notice */}
      <View style={styles.emergencySection}>
        <View style={styles.emergencyHeader}>
          <Ionicons name="medical" size={24} color="#FF3B30" />
          <Text style={styles.emergencyTitle}>Medical Emergency</Text>
        </View>
        <Text style={styles.emergencyText}>
          CoreHealth is not a substitute for professional medical advice. In case of a medical emergency, call your local emergency number (911, 112, etc.) immediately.
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
  contactItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  contactItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactItemText: {
    marginLeft: 12,
  },
  contactItemTitle: {
    fontSize: 17,
    color: '#000000',
  },
  contactItemSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  faqQuestionText: {
    fontSize: 17,
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  emergencySection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default HelpSupportScreen; 