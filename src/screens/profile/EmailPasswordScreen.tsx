import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type EmailPasswordScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const EmailPasswordScreen: React.FC = () => {
  const navigation = useNavigation<EmailPasswordScreenNavigationProp>();
  const { user, updateEmail, updatePassword } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmail = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await updateEmail(newEmail, currentPassword);
      Alert.alert('Success', 'Email updated successfully');
      setNewEmail('');
      setCurrentPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update email. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordInput = ({ 
    value, 
    onChangeText, 
    placeholder, 
    showPassword, 
    onToggleShow 
  }: any) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.eyeButton} onPress={onToggleShow}>
        <Ionicons 
          name={showPassword ? "eye-off" : "eye"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email & Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Email Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Email</Text>
            <View style={styles.infoCard}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={styles.currentEmail}>{user?.email || 'No email set'}</Text>
            </View>
          </View>

          {/* Update Email Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Email</Text>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Current Password *</Text>
              <PasswordInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                showPassword={showCurrentPassword}
                onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
              />

              <Text style={styles.fieldLabel}>New Email Address *</Text>
              <TextInput
                style={styles.textInput}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.updateButton, isLoading && styles.disabledButton]}
                onPress={handleUpdateEmail}
                disabled={isLoading}
              >
                <Text style={styles.updateButtonText}>
                  {isLoading ? 'Updating...' : 'Update Email'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Update Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Password</Text>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Current Password *</Text>
              <PasswordInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                showPassword={showCurrentPassword}
                onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
              />

              <Text style={styles.fieldLabel}>New Password *</Text>
              <PasswordInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password (min 8 characters)"
                showPassword={showNewPassword}
                onToggleShow={() => setShowNewPassword(!showNewPassword)}
              />

              <Text style={styles.fieldLabel}>Confirm New Password *</Text>
              <PasswordInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                showPassword={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              <TouchableOpacity
                style={[styles.updateButton, isLoading && styles.disabledButton]}
                onPress={handleUpdatePassword}
                disabled={isLoading}
              >
                <Text style={styles.updateButtonText}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Tips</Text>
            <View style={styles.tipsCard}>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={16} color="#4CD964" />
                <Text style={styles.tipText}>Use a strong, unique password</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="key" size={16} color="#4CD964" />
                <Text style={styles.tipText}>Enable two-factor authentication</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="refresh" size={16} color="#4CD964" />
                <Text style={styles.tipText}>Update your password regularly</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="mail" size={16} color="#4CD964" />
                <Text style={styles.tipText}>Keep your email address up to date</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentEmail: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    position: 'relative',
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
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
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

export default EmailPasswordScreen; 