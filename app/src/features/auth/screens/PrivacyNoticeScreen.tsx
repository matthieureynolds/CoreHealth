import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SECTIONS = [
  {
    title: '1. Who We Are',
    body: 'CoreHealth ("we", "us") is the data controller for the personal health data you provide through this app. Contact: privacy@corehealth.app',
  },
  {
    title: '2. What Data We Collect',
    body: 'We collect the following categories of data:\n\n• Identity data: name, email address, date of birth\n• Health data: biomarkers, lab results, medications, allergies, conditions, vaccinations, symptoms, appointments, wearable device metrics\n• AI conversation history and the persistent health memory Toto builds from your interactions\n• Location data (only with your explicit consent): current location for travel health insights\n• Device data: app settings, push notification tokens',
  },
  {
    title: '3. Why We Process Your Data',
    body: 'Your data is processed for the following purposes:\n\n• Providing personalised AI health insights (legal basis: Article 9(2)(a) explicit consent)\n• Maintaining your health record within the app (legal basis: Article 9(2)(a) explicit consent)\n• AI memory: building a persistent understanding of your health to eliminate recency bias (legal basis: Article 9(2)(a) explicit consent)\n• App security and fraud prevention (legal basis: legitimate interests)',
  },
  {
    title: '4. Third Parties',
    body: 'We share data with:\n\n• OpenAI (USA): your health context is sent to GPT-4o to generate Toto\'s responses. Only data necessary for the specific query is included. OpenAI processes this under a data processing agreement.\n• AWS (EU): all data is stored in AWS eu-north-1 (Stockholm). Our database, Lambda functions, and storage are all hosted in the EU.\n\nWe do not sell your data. We do not share it with advertisers.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain your data as follows:\n\n• Medical records (biomarkers, lab results, medications, etc.): until you delete your account\n• AI conversation history: 1 year\n• Wearable device data: 2 years\n• Symptom logs: 5 years\n• Location health data: 2 years\n\nYou can delete your account and all associated data at any time from Profile → Settings → Account.',
  },
  {
    title: '6. Your Rights (GDPR)',
    body: 'Under the GDPR you have the right to:\n\n• Access your data — export everything from Profile → Settings → Health Data Download\n• Erase your data — delete your account from Profile → Settings → Account\n• Inspect and erase AI memory — Profile → Settings → Data & Privacy → Data Sharing\n• Withdraw consent — this will prevent further AI processing; your stored records are unaffected\n• Portability — your data export is provided in JSON/PDF format\n• Lodge a complaint with your national supervisory authority',
  },
  {
    title: '7. Location Data',
    body: 'Location data is used only for travel health insights (air quality, UV index, disease risk). We request your explicit consent before collecting or syncing location data to our servers. You can revoke this consent at any time from Profile → Settings → Data & Privacy → Data Sharing.',
  },
  {
    title: '8. Age',
    body: 'CoreHealth is not for users under 18. We do not knowingly collect data from minors. If you believe a minor has registered, contact us at privacy@corehealth.app and we will delete their account.',
  },
  {
    title: '9. Contact',
    body: 'Data protection enquiries: privacy@corehealth.app\n\nLast updated: May 2026',
  },
];

const PrivacyNoticeScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Privacy Notice</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.intro}>
          This Privacy Notice explains what personal data CoreHealth collects, why, and what rights you have under the GDPR.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: {
    paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818',
    borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'space-between',
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 10,
  },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center',
    position: 'absolute', left: 0, right: 0, paddingTop: 32.2, paddingBottom: 8,
  },
  content: { paddingTop: 120, paddingHorizontal: 24, paddingBottom: 40 },
  intro: { fontSize: 14, color: '#8E8E93', lineHeight: 21, marginBottom: 28 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  sectionBody: { fontSize: 14, color: '#EBEBF5CC', lineHeight: 21 },
});

export default PrivacyNoticeScreen;
