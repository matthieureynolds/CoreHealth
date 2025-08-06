import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';

type ConnectedDevicesScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smart_watch' | 'smart_scale' | 'blood_pressure' | 'glucose_monitor' | 'smart_toilet' | 'other';
  brand: string;
  model: string;
  isConnected: boolean;
  lastSync: string;
  batteryLevel?: number;
  syncStatus: 'syncing' | 'synced' | 'error' | 'disconnected';
}

const ConnectedDevicesScreen: React.FC = () => {
  const navigation = useNavigation<ConnectedDevicesScreenNavigationProp>();
  
  const [devices, setDevices] = useState<ConnectedDevice[]>([
    {
      id: '1',
      name: 'WHOOP 4.0',
      type: 'fitness_tracker',
      brand: 'WHOOP',
      model: '4.0',
      isConnected: true,
      lastSync: '2024-01-15 14:30',
      batteryLevel: 85,
      syncStatus: 'synced',
    },
    {
      id: '2',
      name: 'Oura Ring',
      type: 'smart_watch',
      brand: 'Oura',
      model: 'Gen 3',
      isConnected: true,
      lastSync: '2024-01-15 13:45',
      batteryLevel: 92,
      syncStatus: 'synced',
    },
    {
      id: '3',
      name: 'Withings Body+',
      type: 'smart_scale',
      brand: 'Withings',
      model: 'Body+',
      isConnected: false,
      lastSync: '2024-01-10 08:15',
      syncStatus: 'disconnected',
    },
    {
      id: '4',
      name: 'Omron Blood Pressure Monitor',
      type: 'blood_pressure',
      brand: 'Omron',
      model: 'Complete',
      isConnected: true,
      lastSync: '2024-01-15 12:20',
      syncStatus: 'synced',
    },
    {
      id: '5',
      name: 'Dexcom G7',
      type: 'glucose_monitor',
      brand: 'Dexcom',
      model: 'G7',
      isConnected: true,
      lastSync: '2024-01-15 14:00',
      syncStatus: 'syncing',
    },
  ]);

  const handleToggleDevice = (deviceId: string) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, isConnected: !device.isConnected }
          : device
      )
    );
  };

  const handleRemoveDevice = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove ${device.name}? This will disconnect it from your account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setDevices(prev => prev.filter(d => d.id !== deviceId));
            Alert.alert('Success', `${device.name} has been removed.`);
          },
        },
      ]
    );
  };

  const handleSyncDevice = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    // Simulate sync process
    setDevices(prev => 
      prev.map(d => 
        d.id === deviceId 
          ? { ...d, syncStatus: 'syncing' as const }
          : d
      )
    );

    setTimeout(() => {
      setDevices(prev => 
        prev.map(d => 
          d.id === deviceId 
            ? { 
                ...d, 
                syncStatus: 'synced' as const,
                lastSync: new Date().toLocaleString()
              }
            : d
        )
      );
      Alert.alert('Success', `${device.name} has been synced successfully.`);
    }, 2000);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'fitness_tracker':
        return 'fitness';
      case 'smart_watch':
        return 'watch';
      case 'smart_scale':
        return 'scale';
      case 'blood_pressure':
        return 'heart';
      case 'glucose_monitor':
        return 'medical';
      case 'smart_toilet':
        return 'home';
      default:
        return 'phone-portrait';
    }
  };

  const getDeviceColor = (type: string) => {
    switch (type) {
      case 'fitness_tracker':
        return '#FF9500';
      case 'smart_watch':
        return '#007AFF';
      case 'smart_scale':
        return '#4CD964';
      case 'blood_pressure':
        return '#FF3B30';
      case 'glucose_monitor':
        return '#AF52DE';
      case 'smart_toilet':
        return '#5856D6';
      default:
        return '#666';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return 'sync';
      case 'synced':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'disconnected':
        return 'cloud-offline';
      default:
        return 'help-circle';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'syncing':
        return '#007AFF';
      case 'synced':
        return '#4CD964';
      case 'error':
        return '#FF3B30';
      case 'disconnected':
        return '#999';
      default:
        return '#666';
    }
  };

  const DeviceItem = ({ device }: { device: ConnectedDevice }) => (
    <View style={styles.deviceItem}>
      <View style={styles.deviceInfo}>
        <View style={styles.deviceHeader}>
          <Ionicons 
            name={getDeviceIcon(device.type)} 
            size={24} 
            color={getDeviceColor(device.type)} 
          />
          <View style={styles.deviceDetails}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceModel}>{device.brand} {device.model}</Text>
            <Text style={styles.lastSync}>Last sync: {device.lastSync}</Text>
          </View>
        </View>
        
        <View style={styles.deviceStatus}>
          <View style={styles.statusItem}>
            <Ionicons 
              name={getSyncStatusIcon(device.syncStatus)} 
              size={16} 
              color={getSyncStatusColor(device.syncStatus)} 
            />
            <Text style={[styles.statusText, { color: getSyncStatusColor(device.syncStatus) }]}>
              {device.syncStatus.charAt(0).toUpperCase() + device.syncStatus.slice(1)}
            </Text>
          </View>
          
          {device.batteryLevel && (
            <View style={styles.statusItem}>
              <Ionicons 
                name="battery-charging" 
                size={16} 
                color={device.batteryLevel > 20 ? '#4CD964' : '#FF9500'} 
              />
              <Text style={styles.batteryText}>{device.batteryLevel}%</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.deviceActions}>
        <Switch
          value={device.isConnected}
          onValueChange={() => handleToggleDevice(device.id)}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor="#FFFFFF"
        />
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSyncDevice(device.id)}
            disabled={device.syncStatus === 'syncing'}
          >
            <Ionicons name="refresh" size={16} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRemoveDevice(device.id)}
          >
            <Ionicons name="trash" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Devices</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Add Device', 'Device pairing functionality will be implemented here.')}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="watch" size={24} color="#007AFF" />
            <Text style={styles.infoTitle}>Connected Devices</Text>
            <Text style={styles.infoText}>
              Manage your health devices and track their sync status. Connect new devices to automatically import your health data.
            </Text>
          </View>
        </View>

        {/* Devices List */}
        <View style={styles.devicesSection}>
          <Text style={styles.sectionTitle}>Your Devices ({devices.length})</Text>
          
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="watch-outline" size={64} color="#999" />
              <Text style={styles.emptyStateTitle}>No Connected Devices</Text>
              <Text style={styles.emptyStateText}>
                Connect your health devices to automatically sync your data with CoreHealth.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => Alert.alert('Add Device', 'Device pairing functionality will be implemented here.')}
              >
                <Text style={styles.emptyStateButtonText}>Add Your First Device</Text>
              </TouchableOpacity>
            </View>
          ) : (
            devices.map((device) => (
              <DeviceItem key={device.id} device={device} />
            ))
          )}
        </View>

        {/* Supported Devices */}
        <View style={styles.supportedSection}>
          <Text style={styles.sectionTitle}>Supported Devices</Text>
          <View style={styles.supportedCard}>
            <View style={styles.supportedItem}>
              <Ionicons name="fitness" size={20} color="#FF9500" />
              <Text style={styles.supportedText}>Fitness Trackers (WHOOP, Fitbit, Garmin)</Text>
            </View>
            <View style={styles.supportedItem}>
              <Ionicons name="watch" size={20} color="#007AFF" />
              <Text style={styles.supportedText}>Smart Watches (Apple Watch, Oura Ring)</Text>
            </View>
            <View style={styles.supportedItem}>
              <Ionicons name="scale" size={20} color="#4CD964" />
              <Text style={styles.supportedText}>Smart Scales (Withings, Fitbit Aria)</Text>
            </View>
            <View style={styles.supportedItem}>
              <Ionicons name="heart" size={20} color="#FF3B30" />
              <Text style={styles.supportedText}>Blood Pressure Monitors (Omron, Qardio)</Text>
            </View>
            <View style={styles.supportedItem}>
              <Ionicons name="medical" size={20} color="#AF52DE" />
              <Text style={styles.supportedText}>Glucose Monitors (Dexcom, Libre)</Text>
            </View>
            <View style={styles.supportedItem}>
              <Ionicons name="home" size={20} color="#5856D6" />
              <Text style={styles.supportedText}>Smart Toilets (Toto, Kohler)</Text>
            </View>
          </View>
        </View>

        {/* Sync Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Sync Tips</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Ionicons name="wifi" size={16} color="#4CD964" />
              <Text style={styles.tipText}>Keep devices connected to Wi-Fi for automatic syncing</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="battery-charging" size={16} color="#4CD964" />
              <Text style={styles.tipText}>Ensure devices have sufficient battery for syncing</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="refresh" size={16} color="#4CD964" />
              <Text style={styles.tipText}>Manually sync devices if automatic sync fails</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="settings" size={16} color="#4CD964" />
              <Text style={styles.tipText}>Check device settings for proper permissions</Text>
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  devicesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deviceItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deviceInfo: {
    marginBottom: 12,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  deviceModel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  lastSync: {
    fontSize: 12,
    color: '#999',
  },
  deviceStatus: {
    flexDirection: 'row',
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  batteryText: {
    fontSize: 12,
    color: '#666',
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportedSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  supportedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  supportedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  supportedText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default ConnectedDevicesScreen; 