import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FAQScreen: React.FC = () => {
  const Section = ({ title, items }: { title: string; items: { q: string; a: string }[] }) => (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>{title}</Text>
      {items.map((item, idx) => (
        <View key={idx} style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Text style={styles.question}>{idx + 1}. {item.q}</Text>
          <Text style={styles.answer}>{item.a}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}> 
        <TouchableOpacity onPress={() => history.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 24 }} />
      </View>

      <Section
        title="GENERAL"
        items={[
          { q: 'What is CoreHealth?', a: 'CoreHealth is your personal health hub — it stores all your medical records, connects to wearables and smart devices, tracks your biomarkers, and gives you tailored recommendations for better health.' },
          { q: 'How is CoreHealth different from Apple Health or Google Fit?', a: 'Unlike general health hubs, CoreHealth combines your medical history, wearable data, environmental health risks, and AI-powered insights into one place — plus a Travel Mode for health safety anywhere in the world.' },
          { q: 'Which devices and apps can I connect to CoreHealth?', a: 'You can currently sync with Apple Health, Google Fit, WHOOP, Oura, Withings, and Eight Sleep, with more coming soon (Garmin, Fitbit, Dexcom, Abbott Libre, and more).' },
        ]}
      />

      <Section
        title="USING THE APP"
        items={[
          { q: 'How do I connect my devices?', a: 'Go to Settings → Connected Devices & Integrations and select your device from the list. Sign in with your device account to allow CoreHealth to sync your data.' },
          { q: 'Can I import my past medical records?', a: 'Yes. Go to Medical Records → Upload and select files such as PDFs, lab results, or scanned documents. You can also connect through Apple Health/Google Fit for past wearable data.' },
          { q: 'How does Travel Mode work?', a: 'When enabled, Travel Mode auto-detects your location (or you can enter it manually) to show local health alerts, vaccination requirements, air/water quality, and jet lag plans.' },
        ]}
      />

      <Section
        title="PRIVACY & SECURITY"
        items={[
          { q: 'Is my data secure?', a: 'Yes — CoreHealth encrypts your data both in transit and at rest. Only you can access your full health profile unless you choose to share it.' },
          { q: 'Will CoreHealth sell my data?', a: 'No. CoreHealth will never sell your personal health information to advertisers or other third parties.' },
          { q: 'Where is my data stored?', a: 'Data is stored securely in our cloud provider infrastructure, compliant with GDPR and HIPAA standards.' },
          { q: 'Can I delete my account and all my data?', a: 'Yes — go to Settings → Privacy & Security → Delete Account & Data to permanently remove all your data from our servers.' },
        ]}
      />

      <Section
        title="NOTIFICATIONS"
        items={[
          { q: 'What reminders can I get?', a: 'Currently, CoreHealth supports medication reminders, appointment reminders, and jet lag bedtime/wake-up prompts. More health alerts are planned for future updates.' },
          { q: 'Can I choose when reminders are sent?', a: 'Yes — in Settings → Notifications, you can set how early you want each reminder.' },
        ]}
      />

      <Section
        title="TECHNICAL"
        items={[
          { q: 'Does CoreHealth work offline?', a: 'You can view saved data offline, but new data from devices or travel alerts require an internet connection.' },
          { q: 'Which phones are supported?', a: 'iOS and Android recent versions are supported.' },
          { q: 'How do I report a bug or suggest a feature?', a: 'Go to Settings → Support & Help → Feedback Submission.' },
        ]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#000000' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 20, marginTop: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  question: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  answer: { color: '#8E8E93', fontSize: 14, lineHeight: 20 },
});

export default FAQScreen;
