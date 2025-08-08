import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DataSyncScreen: React.FC = () => {
  const navigation = useNavigation();
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const syncItems = [
    {
      title: 'Export Health Data',
      subtitle: 'Download your health data as a file',
      icon: 'download-outline',
      onPress: () => Alert.alert('Export', 'Exporting your health data...'),
    },
    {
      title: 'Import Health Data',
      subtitle: 'Import health data from other sources',
      icon: 'upload-outline',
      onPress: () => Alert.alert('Import', 'Importing health data...'),
    },
    {
      title: 'Sync Frequency',
      subtitle: 'How often to sync your data',
      icon: 'sync-outline',
      onPress: () => Alert.alert('Sync Frequency', 'Configure sync frequency...'),
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
          <Text style={styles.headerTitle}>Data & Sync</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            {syncItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.syncItem}
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

          {/* Sync Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sync Settings</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="wifi-outline" size={22} color="#007AFF" style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>Wi-Fi Only Sync</Text>
                  <Text style={styles.itemSubtitle}>Only sync when connected to Wi-Fi</Text>
                </View>
              </View>
              <Switch
                value={wifiOnly}
                onValueChange={setWifiOnly}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="refresh-outline" size={22} color="#007AFF" style={styles.itemIcon} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>Auto Sync</Text>
                  <Text style={styles.itemSubtitle}>Automatically sync data in background</Text>
                </View>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Storage Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Storage</Text>
            <View style={styles.storageCard}>
              <View style={styles.storageItem}>
                <Text style={styles.storageLabel}>Used Space</Text>
                <Text style={styles.storageValue}>2.4 GB</Text>
              </View>
              <View style={styles.storageItem}>
                <Text style={styles.storageLabel}>Available</Text>
                <Text style={styles.storageValue}>45.6 GB</Text>
              </View>
              <View style={styles.storageItem}>
                <Text style={styles.storageLabel}>Last Sync</Text>
                <Text style={styles.storageValue}>2 hours ago</Text>
              </View>
            </View>
          </View>

          {/* Advanced */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advanced</Text>
            <TouchableOpacity style={styles.advancedItem}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Clear Cache</Text>
                <Text style={styles.itemSubtitle}>Free up storage space</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.advancedItem}>
              <Ionicons name="settings-outline" size={22} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Sync Settings</Text>
                <Text style={styles.itemSubtitle}>Configure advanced sync options</Text>
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
  syncItem: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storageCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  storageLabel: {
    fontSize: 14,
    color: '#888',
  },
  storageValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
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
});

export default DataSyncScreen; 