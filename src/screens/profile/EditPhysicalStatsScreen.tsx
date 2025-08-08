import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useHealthData } from '../../context/HealthDataContext';
import { ProfileTabParamList } from '../../types';

type EditPhysicalStatsScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface PhysicalStatsData {
  height: string;
  weight: string;
}

const EditPhysicalStatsScreen: React.FC = () => {
  const navigation = useNavigation<EditPhysicalStatsScreenNavigationProp>();
  const { profile, updateProfile } = useHealthData();
  const [statsData, setStatsData] = useState<PhysicalStatsData>({
    height: '',
    weight: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setStatsData({
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const height = parseFloat(statsData.height);
    const weight = parseFloat(statsData.weight);

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
        height: Math.round(height * 10) / 10, // Round to 1 decimal place
        weight: Math.round(weight * 10) / 10, // Round to 1 decimal place
      });

      Alert.alert('Success', 'Physical stats updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating physical stats:', error);
      Alert.alert('Error', 'Failed to update physical stats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Physical Stats</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm) *</Text>
          <TextInput
            style={styles.input}
            value={statsData.height}
            onChangeText={(text) => setStatsData({ ...statsData, height: text })}
            placeholder="Enter your height (e.g., 175.5)"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.characterCount}>{statsData.height.length}/6</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg) *</Text>
          <TextInput
            style={styles.input}
            value={statsData.weight}
            onChangeText={(text) => setStatsData({ ...statsData, weight: text })}
            placeholder="Enter your weight (e.g., 75.5)"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.characterCount}>{statsData.weight.length}/6</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 56,
  },
  characterCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    marginTop: 20,
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 22,
    marginLeft: 16,
    flex: 1,
  },
});

export default EditPhysicalStatsScreen; 