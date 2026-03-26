import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../../../../shared/context/AuthContext';
import { useHealthData } from '../../../../../shared/context/HealthDataContext';
import FormSection from './components/FormSection';
import FormField from './components/FormField';
import PickerField from './components/PickerField';
import PickerModal from './components/PickerModal';
import BloodTypePickerModal from './components/BloodTypePickerModal';
import { genderOptions, ethnicityOptions, bloodTypeOptions } from './components/pickerData';

interface FormData {
  displayName: string;
  birthDate: Date | null;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  ethnicity: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
}

type ActivePicker = 'gender' | 'ethnicity' | 'bloodType' | null;

const pickerConfig: Record<'gender' | 'ethnicity', { title: string; options: { value: string; label: string }[] }> = {
  gender: { title: 'Select Gender', options: genderOptions },
  ethnicity: { title: 'Select Ethnicity', options: ethnicityOptions },
};

const EditProfileScreen: React.FC = () => {
  const { user, updateUserDisplayName, updateUserName } = useAuth();
  const { profile, updateProfile } = useHealthData();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const [formData, setFormData] = useState<FormData>({
    displayName: user?.displayName || '',
    birthDate: null,
    gender: (profile?.gender === 'other' ? 'male' : profile?.gender) || 'male',
    height: profile?.height?.toString() || '',
    weight: profile?.weight?.toString() || '',
    ethnicity: profile?.ethnicity || '',
    bloodType: profile?.bloodType || 'unknown',
  });

  useEffect(() => {
    if (profile) {
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
    if (!formData.displayName.trim()) { Alert.alert('Error', 'Please enter your name'); return; }
    if (!formData.birthDate) { Alert.alert('Error', 'Please select your birthday'); return; }

    const today = new Date();
    const birthDate = new Date(formData.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 1 || age > 150) { Alert.alert('Error', 'Please enter a valid birthday'); return; }

    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (isNaN(height) || height < 50 || height > 250) { Alert.alert('Error', 'Please enter a valid height in cm (50-250)'); return; }
    if (isNaN(weight) || weight < 20 || weight > 500) { Alert.alert('Error', 'Please enter a valid weight in kg (20-500)'); return; }

    setIsLoading(true);
    try {
      const displayName = (formData.displayName || '').trim();
      if (displayName) {
        try { await updateUserDisplayName(displayName); } catch (e) { console.error(e); }
        const parts = displayName.split(' ').filter(Boolean);
        const first = parts[0] || displayName;
        const surname = parts.slice(1).join(' ');
        try { await updateUserName(first, surname, first); } catch (e) { console.error(e); }
      }
      await updateProfile({ ...profile, age, gender: formData.gender, height, weight, ethnicity: formData.ethnicity, bloodType: formData.bloodType });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickerSelect = (value: string) => {
    if (activePicker === 'gender') setFormData({ ...formData, gender: value as 'male' | 'female' });
    else if (activePicker === 'ethnicity') setFormData({ ...formData, ethnicity: value });
    else if (activePicker === 'bloodType') setFormData({ ...formData, bloodType: value as FormData['bloodType'] });
    setActivePicker(null);
  };

  const activePickerConfig = activePicker && activePicker !== 'bloodType' ? pickerConfig[activePicker] : null;
  const getPickerValue = () => {
    if (activePicker === 'gender') return formData.gender;
    if (activePicker === 'ethnicity') return formData.ethnicity;
    return '';
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FormSection title="Personal Details">
          <FormField label="Full Name" value={formData.displayName} onChangeText={(text) => setFormData({ ...formData, displayName: text })} placeholder="Enter your full name" maxLength={50} />
          <PickerField label="Birthday" value={formData.birthDate ? formData.birthDate.toLocaleDateString() : ''} onPress={() => setShowDatePicker(true)} placeholder="Select your birthday" />
          <PickerField label="Gender" value={genderOptions.find(opt => opt.value === formData.gender)?.label || ''} onPress={() => setActivePicker('gender')} placeholder="Select gender" />
          <PickerField label="Ethnicity" value={ethnicityOptions.find(opt => opt.value === formData.ethnicity)?.label || ''} onPress={() => setActivePicker('ethnicity')} placeholder="Select ethnicity" />
        </FormSection>

        <FormSection title="Physical Stats">
          <FormField label="Height" value={formData.height} onChangeText={(text) => setFormData({ ...formData, height: text })} placeholder="Height in cm (e.g., 175)" keyboardType="numeric" maxLength={3} />
          <FormField label="Weight" value={formData.weight} onChangeText={(text) => setFormData({ ...formData, weight: text })} placeholder="Weight in kg (e.g., 70)" keyboardType="numeric" maxLength={3} />
          <PickerField label="Blood Type" value={bloodTypeOptions.find(opt => opt.value === formData.bloodType)?.label || ''} onPress={() => setActivePicker('bloodType')} placeholder="Select blood type" />
        </FormSection>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} onPress={handleSave} disabled={isLoading}>
          <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate || new Date()}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setFormData({ ...formData, birthDate: selectedDate });
          }}
        />
      )}

      {activePickerConfig && (
        <PickerModal
          visible={activePicker !== null && activePicker !== 'bloodType'}
          title={activePickerConfig.title}
          options={activePickerConfig.options}
          selectedValue={getPickerValue()}
          onSelect={handlePickerSelect}
          onClose={() => setActivePicker(null)}
        />
      )}

      <BloodTypePickerModal
        visible={activePicker === 'bloodType'}
        selectedValue={formData.bloodType}
        onSelect={handlePickerSelect}
        onClose={() => setActivePicker(null)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1 },
  footer: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E5E5EA' },
  saveButton: { backgroundColor: '#3AABF0', borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  saveButtonDisabled: { backgroundColor: '#8E8E93' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});

export default EditProfileScreen;
