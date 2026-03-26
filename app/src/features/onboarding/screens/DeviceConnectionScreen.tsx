import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const DeviceConnectionScreen: React.FC<Props> = ({ onNext, onBack }) => {
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);

  const devices = [
    { id: 'apple_health', name: 'Apple Health', icon: 'logo-apple', color: '#3AABF0' },
    { id: 'whoop', name: 'WHOOP', icon: 'fitness', color: '#00D4AA' },
    { id: 'oura', name: 'Oura Ring', icon: 'radio', color: '#00B2CA' },
    { id: 'garmin', name: 'Garmin', icon: 'watch', color: '#007CC3' },
    { id: 'fitbit', name: 'Fitbit', icon: 'pulse', color: '#00B0B9' },
    { id: 'samsung_health', name: 'Samsung Health', icon: 'phone-portrait', color: '#1D9BF0' },
  ];

  const handleDeviceConnect = (deviceId: string) => {
    if (connectedDevices.includes(deviceId)) {
      setConnectedDevices(prev => prev.filter(id => id !== deviceId));
    } else {
      Alert.alert(
        'Connect Device',
        `Connect ${devices.find(d => d.id === deviceId)?.name} to unlock smarter tracking.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Connect', 
            onPress: () => {
              setConnectedDevices(prev => [...prev, deviceId]);
              Alert.alert('Success', 'Device connected successfully!');
            }
          }
        ]
      );
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#3AABF0" />
        </TouchableOpacity>
        <Text style={styles.title}>Connect Devices</Text>
        <Text style={styles.subtitle}>
          Connect your devices to unlock smarter tracking
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.deviceGrid}>
          {devices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceCard,
                connectedDevices.includes(device.id) && styles.deviceCardConnected
              ]}
              onPress={() => handleDeviceConnect(device.id)}
            >
              <View style={[
                styles.deviceIcon,
                { backgroundColor: device.color + '20' }
              ]}>
                <Ionicons 
                  name={device.icon as any} 
                  size={32} 
                  color={device.color} 
                />
              </View>
              <Text style={[
                styles.deviceName,
                connectedDevices.includes(device.id) && styles.deviceNameConnected
              ]}>
                {device.name}
              </Text>
              {connectedDevices.includes(device.id) && (
                <View style={styles.connectedBadge}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {connectedDevices.length > 0 && (
          <View style={styles.connectedContainer}>
            <Text style={styles.connectedTitle}>Connected Devices:</Text>
            {connectedDevices.map((deviceId) => {
              const device = devices.find(d => d.id === deviceId);
              return (
                <View key={deviceId} style={styles.connectedItem}>
                  <View style={[styles.connectedIcon, { backgroundColor: device?.color + '20' }]}>
                    <Ionicons name={device?.icon as any} size={16} color={device?.color} />
                  </View>
                  <Text style={styles.connectedText}>{device?.name}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits of Connecting:</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="analytics" size={20} color="#3AABF0" />
            <Text style={styles.benefitText}>Automatic health data sync</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="trending-up" size={20} color="#3AABF0" />
            <Text style={styles.benefitText}>Better insights and trends</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="notifications" size={20} color="#3AABF0" />
            <Text style={styles.benefitText}>Personalized recommendations</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  deviceCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  deviceCardConnected: {
    borderColor: '#3AABF0',
    backgroundColor: '#F0F8FF',
  },
  deviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  deviceNameConnected: {
    color: '#3AABF0',
    fontWeight: '600',
  },
  connectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#34C759',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  connectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3AABF0',
    marginBottom: 12,
  },
  connectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  connectedText: {
    fontSize: 14,
    color: '#3AABF0',
    fontWeight: '500',
  },
  benefitsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#3AABF0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default DeviceConnectionScreen;
