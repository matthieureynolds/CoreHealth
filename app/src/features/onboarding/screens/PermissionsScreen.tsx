import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PermissionsScreen: React.FC<Props> = ({ onNext, onBack }) => {
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false,
    fileAccess: false,
  });

  const permissionItems = [
    {
      id: 'location',
      title: 'Location Access',
      description: 'For Travel Health features and location-based health insights',
      icon: 'location-outline',
      color: '#FF9500',
      reason: 'So TOTO can keep you safe wherever you are',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'For medication reminders, lab results, and health alerts',
      icon: 'notifications-outline',
      color: '#34C759',
      reason: 'Stay on top of your health with timely reminders',
    },
    {
      id: 'fileAccess',
      title: 'File Access',
      description: 'To upload and manage your medical documents and PDFs',
      icon: 'document-outline',
      color: '#3AABF0',
      reason: 'Easily store and access your medical records',
    },
  ];

  const handlePermissionToggle = (permissionId: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }));
  };

  const handleRequestPermission = (permissionId: string) => {
    Alert.alert(
      'Permission Required',
      `TOTO needs ${permissionId} permission to provide the best experience.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            // In a real app, you would request the actual permission here
            Alert.alert('Permission Granted', 'Permission has been granted successfully!');
            setPermissions(prev => ({
              ...prev,
              [permissionId]: true
            }));
          }
        }
      ]
    );
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
        <Text style={styles.title}>Permissions</Text>
        <Text style={styles.subtitle}>
          Grant permissions to unlock all TOTO features
        </Text>
      </View>

      <View style={styles.content}>
        {permissionItems.map((item) => (
          <View key={item.id} style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <View style={[styles.permissionIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>{item.title}</Text>
                <Text style={styles.permissionDescription}>{item.description}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  permissions[item.id as keyof typeof permissions] && styles.toggleButtonActive
                ]}
                onPress={() => handlePermissionToggle(item.id as keyof typeof permissions)}
              >
                <Ionicons 
                  name={permissions[item.id as keyof typeof permissions] ? 'checkmark' : 'add'} 
                  size={16} 
                  color={permissions[item.id as keyof typeof permissions] ? '#FFFFFF' : '#666'} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonText}>"{item.reason}"</Text>
            </View>

            {permissions[item.id as keyof typeof permissions] && (
              <TouchableOpacity
                style={styles.requestButton}
                onPress={() => handleRequestPermission(item.id)}
              >
                <Text style={styles.requestButtonText}>Grant Permission</Text>
                <Ionicons name="arrow-forward" size={16} color="#3AABF0" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={styles.privacyContainer}>
          <Ionicons name="shield-checkmark" size={24} color="#34C759" />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Your Privacy is Protected</Text>
            <Text style={styles.privacyDescription}>
              All your data is encrypted and stored securely. We never share your personal health information.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continue</Text>
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
  permissionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#3AABF0',
  },
  reasonContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 14,
    color: '#3AABF0',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3AABF0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  requestButtonText: {
    color: '#3AABF0',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  privacyContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  privacyText: {
    flex: 1,
    marginLeft: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3AABF0',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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

export default PermissionsScreen;
