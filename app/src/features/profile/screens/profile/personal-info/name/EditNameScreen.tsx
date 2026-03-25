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
import { useAuth } from '../../../../../../shared/context/AuthContext';
import { useHealthData } from '../../../../../../shared/context/HealthDataContext';
import { ProfileTabParamList } from '../../../../../../shared/types';

type EditNameScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

interface NameData {
  firstName: string;
  surname: string;
  preferredName: string;
  username: string;
}

const EditNameScreen: React.FC = () => {
  const navigation = useNavigation<EditNameScreenNavigationProp>();
  const { user, updateUserName, updateUsername } = useAuth();
  const { updateProfile } = useHealthData();
  const [nameData, setNameData] = useState<NameData>({
    firstName: '',
    surname: '',
    preferredName: '',
    username: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const sanitize = (raw: string) =>
    raw
      .toLowerCase()
      .replace(/[^a-z0-9_\.]/g, '')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.|\.$/g, '');

  useEffect(() => {
    if (user) {
      const baseUsername = user.username || user.preferredName || user.firstName || '';
      setNameData({
        firstName: user.firstName || '',
        surname: user.surname || '',
        preferredName: user.preferredName || '',
        username: sanitize(baseUsername.replace(/\s+/g, '.')),
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!nameData.firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }

    if (!nameData.surname.trim()) {
      Alert.alert('Error', 'Please enter your surname');
      return;
    }

    if (nameData.firstName.trim().length < 2) {
      Alert.alert('Error', 'First name must be at least 2 characters long');
      return;
    }

    if (nameData.surname.trim().length < 2) {
      Alert.alert('Error', 'Surname must be at least 2 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Use preferred name if provided, otherwise use first name
      const finalPreferredName = nameData.preferredName.trim() || nameData.firstName.trim();
      
      // Update the user's full name using AuthContext
      await updateUserName(
        nameData.firstName.trim(),
        nameData.surname.trim(),
        finalPreferredName
      );
      // Also update profile display name so it reflects immediately in Profile screens
      const displayName = `${nameData.firstName.trim()} ${nameData.surname.trim()}`.trim();
      try {
        await updateProfile({ displayName } as any);
      } catch (e) { console.error(e); }
      // Optionally update username if provided and valid
      const cleaned = sanitize(nameData.username || '');
      if (cleaned && cleaned.length >= 3 && cleaned.length <= 20 && /^[a-z0-9](?:[a-z0-9_.]*[a-z0-9])?$/.test(cleaned)) {
        if (cleaned !== (user?.username || '')) {
          await updateUsername(cleaned);
        }
      }
      
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">Edit Name</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          hitSlop={{ top: 16, left: 16, right: 16, bottom: 16 }}
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
          <Text style={styles.label}>First Name: *</Text>
          <TextInput
            style={styles.input}
            value={nameData.firstName}
            onChangeText={(text) => setNameData({ ...nameData, firstName: text })}
            placeholder="Enter your first name"
            placeholderTextColor="#666"
            autoFocus={false}
            maxLength={30}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Surname: *</Text>
          <TextInput
            style={styles.input}
            value={nameData.surname}
            onChangeText={(text) => setNameData({ ...nameData, surname: text })}
            placeholder="Enter your surname"
            placeholderTextColor="#666"
            maxLength={30}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preferred Name: (Optional)</Text>
          <TextInput
            style={styles.input}
            value={nameData.preferredName}
            onChangeText={(text) => setNameData({ ...nameData, preferredName: text })}
            placeholder="What should we call you?"
            placeholderTextColor="#666"
            maxLength={30}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={nameData.username}
            onChangeText={(text) => setNameData({ ...nameData, username: sanitize(text) })}
            placeholder="your.username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
          <Text style={{ color: '#888', fontSize: 12, marginTop: 6 }}>3–20 chars; letters, numbers, underscore, dot</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 5,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    zIndex: 2,
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
    top: 23.5,
    zIndex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 14,
    paddingBottom: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 20,
    top: 23.5,
    zIndex: 10,
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
  },
  inputContainer: {
    marginBottom: 31,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#181818',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 50,
  },
});

export default EditNameScreen; 