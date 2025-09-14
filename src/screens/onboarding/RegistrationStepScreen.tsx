import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onNext: (userData: {
    firstName: string;
    surname: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
}

const RegistrationStepScreen: React.FC<Props> = ({ onNext }) => {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleFirstNameComplete = (text: string) => {
    setFirstName(text);
    if (text.trim().length > 0 && currentStep === 1) {
      setTimeout(() => {
        setCurrentStep(2);
      }, 500);
    }
  };

  const handleSurnameComplete = (text: string) => {
    setSurname(text);
    if (text.trim().length > 0 && currentStep === 2) {
      setTimeout(() => {
        setCurrentStep(3);
      }, 500);
    }
  };

  const handleEmailComplete = (text: string) => {
    setEmail(text);
    if (text.trim().length > 0 && currentStep === 3) {
      setTimeout(() => {
        setCurrentStep(4);
      }, 500);
    }
  };

  const handlePasswordComplete = (text: string) => {
    setPassword(text);
    if (text.trim().length > 0 && currentStep === 4) {
      setTimeout(() => {
        setCurrentStep(5);
      }, 500);
    }
  };

  const handleNext = () => {
    if (!firstName || !surname || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    onNext({
      firstName,
      surname,
      email,
      password,
      confirmPassword,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Let's get your account set up
          </Text>
        </View>

        <View style={styles.form}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Step {currentStep} of 5
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentStep / 5) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Step 1: First Name */}
          {currentStep >= 1 && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={handleFirstNameComplete}
                autoCapitalize="words"
              />
              {firstName && currentStep > 1 && (
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              )}
            </View>
          )}

          {/* Step 2: Surname */}
          {currentStep >= 2 && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Surname"
                value={surname}
                onChangeText={handleSurnameComplete}
                autoCapitalize="words"
              />
              {surname && currentStep > 2 && (
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              )}
            </View>
          )}

          {/* Step 3: Email */}
          {currentStep >= 3 && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={handleEmailComplete}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {email && currentStep > 3 && (
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              )}
            </View>
          )}

          {/* Step 4: Password */}
          {currentStep >= 4 && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordComplete}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {password && currentStep > 4 && (
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              )}
            </View>
          )}

          {/* Step 5: Confirm Password */}
          {currentStep >= 5 && (
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              {confirmPassword && password === confirmPassword && (
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              )}
            </View>
          )}

          {/* Next Button - Only show when all steps are complete */}
          {currentStep >= 5 && firstName && surname && email && password && confirmPassword && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 4,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default RegistrationStepScreen;
