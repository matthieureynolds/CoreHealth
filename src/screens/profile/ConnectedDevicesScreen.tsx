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

const ConnectedDevicesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [syncEnabled, setSyncEnabled] = useState(true);
  
  const connectedDevices = [
    {
      id: '1',
      name: 'WHOOP Strap',
      type: 'Fitness Tracker',
      status: 'Connected',
      lastSync: '2 hours ago',
      icon: 'fitness-outline',
      color: '#4CD964',
    },
    {
      id: '2',
      name: 'Oura Ring',
      type: 'Sleep Tracker',
      status: 'Connected',
      lastSync: '1 hour ago',
      icon: 'bed-outline',
      color: '#007AFF',
    },
    {
      id: '3',
      name: 'Smart Toilet',
      type: 'Health Monitor',
      status: 'Connected',
      lastSync: '30 minutes ago',
      icon: 'water-outline',
      color: '#FF9500',
    },
    {
      id: '4',
      name: 'Apple Watch',
      type: 'Smartwatch',
      status: 'Connected',
      lastSync: '5 minutes ago',
      icon: 'watch-outline',
      color: '#FF3B30',
    },
  ];

  const apiTokens = [
    {
      id: '1',
      name: 'WHOOP API',
      status: 'Active',
      expires: '2024-12-31',
      icon: 'key-outline',
    },
    {
      id: '2',
      name: 'Oura API',
      status: 'Active',
      expires: '2024-11-15',
      icon: 'key-outline',
    },
  ];

  const handleDisconnectDevice = (deviceId: string) => {
    Alert.alert(
      'Disconnect Device',
      'Are you sure you want to disconnect this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => {
          Alert.alert('Success', 'Device disconnected successfully');
        }},
      ]
    );
  };

  const handleRevokeToken = (tokenId: string) => {
    Alert.alert(
      'Revoke Token',
      'Are you sure you want to revoke this API token?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Revoke', style: 'destructive', onPress: () => {
          Alert.alert('Success', 'API token revoked successfully');
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connected Devices</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          {/* Sync Status */}
          <View style={styles.section}>
            <View style={styles.syncHeader}>
              <Text style={styles.sectionTitle}>Sync Status</Text>
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.syncSubtitle}>
              {syncEnabled ? 'Auto-sync enabled' : 'Auto-sync disabled'}
            </Text>
          </View>
          
          {/* Connected Devices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Devices</Text>
            {connectedDevices.map((device) => (
              <View key={device.id} style={styles.deviceItem}>
                <View style={styles.deviceInfo}>
                  <View style={[styles.deviceIcon, { backgroundColor: device.color + '20' }]}>
                    <Ionicons name={device.icon as any} size={20} color={device.color} />
            </View>
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceType}>{device.type}</Text>
                    <Text style={styles.deviceStatus}>
                      {device.status} • Last sync: {device.lastSync}
                    </Text>
        </View>
      </View>
          <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => handleDisconnectDevice(device.id)}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
            ))}
            <TouchableOpacity style={styles.addDeviceButton}>
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addDeviceText}>Add New Device</Text>
        </TouchableOpacity>
      </View>

          {/* API Access Tokens */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Access Tokens</Text>
            {apiTokens.map((token) => (
              <View key={token.id} style={styles.tokenItem}>
                <View style={styles.tokenInfo}>
                  <Ionicons name={token.icon as any} size={20} color="#007AFF" style={styles.tokenIcon} />
                  <View style={styles.tokenDetails}>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenStatus}>
                      {token.status} • Expires: {token.expires}
            </Text>
          </View>
        </View>
              <TouchableOpacity
                  style={styles.revokeButton}
                  onPress={() => handleRevokeToken(token.id)}
              >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            ))}
            <TouchableOpacity style={styles.addTokenButton}>
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addTokenText}>Add New API Token</Text>
            </TouchableOpacity>
        </View>

          {/* Troubleshooting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Troubleshooting</Text>
            <TouchableOpacity style={styles.troubleshootItem}>
              <Ionicons name="refresh-outline" size={20} color="#007AFF" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Force Sync All Devices</Text>
                <Text style={styles.itemSubtitle}>Manually sync all connected devices</Text>
            </View>
              <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.troubleshootItem}>
              <Ionicons name="bug-outline" size={20} color="#FF9500" style={styles.itemIcon} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Connection Diagnostics</Text>
                <Text style={styles.itemSubtitle}>Test device connections and troubleshoot issues</Text>
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
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  syncSubtitle: {
    fontSize: 14,
    color: '#888',
    marginLeft: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  deviceType: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  deviceStatus: {
    fontSize: 12,
    color: '#4CD964',
  },
  disconnectButton: {
    padding: 8,
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF20',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addDeviceText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenIcon: {
    marginRight: 12,
  },
  tokenDetails: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  tokenStatus: {
    fontSize: 12,
    color: '#888',
  },
  revokeButton: {
    padding: 8,
  },
  addTokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF20',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addTokenText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  troubleshootItem: {
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
});

export default ConnectedDevicesScreen; 