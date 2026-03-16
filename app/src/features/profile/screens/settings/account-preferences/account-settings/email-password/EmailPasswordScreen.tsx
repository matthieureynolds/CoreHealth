import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmailPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSaveEmail = () => {
    Alert.alert('Success', 'Email updated successfully');
  };

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    Alert.alert('Success', 'Password updated successfully');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Email & Password</Text>
          <Text style={styles.headerSubtitle}>
            Update your email address and password
          </Text>
        </View>

        {/* Email Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#8E8E93"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmail}>
            <Text style={styles.saveButtonText}>Save Email</Text>
          </TouchableOpacity>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={!showPasswords}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={!showPasswords}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={!showPasswords}
            />
          </View>

          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={() => setShowPasswords(!showPasswords)}
          >
            <Ionicons 
              name={showPasswords ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#007AFF" 
            />
            <Text style={styles.toggleButtonText}>
              {showPasswords ? 'Hide' : 'Show'} Passwords
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSavePassword}>
            <Text style={styles.saveButtonText}>Save Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningSection}>
          <View style={styles.warningCard}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Security Notice</Text>
              <Text style={styles.warningText}>
                Changing your password will log you out of all devices. You'll need to sign in again.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  warningSection: {
    padding: 20,
    paddingTop: 10,
  },
  warningCard: {
    backgroundColor: '#007AFF10',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});

export default EmailPasswordScreen;
