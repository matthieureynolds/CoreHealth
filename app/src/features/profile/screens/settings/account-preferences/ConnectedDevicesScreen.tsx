import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ConnectedDevicesScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Connected devices (persisted)
  const [connectedDevices, setConnectedDevices] = useState([
    {
      id: '2',
      name: 'Apple Health',
      logo: require('../../../../assets/assets/device-logos/Apple-Logo.png'),
      color: '#007AFF',
      status: 'Connected',
      lastSync: '1 hour ago',
    },
    {
      id: '1',
      name: 'WHOOP®',
      logo: require('../../../../assets/assets/device-logos/WHOOP.png'),
      color: '#4CD964',
      status: 'Connected',
      lastSync: '2 hours ago',
    },
  ]);

  // Available devices to connect (sorted alphabetically, official names with trademarks)
  const availableDevices = [
    {
      id: 'whoop',
      name: 'WHOOP®',
      logo: require('../../../../assets/assets/device-logos/WHOOP.png'),
      color: '#4CD964',
      description: 'Activity & recovery tracking',
    },
    {
      id: 'apple-health',
      name: 'Apple Health',
      logo: require('../../../../assets/assets/device-logos/Apple-Logo.png'),
      color: '#007AFF',
      description: 'iOS aggregator',
    },
    {
      id: 'dexcom',
      name: 'Dexcom®',
      logo: require('../../../../assets/assets/device-logos/Dexcom.png'),
      color: '#FF9500',
      description: 'Continuous glucose monitoring',
    },
    {
      id: 'eight-sleep',
      name: 'Eight Sleep™',
      logo: require('../../../../assets/assets/device-logos/EightSleep.png'),
      color: '#34C759',
      description: 'Smart mattress & sleep tracking',
    },
    {
      id: 'fitbit',
      name: 'Fitbit®',
      logo: require('../../../../assets/assets/device-logos/Fitbit.png'),
      color: '#FF3B30',
      description: 'Activity & health tracking',
    },
    {
      id: 'freestyle-libre',
      name: 'FreeStyle Libre®',
      logo: require('../../../../assets/assets/device-logos/FreeStyle Libre.png'),
      color: '#007AFF',
      description: 'Glucose monitoring system',
    },
    {
      id: 'garmin',
      name: 'Garmin® Connect',
      logo: require('../../../../assets/assets/device-logos/Garmin.png'),
      color: '#FF9500',
      description: 'Fitness devices & wearables',
    },
    {
      id: 'oura',
      name: 'Oura Ring™',
      logo: require('../../../../assets/assets/device-logos/OURA.png'),
      color: '#AF52DE',
      description: 'Sleep & recovery tracking',
    },
    {
      id: 'withings-bp',
      name: 'Withings® BPM Connect',
      logo: require('../../../../assets/assets/device-logos/WithingsBPM2.png'),
      color: '#FF3B30',
      description: 'Systolic, diastolic, heart rate',
    },
    {
      id: 'withings-scale',
      name: 'Withings® Body+',
      logo: require('../../../../assets/assets/device-logos/Withings Body+.jpg'),
      color: '#34C759',
      description: 'Weight, body fat, muscle mass',
    },
    {
      id: 'withings-sleep',
      name: 'Withings® Sleep Tracker',
      logo: require('../../../../assets/assets/device-logos/Withings ScanWatch.jpg'),
      color: '#AF52DE',
      description: 'Sleep stages, HR, breathing',
    },
    {
      id: 'withings-thermometer',
      name: 'Withings® Thermo',
      logo: require('../../../../assets/assets/device-logos/WithingsThermo.jpg'),
      color: '#FF9500',
      description: 'Body temperature readings',
    },
    {
      id: 'withings-uscan',
      name: 'Withings® U-Scan',
      logo: require('../../../../assets/assets/device-logos/Withings U-Scan.png'),
      color: '#007AFF',
      description: 'Toilet urine analyzer',
    },
    {
      id: 'withings-watch',
      name: 'Withings® ScanWatch',
      logo: require('../../../../assets/assets/device-logos/Withings ScanWatch.jpg'),
      color: '#34C759',
      description: 'HR, steps, workouts, sleep',
    },
    {
      id: 'zoe',
      name: 'ZOE™',
      logo: require('../../../../assets/assets/device-logos/ZOE2.jpg'),
      color: '#FF3B30',
      description: 'Nutrition & gut health insights',
    },
  ];

  // Helper function to sort devices alphabetically
  const sortDevicesAlphabetically = (devices: any[]) => {
    return [...devices].sort((a, b) => a.name.localeCompare(b.name));
  };

  // Filter out already connected devices from available list and sort alphabetically
  const filteredAvailableDevices = sortDevicesAlphabetically(
    availableDevices.filter(availableDevice => 
      !connectedDevices.some(connectedDevice => 
        connectedDevice.name.toLowerCase().includes(availableDevice.name.toLowerCase().replace(/[®™]/g, '').trim())
      )
    )
  );

  // Load persisted connected devices on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('connectedDevices');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setConnectedDevices(sortDevicesAlphabetically(parsed));
          }
        } else {
          // Persist initial defaults so assistant can read them without user action
          await AsyncStorage.setItem('connectedDevices', JSON.stringify(connectedDevices));
        }
      } catch {}
    })();
  }, []);

  const persistConnected = async (list: any[]) => {
    try {
      await AsyncStorage.setItem('connectedDevices', JSON.stringify(list));
    } catch {}
  };

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
            setTimeout(async () => {
              const newDevice = {
                id: Date.now().toString(),
                name: device.name,
                logo: device.logo,
                color: device.color,
                status: 'Connected',
                lastSync: 'Just now',
              };
              const updated = sortDevicesAlphabetically([...connectedDevices, newDevice]);
              setConnectedDevices(updated);
              await persistConnected(updated);
              Alert.alert('Success', `${device.name} connected successfully!`);
            }, 1000);
          }
        },
      ]
    );
  };

    const handleDisconnectDevice = (deviceId: string, deviceName: string) => {
    Alert.alert(
      `Disconnect ${deviceName}`,
      `Are you sure you want to disconnect ${deviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => {
            // Remove from connected devices and sort
            const updated = sortDevicesAlphabetically(connectedDevices.filter(device => device.id !== deviceId));
            setConnectedDevices(updated);
            persistConnected(updated);
            
            Alert.alert('Disconnected', `${deviceName} has been disconnected.`);
          }
        },
      ]
    );
  };

  // Helper function to render device logo with white background for transparent images
  const renderDeviceLogo = (device: any) => {
    if (typeof device.logo === 'string') {
      // Icon name - render Ionicons (fallback)
      return <Ionicons name={device.logo as any} size={24} color={device.color} />;
    } else {
      // Image source - render Image with white background for transparent logos
      // Different scaling and centering for specific devices
      const getLogoStyle = (deviceName: string) => {
        switch (deviceName) {
          case 'ZOE™':
            return styles.deviceLogoImageZoe;
          case 'Apple Health':
            return styles.deviceLogoImageApple;
          case 'Withings® U-Scan':
            return styles.deviceLogoImageUScan;
          case 'Withings® Thermo':
            return styles.deviceLogoImageThermo;
          case 'Withings® Body+':
            return styles.deviceLogoImageBodyPlus;
          case 'Withings® BPM Connect':
            return styles.deviceLogoImageBPMConnect;
          default:
            return styles.deviceLogoImage;
        }
      };
      
      return (
        <View style={styles.deviceLogoContainer}>
          <Image 
            source={device.logo} 
            style={getLogoStyle(device.name)}
            resizeMode={device.name === 'ZOE™' ? 'cover' : 'contain'}
          />
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Connected Devices</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
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
                      {renderDeviceLogo(device)}
                    </View>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceStatus}>{device.status}</Text>
                      <Text style={styles.deviceLastSync}>Last sync: {device.lastSync}</Text>
          </View>
        </View>
              <TouchableOpacity
                style={styles.disconnectButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => handleDisconnectDevice(device.id, device.name)}
              >
                <Ionicons name="close" size={18} color="#FF3B30" />
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
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>Available to Connect</Text>
            {filteredAvailableDevices.map((device, index) => (
              <View key={device.id} style={[
                styles.deviceCard,
                index === filteredAvailableDevices.length - 1 ? styles.lastDeviceCard : null,
              ]}>
                <View style={styles.deviceInfo}>
                  <View style={[styles.deviceLogo, { backgroundColor: device.color + '20' }]}>
                    {renderDeviceLogo(device)}
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

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
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
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    top: 23.5,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 32.2,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  section: {
    marginBottom: 20,
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
  deviceLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  deviceLogoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  // Specific styling for each device logo
  deviceLogoImageZoe: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    transform: [{ scale: 1.25 }],
  },
  deviceLogoImageApple: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    marginTop: 0,
    transform: [{ scale: 1.4 }],
  },
  deviceLogoImageUScan: {
    width: '75%',
    height: '75%',
    alignSelf: 'center',
  },
  deviceLogoImageThermo: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
  deviceLogoImageBodyPlus: {
    width: '70%',
    height: '70%',
    alignSelf: 'center',
  },
  deviceLogoImageBPMConnect: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    transform: [{ scale: 1.6 }],
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
    padding: 0,
  },
  connectButtonSmall: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  connectButtonSmallText: {
    color: '#007AFF',
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
  bottomSpacing: {
    height: 0,
  },
  lastSection: {
    marginBottom: 0,
  },
  lastDeviceCard: {
    marginBottom: 20,
  },
});

export default ConnectedDevicesScreen; 