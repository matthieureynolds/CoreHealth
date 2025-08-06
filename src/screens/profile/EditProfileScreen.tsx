import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { ProfileTabParamList } from '../../types';

type EditProfileScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface FormData {
  displayName: string;
  birthDate: Date | null;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  ethnicity: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: user?.displayName || '',
    birthDate: null,
    gender: (profile?.gender === 'other' ? 'male' : profile?.gender) || 'male',
    height: profile?.height?.toString() || '',
    weight: profile?.weight?.toString() || '',
    ethnicity: profile?.ethnicity || '',
    bloodType: profile?.bloodType || 'unknown',
  });

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showEthnicityPicker, setShowEthnicityPicker] = useState(false);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [activePicker, setActivePicker] = useState<'gender' | 'ethnicity' | 'bloodType' | null>(null);

  // Picker options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const ethnicityOptions = [
    { value: 'east_asian', label: 'East Asian' },
    { value: 'south_asian', label: 'South Asian' },
    { value: 'southeast_asian', label: 'Southeast Asian' },
    { value: 'middle_eastern', label: 'Middle Eastern' },
    { value: 'north_african', label: 'North African' },
    { value: 'sub_saharan_african', label: 'Sub-Saharan African' },
    { value: 'european', label: 'European' },
    { value: 'latin_american', label: 'Latin American' },
    { value: 'caribbean', label: 'Caribbean' },
    { value: 'pacific_islander', label: 'Pacific Islander' },
    { value: 'indigenous_american', label: 'Indigenous American' },
    { value: 'mixed_heritage', label: 'Mixed Heritage' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  const bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'unknown', label: 'Unknown' },
  ];

  useEffect(() => {
    if (profile) {
      // Calculate birth date from age if available
      let birthDate = null;
      if (profile.age) {
        const today = new Date();
        birthDate = new Date(today.getFullYear() - profile.age, today.getMonth(), today.getDate());
      }

      setFormData({
        displayName: user?.displayName || '',
        birthDate,
        gender: (profile.gender === 'other' ? 'male' : profile.gender) || 'male',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        ethnicity: profile.ethnicity || '',
        bloodType: profile.bloodType || 'unknown',
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.birthDate) {
      Alert.alert('Error', 'Please select your birthday');
      return;
    }

    // Calculate age from birth date
    const today = new Date();
    const birthDate = new Date(formData.birthDate);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 1 || age > 150) {
      Alert.alert('Error', 'Please enter a valid birthday');
      return;
    }

    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (isNaN(height) || height < 50 || height > 250) {
      Alert.alert('Error', 'Please enter a valid height in cm (50-250)');
      return;
    }

    if (isNaN(weight) || weight < 20 || weight > 500) {
      Alert.alert('Error', 'Please enter a valid weight in kg (20-500)');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        ...profile,
        age,
        gender: formData.gender,
        height,
        weight,
        ethnicity: formData.ethnicity,
        bloodType: formData.bloodType,
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPickerOptions = () => {
    switch (activePicker) {
      case 'gender':
        return genderOptions;
      case 'ethnicity':
        return ethnicityOptions;
      case 'bloodType':
        return bloodTypeOptions;
      default:
        return [];
    }
  };

  const getCurrentPickerValue = () => {
    switch (activePicker) {
      case 'gender':
        return formData.gender;
      case 'ethnicity':
        return formData.ethnicity;
      case 'bloodType':
        return formData.bloodType;
      default:
        return '';
    }
  };

  const getCurrentPickerTitle = () => {
    switch (activePicker) {
      case 'gender':
        return 'Select Gender';
      case 'ethnicity':
        return 'Select Ethnicity';
      case 'bloodType':
        return 'Select Blood Type';
      default:
        return '';
    }
  };

  const handlePickerSelect = (value: string) => {
    switch (activePicker) {
      case 'gender':
        setFormData({ ...formData, gender: value as 'male' | 'female' });
        break;
      case 'ethnicity':
        setFormData({ ...formData, ethnicity: value });
        break;
      case 'bloodType':
        setFormData({ ...formData, bloodType: value as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown' });
        break;
    }
    setActivePicker(null);
  };

  const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const FormField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default',
    maxLength,
    multiline = false
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    maxLength?: number;
    multiline?: boolean;
  }) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
      />
    </View>
  );

  const PickerField = ({ 
    label, 
    value, 
    onPress,
    placeholder = 'Select option'
  }: {
    label: string;
    value: string;
    onPress: () => void;
    placeholder?: string;
  }) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
        <Text style={[styles.pickerText, !value && styles.pickerPlaceholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FormSection title="Personal Details">
          <FormField
            label="Full Name"
            value={formData.displayName}
            onChangeText={(text) => setFormData({ ...formData, displayName: text })}
            placeholder="Enter your full name"
            maxLength={50}
          />
          
          <PickerField
            label="Birthday"
            value={formData.birthDate ? formData.birthDate.toLocaleDateString() : ''}
            onPress={() => {
              setShowDatePicker(true);
            }}
            placeholder="Select your birthday"
          />

          <PickerField
            label="Gender"
            value={genderOptions.find(opt => opt.value === formData.gender)?.label || ''}
            onPress={() => setActivePicker('gender')}
            placeholder="Select gender"
          />

          <PickerField
            label="Ethnicity"
            value={ethnicityOptions.find(opt => opt.value === formData.ethnicity)?.label || ''}
            onPress={() => setActivePicker('ethnicity')}
            placeholder="Select ethnicity"
          />
        </FormSection>

        <FormSection title="Physical Stats">
          <FormField
            label="Height"
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            placeholder="Height in cm (e.g., 175)"
            keyboardType="numeric"
            maxLength={3}
          />
          
          <FormField
            label="Weight"
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            placeholder="Weight in kg (e.g., 70)"
            keyboardType="numeric"
            maxLength={3}
          />

          <PickerField
            label="Blood Type"
            value={bloodTypeOptions.find(opt => opt.value === formData.bloodType)?.label || ''}
            onPress={() => setActivePicker('bloodType')}
            placeholder="Select blood type"
          />
        </FormSection>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Birthday Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate || new Date()}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData({ ...formData, birthDate: selectedDate });
            }
          }}
        />
      )}

      {/* Picker Modal */}
      <Modal
        visible={activePicker !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActivePicker(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getCurrentPickerTitle()}</Text>
              <TouchableOpacity 
                onPress={() => setActivePicker(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerOptions}>
              {getCurrentPickerOptions().map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.pickerOption}
                  onPress={() => handlePickerSelect(option.value)}
                >
                  <Text style={styles.pickerOptionText}>{option.label}</Text>
                  {getCurrentPickerValue() === option.value && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pickerText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  pickerPlaceholder: {
    color: '#8E8E93',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  pickerOptions: {
    maxHeight: 400,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
});

export default EditProfileScreen; 