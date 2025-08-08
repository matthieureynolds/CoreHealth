import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const LegalComplianceScreen: React.FC = () => {
  const navigation = useNavigation();

  const legalItems = [
    {
      title: 'Terms & Conditions',
      subtitle: 'Read our terms of service',
      icon: 'document-text-outline',
      onPress: () => Alert.alert('Terms', 'Opening Terms & Conditions...'),
    },
    {
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      icon: 'shield-outline',
      onPress: () => Alert.alert('Privacy', 'Opening Privacy Policy...'),
    },
    {
      title: 'Consent Forms',
      subtitle: 'Manage your data consent',
      icon: 'checkbox-outline',
      onPress: () => Alert.alert('Consent', 'Opening Consent Forms...'),
    },
    {
      title: 'HIPAA / GDPR Notices',
      subtitle: 'Region-based privacy notices',
      icon: 'globe-outline',
      onPress: () => Alert.alert('Compliance', 'Opening HIPAA/GDPR notices...'),
    },
  ];

  const complianceItems = [
    {
      title: 'Data Processing Agreement',
      subtitle: 'How we process your health data',
      icon: 'settings-outline',
      onPress: () => Alert.alert('DPA', 'Opening Data Processing Agreement...'),
    },
    {
      title: 'Cookie Policy',
      subtitle: 'How we use cookies and tracking',
      icon: 'cafe-outline',
      onPress: () => Alert.alert('Cookies', 'Opening Cookie Policy...'),
    },
    {
      title: 'Data Retention Policy',
      subtitle: 'How long we keep your data',
      icon: 'time-outline',
      onPress: () => Alert.alert('Retention', 'Opening Data Retention Policy...'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Legal & Compliance</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Legal Documents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal Documents</Text>
            {legalItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.legalItem}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon as any} size={22} color="#007AFF" style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Compliance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compliance</Text>
            {complianceItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.complianceItem}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon as any} size={22} color="#007AFF" style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Compliance Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compliance Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                <Text style={styles.statusText}>HIPAA Compliant</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                <Text style={styles.statusText}>GDPR Compliant</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                <Text style={styles.statusText}>SOC 2 Type II Certified</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                <Text style={styles.statusText}>End-to-End Encrypted</Text>
              </View>
            </View>
          </View>

          {/* Contact Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal Support</Text>
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="mail-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Contact Legal Team</Text>
                <Text style={styles.itemSubtitle}>Get help with legal questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="document-text-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Request Data</Text>
                <Text style={styles.itemSubtitle}>Request a copy of your data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#111',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  chevron: {
    marginLeft: 'auto',
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
});

export default LegalComplianceScreen; 