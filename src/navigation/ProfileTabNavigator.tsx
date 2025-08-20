import React, { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { ProfileTabParamList } from '../types';

import ProfileDetailsScreen from '../screens/profile/ProfileDetailsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import EditNameScreen from '../screens/profile/EditNameScreen';
import EditPhysicalStatsScreen from '../screens/profile/EditPhysicalStatsScreen';
import HealthIDsScreen from '../screens/profile/HealthIDsScreen';
import ConditionsScreen from '../screens/profile/ConditionsScreen';
import MedicationsScreen from '../screens/profile/MedicationsScreen';
import AllergiesScreen from '../screens/profile/AllergiesScreen';
import FamilyHistoryScreen from '../screens/profile/FamilyHistoryScreen';
import VaccinationsScreen from '../screens/profile/VaccinationsScreen';
import ScreeningsScreen from '../screens/profile/ScreeningsScreen';
import UploadMedicalRecordScreen from '../screens/profile/UploadMedicalRecordScreen';
import ViewMedicalRecordsScreen from '../screens/profile/ViewMedicalRecordsScreen';
import GenerateHealthReportScreen from '../screens/profile/GenerateHealthReportScreen';
import ShareWithDoctorScreen from '../screens/profile/ShareWithDoctorScreen';
import MedicalHistoryScreen from '../screens/profile/MedicalHistoryScreen';
import EmergencyContactsScreen from '../screens/profile/EmergencyContactsScreen';
import PrimaryDoctorScreen from '../screens/profile/PrimaryDoctorScreen';
import BiomarkerVisibilityScreen from '../screens/profile/BiomarkerVisibilityScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import TermsOfServiceScreen from '../screens/profile/TermsOfServiceScreen';
import AboutScreen from '../screens/profile/AboutScreen';
// New Settings Screens
import AccountSettingsScreen from '../screens/profile/AccountSettingsScreen';
import EmailPasswordScreen from '../screens/profile/EmailPasswordScreen';
import ConnectedAccountsScreen from '../screens/profile/ConnectedAccountsScreen';
import TwoFactorAuthScreen from '../screens/profile/TwoFactorAuthScreen';
import ConnectedDevicesScreen from '../screens/profile/ConnectedDevicesScreen';
import DisplayFormatScreen from '../screens/profile/DisplayFormatScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';

import DataSyncScreen from '../screens/profile/DataSyncScreen';
import PrivacySecurityScreen from '../screens/profile/PrivacySecurityScreen';
import LegalComplianceScreen from '../screens/profile/LegalComplianceScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
// Duplicate import removed
import ConsentFormsScreen from '../screens/profile/ConsentFormsScreen';
import ComplianceNoticesScreen from '../screens/profile/ComplianceNoticesScreen';
import DataProcessingAgreementScreen from '../screens/profile/DataProcessingAgreementScreen';
import DataRetentionPolicyScreen from '../screens/profile/DataRetentionPolicyScreen';
import SupportHelpScreen from '../screens/profile/SupportHelpScreen';
import FAQScreen from '../screens/profile/FAQScreen';
import AppInfoScreen from '../screens/profile/AppInfoScreen';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator<ProfileTabParamList>();

// Tab Navigator for Profile and Settings
const ProfileTabsNavigator: React.FC = () => {
  const { user } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  
  // Predefined avatars
  const predefinedAvatars = [
    '👨', '👩', '👦', '👧', '👴', '👵', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓',
    '🦁', '🐯', '🐨', '🐼', '🐸', '🐙', '🦄', '🐲', '🦋', '🐳'
  ];

  const handleAvatarPress = () => {
    setShowAvatarModal(true);
  };

  const handleTakePhoto = async () => {
    setShowAvatarModal(false);
    
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
        return;
      }

      console.log('Launching camera...');
      
      // Try camera first, if it fails, suggest using gallery
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Camera result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Photo taken successfully:', result.assets[0].uri);
        // Save the selected photo
        setSelectedAvatar(result.assets[0].uri);
        Alert.alert('Success', 'Photo taken and set as profile picture!');
      } else {
        console.log('Camera was canceled or no photo taken');
        // If camera doesn't work, suggest using gallery
        Alert.alert(
          'Camera Issue', 
          'Camera might not be available in Expo Go. Try using "Choose from Library" instead.',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Try Gallery', 
              onPress: () => handleChoosePhoto() 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Camera Error', 
        'Camera is not available. Please use "Choose from Library" to select a photo.',
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Use Gallery', 
            onPress: () => handleChoosePhoto() 
          }
        ]
      );
    }
  };

  const handleChoosePhoto = async () => {
    setShowAvatarModal(false);
    
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Gallery permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select a photo.');
        return;
      }

      console.log('Launching gallery...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Gallery result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Photo selected successfully:', result.assets[0].uri);
        // Save the selected photo
        setSelectedAvatar(result.assets[0].uri);
        Alert.alert('Success', 'Photo selected and set as profile picture!');
      } else {
        console.log('Gallery was canceled or no photo selected');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', `Failed to select photo: ${error}`);
    }
  };

  const handleChooseAvatar = () => {
    setShowAvatarModal(false);
    setShowAvatarSelection(true);
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setShowAvatarSelection(false);
    Alert.alert('Success', 'Avatar selected and set as profile picture!');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }} edges={['top']}>
      {/* User Profile Section */}
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
          {selectedAvatar ? (
            // Show selected photo or emoji avatar
            selectedAvatar.startsWith('http') || selectedAvatar.startsWith('file') ? (
              <Image source={{ uri: selectedAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>{selectedAvatar}</Text>
              </View>
            )
          ) : user && typeof (user as any).avatar === 'string' && (user as any).avatar.length > 0 ? (
            <Image source={{ uri: (user as any).avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{user?.displayName?.charAt(0) || 'U'}</Text>
            </View>
          )}
          <View style={styles.avatarEditOverlay}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>
          {user?.firstName && user?.surname 
            ? `${user.firstName} ${user.surname}` 
            : user?.displayName || 'User'}
        </Text>
        <Text style={styles.profileUsername}>
          {user?.preferredName || user?.firstName || 'matthieu.reynolds_04'}
        </Text>
      </View>

      {/* Avatar Change Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Profile Photo</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleChoosePhoto}>
              <Ionicons name="images-outline" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>Choose from Library</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleChooseAvatar}>
              <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>Choose Avatar</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalNote}>
              Note: Camera may not work in Expo Go. Use "Choose from Library" for best results.
            </Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={() => setShowAvatarModal(false)}>
              <Ionicons name="close-outline" size={24} color="#FF3B30" />
              <Text style={[styles.modalOptionText, { color: '#FF3B30' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity onPress={() => setShowAvatarSelection(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.avatarGrid}>
              {predefinedAvatars.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.avatarOption}
                  onPress={() => handleAvatarSelect(avatar)}
                >
                  <Text style={styles.avatarOptionEmoji}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => setShowAvatarSelection(false)}
            >
              <Ionicons name="close-outline" size={24} color="#FF3B30" />
              <Text style={[styles.modalOptionText, { color: '#FF3B30' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#888',
          tabBarIndicatorStyle: {
            backgroundColor: '#007AFF',
          },
          tabBarStyle: {
            backgroundColor: '#111',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            textTransform: 'none',
          },
        }}
      >
        <Tab.Screen
          name="ProfileDetails"
          component={ProfileDetailsScreen}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="person" size={20} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }: { color: string }) => (
              <Ionicons name="settings" size={20} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

// Stack Navigator for Profile section with detail screens
const ProfileTabNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#111',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#fff',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="ProfileTabs"
        component={ProfileTabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="EditName"
        component={EditNameScreen}
        options={{
          title: 'Edit Name',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditPhysicalStats"
        component={EditPhysicalStatsScreen}
        options={{
          title: 'Edit Physical Stats',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HealthIDs"
        component={HealthIDsScreen}
        options={{
          title: 'Health IDs',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Conditions"
        component={ConditionsScreen}
        options={{
          title: 'Medical Conditions',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{
          title: 'Medications',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Allergies"
        component={AllergiesScreen}
        options={{
          title: 'Allergies',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FamilyHistory"
        component={FamilyHistoryScreen}
        options={{
          title: 'Family History',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Vaccinations"
        component={VaccinationsScreen}
        options={{
          title: 'Vaccinations',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Screenings"
        component={ScreeningsScreen}
        options={{
          title: 'Screenings',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UploadMedicalRecord"
        component={UploadMedicalRecordScreen}
        options={{
          title: 'Upload Medical Record',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ViewMedicalRecords"
        component={ViewMedicalRecordsScreen}
        options={{
          title: 'View Medical Records',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GenerateHealthReport"
        component={GenerateHealthReportScreen}
        options={{
          title: 'Generate Health Report',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ShareWithDoctor"
        component={ShareWithDoctorScreen}
        options={{
          title: 'Share with Doctor',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MedicalHistory"
        component={MedicalHistoryScreen}
        options={{
          title: 'Medical History',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          title: 'Emergency Contacts',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrimaryDoctor"
        component={PrimaryDoctorScreen}
        options={{
          title: 'Primary Doctor',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BiomarkerVisibility"
        component={BiomarkerVisibilityScreen}
        options={{
          title: 'Biomarker Visibility',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          title: 'Help & Support',
        }}
      />
      {/* Legacy screens removed; using new legal document screens below */}
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About CoreHealth',
        }}
      />
      {/* New Settings Screens */}
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{
          title: 'Account Settings',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EmailPassword"
        component={EmailPasswordScreen}
        options={{
          title: 'Email & Password',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ConnectedAccounts"
        component={ConnectedAccountsScreen}
        options={{
          title: 'Connected Accounts',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TwoFactorAuth"
        component={TwoFactorAuthScreen}
        options={{
          title: 'Two-Factor Authentication',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ConnectedDevices"
        component={ConnectedDevicesScreen}
        options={{
          title: 'Connected Devices',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DisplayFormat"
        component={DisplayFormatScreen}
        options={{
          title: 'Display & Format',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="DataSync"
        component={DataSyncScreen}
        options={{
          title: 'Data & Sync',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{
          title: 'Privacy & Security',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LegalCompliance"
        component={LegalComplianceScreen}
        options={{
          title: 'Legal & Compliance',
          headerShown: false,
        }}
      />
      <Stack.Screen name="TermsOfService" component={TermsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ConsentForms" component={ConsentFormsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ComplianceNotices" component={ComplianceNoticesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DataProcessingAgreement" component={DataProcessingAgreementScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DataRetentionPolicy" component={DataRetentionPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="SupportHelp"
        component={SupportHelpScreen}
        options={{
          title: 'Support & Help',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{
          title: 'FAQs',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AppInfo"
        component={AppInfoScreen}
        options={{
          title: 'App Info',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileTabNavigator;

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#111',
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarEmoji: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  profileUsername: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editProfileText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  modalNote: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  avatarOptionEmoji: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 