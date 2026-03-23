import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import biometricService from '../../../../../../../../shared/services/user/biometricService';

const BiometricLockScreen: React.FC = () => {
  const navigation = useNavigation();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      setIsLoading(true);
      await biometricService.initialize();
      setBiometricAvailable(biometricService.isBiometricAvailable());
      setBiometricEnabled(biometricService.isBiometricEnabled());
    } catch (error) {
      console.error('Error initializing biometric service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      setIsLoading(true);
      if (value) {
        const success = await biometricService.enableBiometric();
        if (success) {
          setBiometricEnabled(true);
          Alert.alert(
            'Biometric Lock Enabled',
            `Your health data is now protected with ${await biometricService.getPrimaryAuthenticationMethod()}. You'll need to authenticate to access the app.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        const success = await biometricService.disableBiometric();
        if (success) {
          setBiometricEnabled(false);
          Alert.alert(
            'Biometric Lock Disabled',
            'Biometric authentication has been disabled. Your health data is no longer protected with biometric authentication.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      Alert.alert('Error', 'Failed to update biometric settings. Please try again.');
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
        <Text style={styles.headerTitle} pointerEvents="none">Biometric Lock / Face ID</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>BIOMETRIC LOCK</Text>
            <View style={[styles.cardRow, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons
                  name="finger-print-outline"
                  size={22}
                  color={!biometricAvailable || isLoading ? '#666' : '#007AFF'}
                  style={styles.cardIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, (!biometricAvailable || isLoading) && styles.disabledText]}>
                    Biometric Lock / Face ID
                  </Text>
                  <Text style={[styles.cardSub, (!biometricAvailable || isLoading) && styles.disabledText]}>
                    {!biometricAvailable
                      ? 'Biometric authentication not available on this device'
                      : biometricEnabled
                      ? 'Protecting your health data with biometric authentication'
                      : 'Use fingerprint or face recognition to secure your health data'}
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#333', true: '#007AFF' }}
                thumbColor="#FFFFFF"
                disabled={!biometricAvailable || isLoading}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>ABOUT BIOMETRIC PROTECTION</Text>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color="#34C759" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Enterprise-Grade Security</Text>
                <Text style={styles.infoText}>
                  When enabled, Face ID or Touch ID will be required to access your health data, providing enterprise-grade security for your sensitive medical information.
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="lock-closed" size={20} color="#007AFF" style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>How It Works</Text>
                <Text style={styles.infoText}>
                  Your biometric data never leaves your device. The authentication is handled entirely by your device's secure enclave, ensuring maximum privacy.
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
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 1000, elevation: 10,
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
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 20 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#8E8E93', lineHeight: 16, textAlign: 'justify' },
});

export default BiometricLockScreen;
