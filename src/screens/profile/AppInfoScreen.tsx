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
import { useAuth } from '../../context/AuthContext';

const AppInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const appInfoItems = [
    {
      title: 'App Version',
      value: '1.0.0',
      icon: 'information-circle-outline',
    },
    {
      title: 'Build Number',
      value: '2024.1.15',
      icon: 'code-outline',
    },
    {
      title: 'Last Updated',
      value: 'January 15, 2024',
      icon: 'calendar-outline',
    },
  ];

  const actionItems = [
    {
      title: 'Reset App',
      subtitle: 'Reset all app data and settings',
      icon: 'refresh-outline',
      color: '#FF9500',
      onPress: () => Alert.alert('Reset App', 'This will reset all app data. Continue?'),
    },
    {
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      icon: 'log-out-outline',
      color: '#FF3B30',
      onPress: () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]);
      },
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
          <Text style={styles.headerTitle}>App Info</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* App Icon and Name */}
          <View style={styles.appHeader}>
            <View style={styles.appIcon}>
              <Ionicons name="medical" size={40} color="#007AFF" />
            </View>
            <Text style={styles.appName}>CoreHealth</Text>
            <Text style={styles.appTagline}>Your Health, Simplified</Text>
          </View>

          {/* App Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Information</Text>
            {appInfoItems.map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <Ionicons name={item.icon as any} size={22} color="#007AFF" style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                <Text style={styles.itemValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            {actionItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon as any} size={22} color={item.color} style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, { color: item.color }]}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>
                CoreHealth is your comprehensive health companion, designed to help you track, 
                understand, and optimize your health journey. Built with privacy and security 
                at its core, CoreHealth provides personalized insights and actionable recommendations 
                to support your wellness goals.
              </Text>
            </View>
          </View>

          {/* Credits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Credits</Text>
            <View style={styles.creditsCard}>
              <View style={styles.creditItem}>
                <Text style={styles.creditLabel}>Development</Text>
                <Text style={styles.creditValue}>CoreHealth Team</Text>
              </View>
              <View style={styles.creditItem}>
                <Text style={styles.creditLabel}>Design</Text>
                <Text style={styles.creditValue}>CoreHealth Design</Text>
              </View>
              <View style={styles.creditItem}>
                <Text style={styles.creditLabel}>Icons</Text>
                <Text style={styles.creditValue}>Ionicons</Text>
              </View>
            </View>
          </View>

          {/* Legal Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <TouchableOpacity style={styles.legalItem}>
              <Ionicons name="document-text-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Privacy Policy</Text>
                <Text style={styles.itemSubtitle}>How we protect your data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.legalItem}>
              <Ionicons name="shield-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Terms of Service</Text>
                <Text style={styles.itemSubtitle}>Our terms and conditions</Text>
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
  appHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#888',
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
  infoItem: {
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
  itemValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 'auto',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  aboutCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  creditsCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  creditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  creditLabel: {
    fontSize: 14,
    color: '#888',
  },
  creditValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
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
});

export default AppInfoScreen; 