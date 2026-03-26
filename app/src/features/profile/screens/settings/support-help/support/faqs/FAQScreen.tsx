import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FAQScreen: React.FC = () => {
  const navigation = useNavigation();

  const Section = ({ title, items, first }: { title: string; items: { q: string; a: string }[]; first?: boolean }) => (
    <View style={[styles.section, !first && styles.sectionDivider]}>
      <Text style={styles.cardHeader}>{title}</Text>
      {items.map((item, idx) => (
        <View key={idx} style={styles.faqItem}>
          <Text style={styles.question}>{idx + 1}. {item.q}</Text>
          <Text style={styles.answer}>{item.a}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95 }}>
        <Section
          first
          title="ABOUT"
          items={[
            { q: 'What is TOTO?', a: 'TOTO is your personal health hub — it stores all your medical records, connects to wearables and smart devices, tracks your biomarkers, and gives you tailored recommendations for better health.' },
            { q: 'How is TOTO different from Apple Health or Google Fit?', a: 'Unlike general health hubs, TOTO combines your medical history, wearable data, environmental health risks, and AI-powered insights into one place — plus a Travel Mode for health safety anywhere in the world.' },
            { q: 'Which devices and apps can I connect to TOTO?', a: 'You can currently sync with Apple Health, Google Fit, WHOOP, Oura, Withings, and Eight Sleep, with more coming soon (Garmin, Fitbit, Dexcom, Abbott Libre, and more).' },
          ]}
        />

        <Section
          title="USING THE APP"
        items={[
          { q: 'How do I connect my devices?', a: 'Go to Settings → Connected Devices & Integrations and select your device from the list. Sign in with your device account to allow TOTO to sync your data.' },
          { q: 'Can I import my past medical records?', a: 'Yes. Go to Medical Records → Upload and select files such as PDFs, lab results, or scanned documents. You can also connect through Apple Health/Google Fit for past wearable data.' },
          { q: 'How does Travel Mode work?', a: 'When enabled, Travel Mode auto-detects your location (or you can enter it manually) to show local health alerts, vaccination requirements, air/water quality, and jet lag plans.' },
        ]}
      />

      <Section
        title="PRIVACY & SECURITY"
        items={[
          { q: 'Is my data secure?', a: 'Yes — TOTO encrypts your data both in transit and at rest. Only you can access your full health profile unless you choose to share it.' },
          { q: 'Will TOTO sell my data?', a: 'No. TOTO will never sell your personal health information to advertisers or other third parties.' },
          { q: 'Where is my data stored?', a: 'Data is stored securely in our cloud provider infrastructure, compliant with GDPR and HIPAA standards.' },
          { q: 'Can I delete my account and all my data?', a: 'Yes — go to Settings → Privacy & Security → Delete Account & Data to permanently remove all your data from our servers.' },
        ]}
      />

      <Section
        title="NOTIFICATIONS"
        items={[
          { q: 'What reminders can I get?', a: 'Currently, TOTO supports medication reminders, appointment reminders, and jet lag bedtime/wake-up prompts. More health alerts are planned for future updates.' },
          { q: 'Can I choose when reminders are sent?', a: 'Yes — in Settings → Notifications, you can set how early you want each reminder.' },
        ]}
      />

      <Section
        title="TECHNICAL"
        items={[
          { q: 'Does TOTO work offline?', a: 'You can view saved data offline, but new data from devices or travel alerts require an internet connection.' },
          { q: 'Which phones are supported?', a: 'iOS and Android recent versions are supported.' },
          { q: 'How do I report a bug or suggest a feature?', a: 'Go to Settings → Support & Help → Feedback Submission.' },
        ]}
      />

        {/* Bottom spacing to match the gap between cards */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000' 
  },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    paddingHorizontal: 20,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 24,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 16,
    letterSpacing: 0.8,
  },
  faqItem: {
    marginBottom: 20,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  answer: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default FAQScreen;
