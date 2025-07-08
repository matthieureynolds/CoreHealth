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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { ProfileTabParamList } from '../../types';

type EditProfileScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface FormData {
  displayName: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  height: string;
  weight: string;
  ethnicity: string;
  bloodType: string;
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: user?.displayName || '',
    age: profile?.age?.toString() || '',
    gender: profile?.gender || 'male',
    height: profile?.height?.toString() || '',
    weight: profile?.weight?.toString() || '',
    ethnicity: profile?.ethnicity || '',
    bloodType: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: user?.displayName || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || 'male',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        ethnicity: profile.ethnicity || '',
        bloodType: '',
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);

    if (isNaN(age) || age < 1 || age > 150) {
      Alert.alert('Error', 'Please enter a valid age (1-150)');
      return;
    }

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

  const GenderSelector = () => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>Gender</Text>
      <View style={styles.genderContainer}>
        {[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.genderOption,
              formData.gender === option.value && styles.genderOptionSelected,
            ]}
            onPress={() => setFormData({ ...formData, gender: option.value as any })}
          >
            <Text
              style={[
                styles.genderOptionText,
                formData.gender === option.value && styles.genderOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FormSection title="Personal Information">
          <FormField
            label="Full Name"
            value={formData.displayName}
            onChangeText={(text) => setFormData({ ...formData, displayName: text })}
            placeholder="Enter your full name"
            maxLength={50}
          />
          
          <FormField
            label="Age"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            placeholder="Enter your age"
            keyboardType="numeric"
            maxLength={3}
          />
          
          <GenderSelector />
          
          <FormField
            label="Ethnicity (Optional)"
            value={formData.ethnicity}
            onChangeText={(text) => setFormData({ ...formData, ethnicity: text })}
            placeholder="e.g., Asian, Hispanic, African American"
            maxLength={50}
          />
        </FormSection>

        <FormSection title="Physical Stats">
          <FormField
            label="Height (cm)"
            value={formData.height}
            onChangeText={(text) => setFormData({ ...formData, height: text })}
            placeholder="Enter height in centimeters"
            keyboardType="numeric"
            maxLength={3}
          />
          
          <FormField
            label="Weight (kg)"
            value={formData.weight}
            onChangeText={(text) => setFormData({ ...formData, weight: text })}
            placeholder="Enter weight in kilograms"
            keyboardType="numeric"
            maxLength={5}
          />
        </FormSection>

        <FormSection title="Health Information">
          <FormField
            label="Blood Type (Optional)"
            value={formData.bloodType}
            onChangeText={(text) => setFormData({ ...formData, bloodType: text })}
            placeholder="e.g., A+, B-, O+, AB-"
            maxLength={4}
          />
        </FormSection>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  genderOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 