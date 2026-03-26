import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SupportHelpScreen: React.FC = () => {
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
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support & Help</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 95 }}>
        {/* Support Card */}
        <View style={[styles.card, styles.cardTightBottom]}>
          <Text style={styles.cardHeader}>SUPPORT & HELP</Text>
          <TouchableOpacity style={[styles.cardRow, styles.tallRow50]} onPress={() => (navigation as any).navigate('FAQ')}>
            <Ionicons name="help-circle-outline" size={22} color="#3AABF0" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>FAQs</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardRow, styles.tallRow50]} onPress={handleContactSupport}>
            <Ionicons name="chatbubble-outline" size={22} color="#34C759" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardRow, styles.tallRow50]} onPress={handleReportBug}>
            <Ionicons name="bug-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Report a Bug</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardRow, styles.tallRow50, styles.lastRow]} onPress={handleFeedback}>
            <Ionicons name="chatbox-outline" size={22} color="#5856D6" style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Feedback Submission</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* FAQ Modal removed; navigates to full screen */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
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
  cardTightBottom: {
    paddingBottom: 0,
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
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  tallRow50: {
    height: 50,
  },
  lastRow: {
    borderBottomWidth: 0,
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
});

export default SupportHelpScreen;