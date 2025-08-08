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

const SupportHelpScreen: React.FC = () => {
  const navigation = useNavigation();

  const supportItems = [
    {
      title: 'FAQs',
      subtitle: 'Frequently asked questions',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('FAQs', 'Opening Frequently Asked Questions...'),
    },
    {
      title: 'Contact Support',
      subtitle: 'Get help from our team',
      icon: 'chatbubble-outline',
      onPress: () => Alert.alert('Support', 'Opening support chat...'),
    },
    {
      title: 'Report a Bug',
      subtitle: 'Help us improve the app',
      icon: 'bug-outline',
      onPress: () => Alert.alert('Bug Report', 'Opening bug report form...'),
    },
    {
      title: 'Feedback Submission',
      subtitle: 'Share your thoughts with us',
      icon: 'chatbox-outline',
      onPress: () => Alert.alert('Feedback', 'Opening feedback form...'),
    },
  ];

  const helpItems = [
    {
      title: 'User Guide',
      subtitle: 'Learn how to use CoreHealth',
      icon: 'book-outline',
      onPress: () => Alert.alert('Guide', 'Opening user guide...'),
    },
    {
      title: 'Video Tutorials',
      subtitle: 'Watch helpful videos',
      icon: 'play-circle-outline',
      onPress: () => Alert.alert('Tutorials', 'Opening video tutorials...'),
    },
    {
      title: 'Community Forum',
      subtitle: 'Connect with other users',
      icon: 'people-outline',
      onPress: () => Alert.alert('Community', 'Opening community forum...'),
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
          <Text style={styles.headerTitle}>Support & Help</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Support Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get Help</Text>
            {supportItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.supportItem}
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

          {/* Help Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Help Resources</Text>
            {helpItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.helpItem}
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

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsCard}>
              <TouchableOpacity style={styles.quickAction}>
                <Ionicons name="refresh-outline" size={24} color="#007AFF" />
                <Text style={styles.quickActionText}>Restart App</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                <Text style={styles.quickActionText}>Clear Cache</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction}>
                <Ionicons name="settings-outline" size={24} color="#FF9500" />
                <Text style={styles.quickActionText}>Reset Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={20} color="#007AFF" />
                <Text style={styles.contactText}>support@corehealth.com</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={20} color="#007AFF" />
                <Text style={styles.contactText}>+1 (555) 123-4567</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
                <Text style={styles.contactText}>24/7 Support Available</Text>
              </View>
            </View>
          </View>

          {/* App Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                <Text style={styles.statusText}>All Systems Operational</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                <Text style={styles.statusText}>Last Updated: 2 hours ago</Text>
              </View>
            </View>
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
  supportItem: {
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  quickActionsCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 12,
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
});

export default SupportHelpScreen; 