import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState({
    healthAlerts: true,
    labResults: true,
    travelHealth: true,
    medicationReminders: true,
    appointmentReminders: true,
    biomarkerAlerts: true,
    dailyHealthSummary: true,
  });

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const notificationItems = [
    {
      key: 'healthAlerts',
      title: 'Health Alerts',
      subtitle: 'Important health warnings and alerts',
      icon: 'medical-outline',
      color: '#FF3B30',
    },
    {
      key: 'labResults',
      title: 'Lab Result Updates',
      subtitle: 'When new lab results are available',
      icon: 'flask-outline',
      color: '#4CD964',
    },
    {
      key: 'travelHealth',
      title: 'Travel Health Alerts',
      subtitle: 'Health warnings for your travel destinations',
      icon: 'airplane-outline',
      color: '#007AFF',
    },
    {
      key: 'medicationReminders',
      title: 'Medication/Supplement Reminders',
      subtitle: 'Reminders to take your medications',
      icon: 'medical-outline',
      color: '#FF9500',
    },
    {
      key: 'appointmentReminders',
      title: 'Appointment Reminders',
      subtitle: 'Reminders for upcoming medical appointments',
      icon: 'calendar-outline',
      color: '#AF52DE',
    },
    {
      key: 'biomarkerAlerts',
      title: 'Biomarker Alerts',
      subtitle: 'When your biomarkers change significantly',
      icon: 'trending-up-outline',
      color: '#5856D6',
    },
    {
      key: 'dailyHealthSummary',
      title: 'Daily Health Summary',
      subtitle: 'Daily overview of your health metrics',
      icon: 'bar-chart-outline',
      color: '#34C759',
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Types</Text>
            {notificationItems.map((item) => (
              <View key={item.key} style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <View style={[styles.notificationIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.notificationDetails}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Switch
                  value={notifications[item.key as keyof typeof notifications]}
                  onValueChange={() => toggleNotification(item.key)}
                  trackColor={{ false: '#333', true: '#007AFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>

          {/* Custom Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Settings</Text>
            <TouchableOpacity style={styles.customItem}>
              <Ionicons name="time-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Notification Schedule</Text>
                <Text style={styles.itemSubtitle}>Set quiet hours and notification times</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.customItem}>
              <Ionicons name="volume-high-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Sound & Vibration</Text>
                <Text style={styles.itemSubtitle}>Customize notification sounds and haptics</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.customItem}>
              <Ionicons name="notifications-off-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Do Not Disturb</Text>
                <Text style={styles.itemSubtitle}>Temporarily silence all notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
          </View>

          {/* Notification History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification History</Text>
            <TouchableOpacity style={styles.historyItem}>
              <Ionicons name="time-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Recent Notifications</Text>
                <Text style={styles.itemSubtitle}>View your recent notification history</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
          </View>

          {/* Test Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Notifications</Text>
            <TouchableOpacity style={styles.testItem}>
              <Ionicons name="play-outline" size={22} color="#4CD964" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Send Test Notification</Text>
                <Text style={styles.itemSubtitle}>Test your notification settings</Text>
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
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  customItem: {
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
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
});

export default NotificationsScreen; 