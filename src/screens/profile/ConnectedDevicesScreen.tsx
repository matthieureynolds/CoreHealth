import React, { useState } from 'react';
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

const ConnectedDevicesScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Mock connected devices data
  const [connectedDevices, setConnectedDevices] = useState([
    {
      id: '1',
      name: 'WHOOP®',
      logo: 'fitness-outline',
      color: '#4CD964',
      status: 'Connected',
      lastSync: '2 hours ago',
    },
    {
      id: '2',
      name: 'Apple Health',
      logo: 'logo-apple',
      color: '#007AFF',
      status: 'Connected',
      lastSync: '1 hour ago',
    },
  ]);

  // Available devices to connect (sorted alphabetically, official names with trademarks)
  const availableDevices = [
    {
      id: 'apple-health',
      name: 'Apple Health',
      logo: 'logo-apple',
      color: '#007AFF',
      description: 'iOS aggregator',
    },
    {
      id: 'dexcom',
      name: 'Dexcom®',
      logo: 'medical-outline',
      color: '#FF9500',
      description: 'Continuous glucose monitoring',
    },
    {
      id: 'eight-sleep',
      name: 'Eight Sleep™',
      logo: 'bed-outline',
      color: '#34C759',
      description: 'Smart mattress & sleep tracking',
    },
    {
      id: 'fitbit',
      name: 'Fitbit®',
      logo: 'fitness-outline',
      color: '#FF3B30',
      description: 'Activity & health tracking',
    },
    {
      id: 'freestyle-libre',
      name: 'FreeStyle Libre®',
      logo: 'medical-outline',
      color: '#007AFF',
      description: 'Glucose monitoring system',
    },
    {
      id: 'garmin',
      name: 'Garmin® Connect',
      logo: 'watch-outline',
      color: '#FF9500',
      description: 'Fitness devices & wearables',
    },
    {
      id: 'oura',
      name: 'Oura Ring™',
      logo: 'bed-outline',
      color: '#AF52DE',
      description: 'Sleep & recovery tracking',
    },
    {
      id: 'withings-bp',
      name: 'Withings® BPM Connect',
      logo: 'heart-outline',
      color: '#FF3B30',
      description: 'Systolic, diastolic, heart rate',
    },
    {
      id: 'withings-scale',
      name: 'Withings® Body+',
      logo: 'scale-outline',
      color: '#34C759',
      description: 'Weight, body fat, muscle mass',
    },
    {
      id: 'withings-sleep',
      name: 'Withings® Sleep Tracker',
      logo: 'bed-outline',
      color: '#AF52DE',
      description: 'Sleep stages, HR, breathing',
    },
    {
      id: 'withings-thermometer',
      name: 'Withings® Thermo',
      logo: 'thermometer-outline',
      color: '#FF9500',
      description: 'Body temperature readings',
    },
    {
      id: 'withings-uscan',
      name: 'Withings® U-Scan',
      logo: 'water-outline',
      color: '#007AFF',
      description: 'Toilet urine analyzer',
    },
    {
      id: 'withings-watch',
      name: 'Withings® ScanWatch',
      logo: 'watch-outline',
      color: '#34C759',
      description: 'HR, steps, workouts, sleep',
    },
    {
      id: 'zoe',
      name: 'ZOE™',
      logo: 'restaurant-outline',
      color: '#FF3B30',
      description: 'Nutrition & gut health insights',
    },
  ];

  // Filter out already connected devices from available list
  const filteredAvailableDevices = availableDevices.filter(availableDevice => 
    !connectedDevices.some(connectedDevice => 
      connectedDevice.name.toLowerCase().includes(availableDevice.name.toLowerCase().replace(/[®™]/g, '').trim())
    )
  );

  const handleConnectDevice = (device: any) => {
    Alert.alert(
      `Connect ${device.name}`,
      `Would you like to connect your ${device.name} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Connect', 
          onPress: () => {
            // Simulate connection process
            setTimeout(() => {
              const newDevice = {
                id: Date.now().toString(),
                name: device.name,
                logo: device.logo,
                color: device.color,
                status: 'Connected',
                lastSync: 'Just now',
              };
              setConnectedDevices([...connectedDevices, newDevice]);
              Alert.alert('Success', `${device.name} connected successfully!`);
            }, 1000);
          }
        },
      ]
    );
  };

  const handleDisconnectDevice = (deviceId: string, deviceName: string) => {
    Alert.alert(
      'Disconnect Device',
      `Are you sure you want to disconnect ${deviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => {
            setConnectedDevices(connectedDevices.filter(device => device.id !== deviceId));
            Alert.alert('Success', `${deviceName} disconnected successfully`);
          }
        },
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
          {/* Currently Connected Section */}
          {connectedDevices.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Currently Connected</Text>
              {connectedDevices.map((device) => (
                <View key={device.id} style={styles.deviceCard}>
                  <View style={styles.deviceInfo}>
                    <View style={[styles.deviceLogo, { backgroundColor: device.color + '20' }]}>
                      <Ionicons name={device.logo as any} size={24} color={device.color} />
                    </View>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceStatus}>{device.status}</Text>
                      <Text style={styles.deviceLastSync}>Last sync: {device.lastSync}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={() => handleDisconnectDevice(device.id, device.name)}
                  >
                    <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="phone-portrait-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>No devices connected yet</Text>
              <Text style={styles.emptyStateSubtext}>Connect your first device to start syncing health data</Text>
            </View>
          )}

          {/* Available to Connect Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available to Connect</Text>
            {filteredAvailableDevices.map((device) => (
              <View key={device.id} style={styles.deviceCard}>
                <View style={styles.deviceInfo}>
                  <View style={[styles.deviceLogo, { backgroundColor: device.color + '20' }]}>
                    <Ionicons name={device.logo as any} size={24} color={device.color} />
                  </View>
                  <View style={styles.deviceDetails}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    {device.description && (
                      <Text style={styles.deviceDescription}>{device.description}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.connectButtonSmall}
                  onPress={() => handleConnectDevice(device)}
                >
                  <Text style={styles.connectButtonSmallText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  deviceLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  deviceDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
    marginBottom: 2,
  },
  deviceLastSync: {
    fontSize: 12,
    color: '#888',
  },
  disconnectButton: {
    padding: 8,
  },
  connectButtonSmall: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  connectButtonSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 30,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConnectedDevicesScreen; 