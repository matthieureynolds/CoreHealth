import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NameFieldProps {
  value: string;
  onChange: (text: string) => void;
  onEndEditing: () => void;
  placeholder: string;
  completed: boolean;
}

export const NameField: React.FC<NameFieldProps> = ({ value, onChange, onEndEditing, placeholder, completed }) => (
  <View style={styles.inputContainer}>
    <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      onEndEditing={onEndEditing}
      autoCapitalize="words"
    />
    {value && completed && <Ionicons name="checkmark-circle" size={20} color="#34C759" />}
  </View>
);

interface EmailFieldProps {
  value: string;
  onChange: (text: string) => void;
  onEndEditing: () => void;
  completed: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange, onEndEditing, completed }) => (
  <View style={styles.inputContainer}>
    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder="Email"
      value={value}
      onChangeText={onChange}
      onEndEditing={onEndEditing}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
    />
    {value && completed && <Ionicons name="checkmark-circle" size={20} color="#34C759" />}
  </View>
);

interface PasswordFieldProps {
  value: string;
  onChange: (text: string) => void;
  onEndEditing?: () => void;
  placeholder: string;
  showPassword: boolean;
  onToggleShow: () => void;
  completed: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value, onChange, onEndEditing, placeholder, showPassword, onToggleShow, completed
}) => (
  <View style={styles.inputContainer}>
    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      onEndEditing={onEndEditing}
      secureTextEntry={!showPassword}
      autoCapitalize="none"
    />
    <TouchableOpacity style={styles.eyeIcon} onPress={onToggleShow}>
      <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#666" />
    </TouchableOpacity>
    {value && completed && <Ionicons name="checkmark-circle" size={20} color="#34C759" />}
  </View>
);

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => (
  <View style={styles.progressContainer}>
    <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeIcon: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
});
