import React, { useState, useCallback, useRef } from 'react';
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
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../shared/types';
import { useAuth } from '../../../shared/context/AuthContext';

type EmailFormProps = {
  emailCurrentPassword: string;
  setEmailCurrentPassword: (text: string) => void;
  newEmail: string;
  setNewEmail: (text: string) => void;
  showEmailCurrentPassword: boolean;
  toggleEmailPasswordVisibility: () => void;
  isLoading: boolean;
  handleUpdateEmail: () => void;
  setIsEditingEmail: (value: boolean) => void;
};

const EmailForm: React.FC<EmailFormProps> = React.memo(({
  emailCurrentPassword,
  setEmailCurrentPassword,
  newEmail,
  setNewEmail,
  showEmailCurrentPassword,
  toggleEmailPasswordVisibility,
  isLoading,
  handleUpdateEmail,
  setIsEditingEmail,
}) => (
  <View style={styles.editForm}>
    <Text style={[styles.fieldLabel, styles.firstFieldLabel]}>Current Password *</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={emailCurrentPassword}
        onChangeText={setEmailCurrentPassword}
        placeholder="Enter current password"
        placeholderTextColor="#999"
        secureTextEntry={!showEmailCurrentPassword}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        blurOnSubmit={false}
      />
      <TouchableOpacity 
        style={styles.eyeButton} 
        onPress={toggleEmailPasswordVisibility}
      >
        <Ionicons 
          name={showEmailCurrentPassword ? "eye-off" : "eye"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
    </View>

    <Text style={styles.fieldLabel}>New Email Address *</Text>
    <TextInput
      style={styles.textInput}
      value={newEmail}
      onChangeText={setNewEmail}
      placeholder="Enter new email address"
      placeholderTextColor="#999"
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      blurOnSubmit={false}
    />

    <View style={styles.buttonRow}>
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
));

type PasswordFormProps = {
  passwordCurrentPassword: string;
  setPasswordCurrentPassword: (text: string) => void;
  newPassword: string;
  setNewPassword: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  showPasswordCurrentPassword: boolean;
  togglePasswordCurrentVisibility: () => void;
  showNewPassword: boolean;
  toggleNewPasswordVisibility: () => void;
  showConfirmPassword: boolean;
  toggleConfirmPasswordVisibility: () => void;
  isLoading: boolean;
  handleUpdatePassword: () => void;
  setIsEditingPassword: (value: boolean) => void;
};

const PasswordForm: React.FC<PasswordFormProps> = React.memo(({
  passwordCurrentPassword,
  setPasswordCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPasswordCurrentPassword,
  togglePasswordCurrentVisibility,
  showNewPassword,
  toggleNewPasswordVisibility,
  showConfirmPassword,
  toggleConfirmPasswordVisibility,
  isLoading,
  handleUpdatePassword,
  setIsEditingPassword,
}) => (
  <View style={styles.editForm}>
    <Text style={[styles.fieldLabel, styles.firstFieldLabel]}>Current Password *</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={passwordCurrentPassword}
        onChangeText={setPasswordCurrentPassword}
        placeholder="Enter current password"
        placeholderTextColor="#999"
        secureTextEntry={!showPasswordCurrentPassword}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        blurOnSubmit={false}
      />
      <TouchableOpacity 
        style={styles.eyeButton} 
        onPress={togglePasswordCurrentVisibility}
      >
        <Ionicons 
          name={showPasswordCurrentPassword ? "eye-off" : "eye"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
    </View>

    <Text style={styles.fieldLabel}>New Password *</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        placeholderTextColor="#999"
        secureTextEntry={!showNewPassword}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        blurOnSubmit={false}
      />
      <TouchableOpacity 
        style={styles.eyeButton} 
        onPress={toggleNewPasswordVisibility}
      >
        <Ionicons 
          name={showNewPassword ? "eye-off" : "eye"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
    </View>

    <Text style={styles.fieldLabel}>Confirm New Password *</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        placeholderTextColor="#999"
        secureTextEntry={!showConfirmPassword}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        blurOnSubmit={false}
      />
      <TouchableOpacity 
        style={styles.eyeButton} 
        onPress={toggleConfirmPasswordVisibility}
      >
        <Ionicons 
          name={showConfirmPassword ? "eye-off" : "eye"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>
    </View>

    <View style={styles.buttonRow}>
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
));

type EmailPasswordScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const EmailPasswordScreen: React.FC = () => {
  const navigation = useNavigation<EmailPasswordScreenNavigationProp>();
  const { user, updateEmail, updatePassword } = useAuth();
  
  // Email editing state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showEmailCurrentPassword, setShowEmailCurrentPassword] = useState(false);
  
  // Password editing state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordCurrentPassword, setShowPasswordCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  // Memoized toggle functions to prevent unnecessary re-renders
  const toggleEmailPasswordVisibility = useCallback(() => {
    setShowEmailCurrentPassword(prev => !prev);
  }, []);

  const togglePasswordCurrentVisibility = useCallback(() => {
    setShowPasswordCurrentPassword(prev => !prev);
  }, []);

  const toggleNewPasswordVisibility = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const toggleEmailEditing = useCallback(() => {
    setIsEditingEmail(prev => !prev);
  }, []);

  const togglePasswordEditing = useCallback(() => {
    setIsEditingPassword(prev => !prev);
  }, []);

  const handleUpdateEmail = async () => {
    if (!user?.email) {
      Alert.alert('Sign in required', 'Please sign in again to change your email.');
      return;
    }
    if (!emailCurrentPassword.trim()) {
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
      await updateEmail(newEmail, emailCurrentPassword);
      Alert.alert('Success', 'Email updated successfully');
      setNewEmail('');
      setEmailCurrentPassword('');
      setIsEditingEmail(false);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update email. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user?.email) {
      Alert.alert('Sign in required', 'Please sign in again to change your password.');
      return;
    }
    if (!passwordCurrentPassword.trim()) {
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

    // Strong password: at least one lowercase, one uppercase, one number, and one symbol
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}\[\]|:;"'<>.,?\/`~]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      Alert.alert(
        'Weak password',
        'Use at least 8 characters including 1 uppercase, 1 lowercase, 1 number, and 1 symbol.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword === passwordCurrentPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(passwordCurrentPassword, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setPasswordCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update password. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Email & Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'android' ? 'height' : undefined}
        keyboardVerticalOffset={0}
        enabled={Platform.OS === 'android'}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          {/* Email Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email Address</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.infoSection}>
                  <Ionicons name="mail-outline" size={20} color="#007AFF" />
                  <Text style={styles.currentValue}>{user?.email || 'No email set'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={toggleEmailEditing}
                >
                  {isEditingEmail ? (
                    <Ionicons name="close" size={18} color="#FF3B30" />
                  ) : (
                    <Feather name="edit-2" size={18} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </View>
              
              {isEditingEmail && (
                <EmailForm
                  emailCurrentPassword={emailCurrentPassword}
                  setEmailCurrentPassword={setEmailCurrentPassword}
                  newEmail={newEmail}
                  setNewEmail={setNewEmail}
                  showEmailCurrentPassword={showEmailCurrentPassword}
                  toggleEmailPasswordVisibility={toggleEmailPasswordVisibility}
                  isLoading={isLoading}
                  handleUpdateEmail={handleUpdateEmail}
                  setIsEditingEmail={setIsEditingEmail}
                />
              )}
            </View>
          </View>

          {/* Password Section */}
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>Password</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.infoSection}>
                  <Ionicons name="lock-closed-outline" size={20} color="#007AFF" />
                  <Text style={styles.currentValue}>••••••••</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={togglePasswordEditing}
                >
                  {isEditingPassword ? (
                    <Ionicons name="close" size={18} color="#FF3B30" />
                  ) : (
                    <Feather name="edit-2" size={18} color="#007AFF" />
                  )}
                </TouchableOpacity>
              </View>
              
              {isEditingPassword && (
                <PasswordForm
                  passwordCurrentPassword={passwordCurrentPassword}
                  setPasswordCurrentPassword={setPasswordCurrentPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  showPasswordCurrentPassword={showPasswordCurrentPassword}
                  togglePasswordCurrentVisibility={togglePasswordCurrentVisibility}
                  showNewPassword={showNewPassword}
                  toggleNewPasswordVisibility={toggleNewPasswordVisibility}
                  showConfirmPassword={showConfirmPassword}
                  toggleConfirmPasswordVisibility={toggleConfirmPasswordVisibility}
                  isLoading={isLoading}
                  handleUpdatePassword={handleUpdatePassword}
                  setIsEditingPassword={setIsEditingPassword}
                />
              )}
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
    paddingTop: 18.7,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  currentValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  editButton: {
    padding: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  editForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
  },
  firstFieldLabel: {
    marginTop: 0,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#000000',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 0,
    marginTop: 20,
    justifyContent: 'center',
  },
  updateButton: {
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#1C1C1E',
    borderColor: '#4A4A4A',
  },
  updateButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmailPasswordScreen; 