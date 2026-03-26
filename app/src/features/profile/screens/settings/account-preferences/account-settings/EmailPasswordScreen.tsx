import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileTabParamList } from '../../../../../../shared/types';
import { useAuth } from '../../../../../../shared/context/AuthContext';
import EmailForm from './components/EmailForm';
import PasswordForm from './components/PasswordForm';
import styles from './components/emailPasswordStyles';

type EmailPasswordScreenNavigationProp = StackNavigationProp<ProfileTabParamList>;

const EmailPasswordScreen: React.FC = () => {
  const navigation = useNavigation<EmailPasswordScreenNavigationProp>();
  const { user, updateEmail, updatePassword } = useAuth();

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showEmailCurrentPassword, setShowEmailCurrentPassword] = useState(false);

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordCurrentPassword, setShowPasswordCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const toggleEmailPasswordVisibility = useCallback(() => setShowEmailCurrentPassword(p => !p), []);
  const togglePasswordCurrentVisibility = useCallback(() => setShowPasswordCurrentPassword(p => !p), []);
  const toggleNewPasswordVisibility = useCallback(() => setShowNewPassword(p => !p), []);
  const toggleConfirmPasswordVisibility = useCallback(() => setShowConfirmPassword(p => !p), []);
  const toggleEmailEditing = useCallback(() => setIsEditingEmail(p => !p), []);
  const togglePasswordEditing = useCallback(() => setIsEditingPassword(p => !p), []);

  const handleUpdateEmail = async () => {
    if (!user?.email) { Alert.alert('Sign in required', 'Please sign in again to change your email.'); return; }
    if (!emailCurrentPassword.trim()) { Alert.alert('Error', 'Please enter your current password'); return; }
    if (!newEmail.trim()) { Alert.alert('Error', 'Please enter a new email address'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) { Alert.alert('Error', 'Please enter a valid email address'); return; }
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
    if (!user?.email) { Alert.alert('Sign in required', 'Please sign in again to change your password.'); return; }
    if (!passwordCurrentPassword.trim()) { Alert.alert('Error', 'Please enter your current password'); return; }
    if (!newPassword.trim()) { Alert.alert('Error', 'Please enter a new password'); return; }
    if (newPassword.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters long'); return; }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}\[\]|:;"'<>.,?\/`~]).{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      Alert.alert('Weak password', 'Use at least 8 characters including 1 uppercase, 1 lowercase, 1 number, and 1 symbol.');
      return;
    }
    if (newPassword !== confirmPassword) { Alert.alert('Error', 'New passwords do not match'); return; }
    if (newPassword === passwordCurrentPassword) { Alert.alert('Error', 'New password must be different from current password'); return; }
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
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
          <View style={styles.card}>
            {/* Email row */}
            <View style={styles.row}>
              <View style={styles.infoSection}>
                <Ionicons name="mail-outline" size={20} color="#FF9500" />
                <Text style={styles.currentValue}>{user?.email || 'No email set'}</Text>
              </View>
              <TouchableOpacity style={styles.editButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={toggleEmailEditing}>
                {isEditingEmail ? <Ionicons name="close" size={18} color="#FF3B30" /> : <Feather name="edit-2" size={18} color="#FFFFFF" />}
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
              />
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Password row */}
            <View style={styles.row}>
              <View style={styles.infoSection}>
                <Ionicons name="lock-closed" size={20} color="#FF3B30" />
                <Text style={styles.currentValue}>••••••••</Text>
              </View>
              <TouchableOpacity style={styles.editButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={togglePasswordEditing}>
                  {isEditingPassword ? <Ionicons name="close" size={18} color="#FF3B30" /> : <Feather name="edit-2" size={18} color="#FFFFFF" />}
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
                />
              )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EmailPasswordScreen;
