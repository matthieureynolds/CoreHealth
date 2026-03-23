import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import locationService from '../../../../../../../../shared/services/travel/locationService';

const LocationAccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const [locationAccess, setLocationAccess] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      setIsLoading(true);
      await locationService.initialize();
      setLocationPermission(locationService.getPermissionStatus());
      setLocationAccess(locationService.isLocationEnabled());
    } catch (error) {
      console.error('Error initializing location service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    try {
      setIsLoading(true);
      if (value) {
        const success = await locationService.enableLocation();
        if (success) {
          setLocationAccess(true);
          setLocationPermission(locationService.getPermissionStatus());
          Alert.alert(
            'Location Access Granted',
            'Location access enabled for travel health features, emergency services, and location-specific health insights.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Location Permission Denied',
            'Location access is required for travel health features, emergency services, and location-specific health insights. You can enable this in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      } else {
        await locationService.disableLocation();
        setLocationAccess(false);
        setLocationPermission(locationService.getPermissionStatus());
        Alert.alert(
          'Location Access Disabled',
          'Location access has been disabled. Travel health features and location-specific health insights will not be available.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Location toggle error:', error);
      Alert.alert('Error', 'Failed to update location settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Location Access</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>LOCATION ACCESS</Text>
            <View style={[styles.cardRow, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={isLoading ? '#666' : '#007AFF'}
                  style={styles.cardIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, isLoading && styles.disabledText]}>Location Access</Text>
                  <Text style={[styles.cardSub, isLoading && styles.disabledText]}>
                    {locationAccess
                      ? 'Enabled for travel health features and emergency services'
                      : 'Allow location for travel features, emergency services, and health insights'}
                  </Text>
                </View>
              </View>
              <Switch
                value={locationAccess}
                onValueChange={handleLocationToggle}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
                disabled={isLoading}
              />
            </View>
            {locationPermission && (
              <View style={styles.statusRow}>
                <Ionicons
                  name={locationPermission === 'granted' ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={locationPermission === 'granted' ? '#34C759' : '#FF3B30'}
                  style={styles.cardIcon}
                />
                <Text style={styles.statusText}>
                  Permission: {locationPermission}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>ABOUT LOCATION SERVICES</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#007AFF" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>What Location Is Used For</Text>
                <Text style={styles.infoText}>
                  Location access enables travel health alerts, emergency services location, and location-specific health recommendations while maintaining your privacy.
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color="#34C759" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Your Privacy</Text>
                <Text style={styles.infoText}>
                  Your precise location is never stored or shared with third parties. It is used only in-session for health-relevant features you actively use.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollView: { flex: 1 },
  header: {
    paddingTop: 72, paddingBottom: 5, backgroundColor: '#181818',
    borderBottomWidth: 1, borderBottomColor: '#222', justifyContent: 'space-between',
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, elevation: 10,
  },
  backButton: { padding: 8, position: 'absolute', left: 20, top: 23.5, zIndex: 1 },
  headerTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center',
    position: 'absolute', left: 0, right: 0, paddingTop: 32.2, paddingBottom: 8,
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0 },
  card: { backgroundColor: '#181818', borderRadius: 12, marginBottom: 20, paddingVertical: 16 },
  cardHeader: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, marginHorizontal: 20, letterSpacing: 0.5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  cardIcon: { marginRight: 12 },
  cardLabel: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', flex: 1 },
  cardSub: { fontSize: 13, color: '#8E8E93' },
  disabledText: { color: '#666' },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  statusText: { fontSize: 12, color: '#8E8E93' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 20 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#8E8E93', lineHeight: 16, textAlign: 'justify' },
});

export default LocationAccessScreen;
