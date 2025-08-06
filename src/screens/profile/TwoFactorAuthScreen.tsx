import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { useSettings } from '../../context/SettingsContext';

type TwoFactorAuthScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const TwoFactorAuthScreen: React.FC = () => {
  const navigation = useNavigation<TwoFactorAuthScreenNavigationProp>();
  const { settings, updatePrivacySettings } = useSettings();
  
  const [isEnabled, setIsEnabled] = useState(settings.privacy.twoFactorAuth);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle2FA = async () => {
    if (isEnabled) {
      // Disable 2FA
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                await updatePrivacySettings({ twoFactorAuth: false });
                setIsEnabled(false);
                Alert.alert('Success', 'Two-factor authentication has been disabled.');
              } catch (error) {
                Alert.alert('Error', 'Failed to disable two-factor authentication.');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } else {
      // Enable 2FA
      setIsLoading(true);
      try {
        // Simulate 2FA setup process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate backup codes
        const codes = Array.from({ length: 10 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        setBackupCodes(codes);
        
        Alert.alert(
          'Setup Complete',
          'Two-factor authentication has been enabled. Please save your backup codes in a secure location.',
          [
            {
              text: 'View Backup Codes',
              onPress: () => setShowBackupCodes(true),
            },
            { text: 'OK' },
          ]
        );
        
        await updatePrivacySettings({ twoFactorAuth: true });
        setIsEnabled(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to enable two-factor authentication.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit verification code.');
      return;
    }
    
    // Simulate verification
    Alert.alert('Success', 'Verification code is valid!');
    setVerificationCode('');
  };

  const generateNewBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    Alert.alert('Success', 'New backup codes have been generated. Please save them securely.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <Ionicons 
              name={isEnabled ? "shield-checkmark" : "shield-outline"} 
              size={32} 
              color={isEnabled ? "#4CD964" : "#FF9500"} 
            />
            <Text style={styles.statusTitle}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Text>
            <Text style={styles.statusText}>
              {isEnabled 
                ? 'Your account is protected with two-factor authentication.'
                : 'Add an extra layer of security to your account.'
              }
            </Text>
          </View>
        </View>

        {/* Main Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleCard}>
            <View style={styles.toggleHeader}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>Two-Factor Authentication</Text>
                <Text style={styles.toggleSubtitle}>
                  {isEnabled 
                    ? 'Requires a verification code in addition to your password'
                    : 'Protect your account with an additional security layer'
                  }
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle2FA}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
                disabled={isLoading}
              />
            </View>
            {isLoading && (
              <Text style={styles.loadingText}>Setting up two-factor authentication...</Text>
            )}
          </View>
        </View>

        {/* Verification Code Section */}
        {isEnabled && (
          <View style={styles.verificationSection}>
            <Text style={styles.sectionTitle}>Test Verification</Text>
            <View style={styles.verificationCard}>
              <Text style={styles.fieldLabel}>Enter 6-digit code</Text>
              <TextInput
                style={styles.codeInput}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="000000"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerifyCode}
              >
                <Text style={styles.verifyButtonText}>Verify Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Backup Codes Section */}
        {isEnabled && (
          <View style={styles.backupSection}>
            <Text style={styles.sectionTitle}>Backup Codes</Text>
            <View style={styles.backupCard}>
              <Text style={styles.backupText}>
                Save these backup codes in a secure location. You can use them to access your account if you lose your authentication device.
              </Text>
              
              {showBackupCodes ? (
                <View style={styles.codesContainer}>
                  {backupCodes.map((code, index) => (
                    <View key={index} style={styles.codeItem}>
                      <Text style={styles.codeText}>{code}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.showCodesButton}
                  onPress={() => setShowBackupCodes(true)}
                >
                  <Text style={styles.showCodesButtonText}>Show Backup Codes</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateNewBackupCodes}
              >
                <Text style={styles.generateButtonText}>Generate New Codes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Security Tips</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Ionicons name="phone-portrait" size={16} color="#4CD964" />
              <Text style={styles.tipText}>Use an authenticator app like Google Authenticator or Authy</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="lock-closed" size={16} color="#4CD964" />
              <Text style={styles.tipText}>Keep your backup codes in a secure, offline location</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="refresh" size={16} color="#4CD964" />
              <Text style={styles.tipText}>Regularly update your authentication app</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={16} color="#4CD964" />
              <Text style={styles.tipText}>Never share your verification codes with anyone</Text>
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
  content: {
    flex: 1,
  },
  statusSection: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  toggleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  toggleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
  verificationSection: {
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
  verificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: '#1C1C1E',
    backgroundColor: '#fff',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 16,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backupSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  backupText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  showCodesButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  showCodesButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  codesContainer: {
    marginBottom: 16,
  },
  codeItem: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  generateButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

export default TwoFactorAuthScreen; 