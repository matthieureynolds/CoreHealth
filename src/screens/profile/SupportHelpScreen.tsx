import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SupportHelpScreen: React.FC = () => {
  const [showFaq, setShowFaq] = useState(false);
  const navigation = useNavigation();

  const handleContactSupport = async () => {
    const url = 'mailto:support@corehealth.com?subject=Support%20Request';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Email not configured', 'Please configure a mail app.');
    } catch (e) {
      Alert.alert('Error', 'Unable to open mail app.');
    }
  };

  const handleReportBug = async () => {
    const body = encodeURIComponent('Describe the issue:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected result:\n\nActual result:\n\n');
    const url = `mailto:support@corehealth.com?subject=Bug%20Report&body=${body}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Email not configured', 'Please configure a mail app.');
    } catch (e) {
      Alert.alert('Error', 'Unable to open mail app.');
    }
  };

  const handleFeedback = async () => {
    const url = 'mailto:feedback@corehealth.com?subject=App%20Feedback';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Email not configured', 'Please configure a mail app.');
    } catch (e) {
      Alert.alert('Error', 'Unable to open mail app.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support & Help</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* Support Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>SUPPORT & HELP</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => (navigation as any).navigate('FAQ')}>
          <Ionicons name="help-circle-outline" size={22} color="#007AFF" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>FAQs</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={handleContactSupport}>
          <Ionicons name="chatbubble-outline" size={22} color="#34C759" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Contact Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={handleReportBug}>
          <Ionicons name="bug-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Report a Bug</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={handleFeedback}>
          <Ionicons name="chatbox-outline" size={22} color="#5856D6" style={styles.cardIcon} />
          <Text style={styles.cardLabel}>Feedback Submission</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* FAQ Modal removed; navigates to full screen */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    width: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  faqQ: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  faqA: {
    color: '#8E8E93',
    fontSize: 14,
  },
});

export default SupportHelpScreen;