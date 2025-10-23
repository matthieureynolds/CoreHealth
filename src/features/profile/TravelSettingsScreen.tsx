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

const TravelSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [autoLocation, setAutoLocation] = useState(true);
  const [timeZoneSync, setTimeZoneSync] = useState(true);

  const travelItems = [
    {
      title: 'Auto-Detect Location',
      subtitle: 'Automatically detect your travel location',
      icon: 'location-outline',
      value: autoLocation,
      onToggle: setAutoLocation,
    },
    {
      title: 'Time Zone Sync',
      subtitle: 'Automatically adjust reminders to local time zones',
      icon: 'time-outline',
      value: timeZoneSync,
      onToggle: setTimeZoneSync,
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
          <Text style={styles.headerTitle}>Travel Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Travel Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Travel Features</Text>
            {travelItems.map((item, index) => (
              <View key={index} style={styles.travelItem}>
                <View style={styles.travelInfo}>
                  <Ionicons name={item.icon as any} size={22} color="#007AFF" style={styles.itemIcon} />
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#333', true: '#007AFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
          {/* Explanation Card */}
          <View style={styles.section}> 
            <Text style={styles.sectionTitle}>How it works</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>Auto-Detect Location updates where you are. Time Zone Sync adjusts when reminders fire to local time.</Text>
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
  travelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  travelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  advancedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    marginLeft: 'auto',
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
});

export default TravelSettingsScreen; 