import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './emailPasswordStyles';

export type EmailFormProps = {
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
      <TouchableOpacity style={styles.eyeButton} onPress={toggleEmailPasswordVisibility}>
        <Ionicons name={showEmailCurrentPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
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

export default EmailForm;
