import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, Platform, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../../../../../shared/context/SettingsContext';
import { useHealthData } from '../../../../../shared/context/HealthDataContext';
import biometricService from '../../../../../shared/services/biometricService';
import locationService from '../../../../../shared/services/locationService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const PrivacySecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updatePrivacySettings } = useSettings();
  const { profile, biomarkers, labResults, deviceData, dailyInsights, healthScore, travelHealth, bodySystems, jetLagPlanningEvents } = useHealthData();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [locationAccess, setLocationAccess] = useState(false);
  const [dataConsent, setDataConsent] = useState(settings.privacy.dataSharing.analytics);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Initialize biometric service
      await biometricService.initialize();
      setBiometricAvailable(biometricService.isBiometricAvailable());
      setBiometricEnabled(biometricService.isBiometricEnabled());
      
      // Initialize location service
      await locationService.initialize();
      setLocationPermission(locationService.getPermissionStatus());
      setLocationAccess(locationService.isLocationEnabled());
      
      // Load other settings
      await loadSettings();
    } catch (error) {
      console.error('Error initializing services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // Load data consent setting (you might want to move this to a separate service)
      // For now, we'll keep it simple
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      setIsLoading(true);
      
      if (value) {
        // Enable biometric authentication
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
        // Disable biometric authentication
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

  const handleLocationToggle = async (value: boolean) => {
    try {
      console.log('🔧 PrivacySecurityScreen: Location toggle pressed, value:', value);
      setIsLoading(true);
      
      if (value) {
        console.log('🔧 PrivacySecurityScreen: Attempting to enable location...');
        // Enable location access
        const success = await locationService.enableLocation();
        console.log('🔧 PrivacySecurityScreen: enableLocation result:', success);
        
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
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      } else {
        console.log('🔧 PrivacySecurityScreen: Disabling location...');
        // Disable location access
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
      console.error('❌ PrivacySecurityScreen: Location toggle error:', error);
      Alert.alert('Error', 'Failed to update location settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataConsentToggle = async (value: boolean) => {
    try {
      console.log('🔧 PrivacySecurityScreen: Data consent toggle pressed, value:', value);
      setIsLoading(true);
      
      // Update the setting in SettingsContext - dataSharing is an object with multiple properties
      await updatePrivacySettings({
        biometricAuth: settings.privacy.biometricAuth,
        locationServices: settings.privacy.locationServices,
        dataSharing: {
          analytics: value,
          anonymizedData: value,
          thirdPartyApps: false // Always keep this false for security
        }
      });
      
      setDataConsent(value);
      
      // Show appropriate alert based on the setting
      if (value) {
        Alert.alert(
          'Data Sharing Enabled',
          'You have consented to share anonymized health data for research and app improvement. Your personal information remains private and secure.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Data Sharing Disabled',
          'You have opted out of data sharing. Your health data will remain completely private and will not be used for research or app improvement.',
          [{ text: 'OK' }]
        );
      }
      
      console.log('✅ PrivacySecurityScreen: Data consent updated successfully');
    } catch (error) {
      console.error('❌ PrivacySecurityScreen: Data consent toggle error:', error);
      Alert.alert('Error', 'Failed to update data consent settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openMail = async (to: string, subject: string) => {
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) return Linking.openURL(url);
    Alert.alert('Email not configured', 'Please set up a mail app.');
  };

  const handleDataSharing = () => {
    Alert.alert(
      'Data Sharing Settings',
      'Choose how your data is shared for research and app improvement:',
      [
        {
          text: 'Allow All Sharing',
          onPress: () => {
            setDataConsent(true);
            Alert.alert('Settings Updated', 'Data sharing enabled for research and app improvement.');
          }
        },
        {
          text: 'Anonymized Only',
          onPress: () => {
            setDataConsent(true);
            Alert.alert('Settings Updated', 'Only anonymized data will be shared for research purposes.');
          }
        },
        {
          text: 'No Sharing',
          onPress: () => {
            setDataConsent(false);
            Alert.alert('Settings Updated', 'Data sharing disabled. Your data remains completely private.');
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Show initial alert
      Alert.alert(
        'Health Data Download',
        'Preparing your health data for download. This may take a few moments...',
        [{ text: 'OK' }]
      );
      
      // Generate health data export
      const exportData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          appVersion: '1.0.0',
          dataVersion: '1.0',
          user: {
            id: profile?.userId || 'anonymous',
            email: 'not-provided', // UserProfile doesn't have email
            name: 'Not Provided' // UserProfile doesn't have displayName
          }
        },
        profile: profile,
        healthData: {
          biomarkers: biomarkers,
          labResults: labResults,
          deviceData: deviceData,
          dailyInsights: dailyInsights,
          healthScore: healthScore,
          travelHealth: travelHealth,
          bodySystems: bodySystems,
          jetLagPlanningEvents: jetLagPlanningEvents
        },
        settings: settings,
        biometricSettings: {
          enabled: biometricEnabled,
          available: biometricAvailable
        },
        locationSettings: {
          enabled: locationAccess,
          permission: locationPermission
        },
        dataConsent: dataConsent
      };

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>CoreHealth Data Export</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 20px;
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #007AFF; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .section { 
              margin-bottom: 25px; 
              page-break-inside: avoid;
            }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              color: #007AFF; 
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .info-item { 
              margin-bottom: 8px; 
              padding: 5px 0;
            }
            .label { 
              font-weight: 600; 
              color: #555; 
              display: inline-block; 
              width: 150px;
            }
            .value { 
              color: #333; 
            }
            .json-data { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 5px; 
              font-family: 'Courier New', monospace; 
              font-size: 12px;
              white-space: pre-wrap;
              word-break: break-all;
              max-height: 400px;
              overflow-y: auto;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
              border-top: 1px solid #eee; 
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CoreHealth Data Export</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Export Information</div>
            <div class="info-item">
              <span class="label">Export Date:</span>
              <span class="value">${exportData.exportInfo.exportDate}</span>
            </div>
            <div class="info-item">
              <span class="label">App Version:</span>
              <span class="value">${exportData.exportInfo.appVersion}</span>
            </div>
            <div class="info-item">
              <span class="label">User ID:</span>
              <span class="value">${exportData.exportInfo.user.id}</span>
            </div>
            <div class="info-item">
              <span class="label">User Name:</span>
              <span class="value">${exportData.exportInfo.user.name}</span>
            </div>
            <div class="info-item">
              <span class="label">Email:</span>
              <span class="value">${exportData.exportInfo.user.email}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Profile Information</div>
            <div class="info-item">
              <span class="label">User ID:</span>
              <span class="value">${profile?.userId || 'Not Provided'}</span>
            </div>
            <div class="info-item">
              <span class="label">Age:</span>
              <span class="value">${profile?.age || 'Not Provided'}</span>
            </div>
            <div class="info-item">
              <span class="label">Gender:</span>
              <span class="value">${profile?.gender || 'Not Provided'}</span>
            </div>
            <div class="info-item">
              <span class="label">Height:</span>
              <span class="value">${profile?.height ? `${profile.height} cm` : 'Not Provided'}</span>
            </div>
            <div class="info-item">
              <span class="label">Weight:</span>
              <span class="value">${profile?.weight ? `${profile.weight} kg` : 'Not Provided'}</span>
            </div>
            <div class="info-item">
              <span class="label">Blood Type:</span>
              <span class="value">${profile?.bloodType || 'Not Provided'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Security Settings</div>
            <div class="info-item">
              <span class="label">Biometric Lock:</span>
              <span class="value">${biometricEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div class="info-item">
              <span class="label">Location Access:</span>
              <span class="value">${locationAccess ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div class="info-item">
              <span class="label">Data Sharing:</span>
              <span class="value">${dataConsent ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Complete Data Export (JSON)</div>
            <div class="json-data">${JSON.stringify(exportData, null, 2)}</div>
          </div>

          <div class="footer">
            <p>This document contains your personal health data from CoreHealth.</p>
            <p>Please keep this information secure and private.</p>
          </div>
        </body>
        </html>
      `;
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      // Set the PDF URI and show modal
      setPdfUri(uri);
      setShowPdfModal(true);
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed', 
        'There was an error generating your health data PDF. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSharePdf = async () => {
    if (!pdfUri) return;
    
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Health Data PDF',
          UTI: 'com.adobe.pdf'
        });
      } else {
        await Share.share({
          url: pdfUri,
          title: 'CoreHealth Health Data',
          message: 'Here is your health data export from CoreHealth.'
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', 'Unable to share the PDF. Please try again.');
    }
  };

  const toggleItems = [
    {
      title: 'Biometric Lock / Face ID',
      subtitle: biometricEnabled 
        ? 'Protecting your health data with biometric authentication'
        : 'Use fingerprint or face recognition to secure your health data',
      icon: 'finger-print-outline',
      value: biometricEnabled,
      onToggle: handleBiometricToggle,
      disabled: !biometricAvailable || isLoading,
      disabledReason: !biometricAvailable ? 'Biometric authentication not available on this device' : undefined,
    },
    {
      title: 'Location Access',
      subtitle: locationAccess 
        ? 'Enabled for travel health features and emergency services'
        : 'Allow location for travel features, emergency services, and health insights',
      icon: 'location-outline',
      value: locationAccess,
      onToggle: handleLocationToggle,
      disabled: isLoading,
    },
    {
      title: 'Data Consent',
      subtitle: dataConsent 
        ? 'Sharing anonymized data for research and app improvement'
        : 'Opted out of data sharing - your data remains private',
      icon: 'shield-checkmark-outline',
      value: dataConsent,
      onToggle: handleDataConsentToggle,
      disabled: isLoading,
    },
  ];

  const navigateToFamilyLink = () => {
    // @ts-ignore route exists in Profile stack
    navigation.navigate('FamilyLink');
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} pointerEvents="none">Privacy & Security</Text>
          <View style={{ width: 24 }} />
        </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 110 }}>
        {/* Content */}
        <View style={styles.content}>
          {/* Security Toggles */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>SECURITY</Text>
        {toggleItems.map((item, index) => (
          <View key={index} style={[styles.cardRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons 
                name={item.icon as any} 
                size={22} 
                color={item.disabled ? '#666' : '#007AFF'} 
                style={styles.cardIcon} 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardLabel, item.disabled && styles.disabledText]}>
                  {item.title}
                </Text>
                <Text style={[styles.cardSub, item.disabled && styles.disabledText]}>
                  {item.disabledReason || item.subtitle}
                </Text>
              </View>
            </View>
            <Switch 
              value={item.value} 
              onValueChange={item.onToggle} 
              trackColor={{ false: '#333', true: '#007AFF' }} 
              thumbColor="#FFFFFF"
              disabled={item.disabled}
            />
          </View>
        ))}
      </View>

      {/* Security Information */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>SECURITY INFORMATION</Text>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" style={styles.cardIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Biometric Protection</Text>
            <Text style={styles.infoText}>
              When enabled, Face ID or Touch ID will be required to access your health data, providing enterprise-grade security for your sensitive medical information.
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#007AFF" style={styles.cardIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Location Services</Text>
            <Text style={styles.infoText}>
              Location access enables travel health alerts, emergency services location, and location-specific health recommendations while maintaining your privacy.
            </Text>
          </View>
        </View>
      </View>

      {/* Privacy Actions */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>PRIVACY</Text>
        <TouchableOpacity 
          style={[styles.cardRow, isLoading && styles.disabledRow]} 
          onPress={navigateToFamilyLink}
          disabled={isLoading}
        >
          <Ionicons name="link-outline" size={22} color="#0A84FF" style={styles.cardIcon} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardLabel, isLoading && styles.disabledText]}>Family Link (Risk-Only)</Text>
            <Text style={styles.cardSub}>Leverage family history without sharing anyone’s data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.cardRow, isLoading && styles.disabledRow]} 
          onPress={handleDataSharing}
          disabled={isLoading}
        >
          <Ionicons name="people-outline" size={22} color="#34C759" style={styles.cardIcon} />
          <Text style={[styles.cardLabel, isLoading && styles.disabledText]}>Data Sharing Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.cardRow, isLoading && styles.disabledRow]} 
          onPress={handleDownload}
          disabled={isLoading}
        >
          <Ionicons name="download-outline" size={22} color="#5856D6" style={styles.cardIcon} />
          <Text style={[styles.cardLabel, isLoading && styles.disabledText]}>Health Data Download</Text>
          {isLoading ? (
            <Ionicons name="sync" size={20} color="#888" style={styles.chevron} />
          ) : (
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardRow} onPress={() => openMail('privacy@corehealth.com', 'Data Deletion Request')}>
          <Ionicons name="trash-outline" size={22} color="#FF3B30" style={styles.cardIcon} />
          <Text style={[styles.cardLabel, { color: '#FF3B30' }]}>Delete Account & Data</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      {/* Bottom spacing to match the gap between cards */}
      <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* PDF Modal */}
      {showPdfModal && pdfUri && (
        <View style={styles.modalOverlay}>
          <View style={styles.pdfModal}>
            <View style={styles.pdfModalHeader}>
              <Text style={styles.pdfModalTitle}>Health Data Export</Text>
              <TouchableOpacity 
                onPress={() => setShowPdfModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pdfContent}>
              <Ionicons name="document-text" size={64} color="#007AFF" />
              <Text style={styles.pdfMessage}>
                Your health data has been exported to a PDF document.
              </Text>
              <Text style={styles.pdfSubMessage}>
                You can now share, save, or print this document.
              </Text>
            </View>
            
            <View style={styles.pdfActions}>
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={handleSharePdf}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>Share PDF</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowPdfModal(false)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  card: {
    backgroundColor: '#181818',
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 16,
  },
  bottomSpacing: {
    height: 0,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pdfModal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pdfModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pdfModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  pdfContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pdfMessage: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  pdfSubMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  pdfActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeModalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  closeModalButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 16,
    marginHorizontal: 20,
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  cardSub: {
    fontSize: 13,
    color: '#8E8E93',
  },
  disabledText: {
    color: '#666',
  },
  disabledRow: {
    opacity: 0.6,
  },
  chevron: {
    marginLeft: 'auto',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
    textAlign: 'justify',
  },
});

export default PrivacySecurityScreen;