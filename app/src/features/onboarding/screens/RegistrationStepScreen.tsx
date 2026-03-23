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
import { useAuth } from '../../../shared/context/AuthContext';

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

  const handleStepComplete = () => {
    console.log('🔄 Step complete clicked, current step:', currentStep);
    console.log('📝 First name:', firstName, 'Surname:', surname, 'Email:', email, 'Password:', password);
    
    if (currentStep === 1 && firstName.trim().length > 0) {
      console.log('✅ Moving to step 2');
      setCurrentStep(2);
    } else if (currentStep === 2 && surname.trim().length > 0) {
      console.log('✅ Moving to step 3');
      setCurrentStep(3);
    } else if (currentStep === 3 && email.trim().length > 0) {
      console.log('✅ Moving to step 4');
      setCurrentStep(4);
    } else if (currentStep === 4 && password.trim().length > 0) {
      console.log('✅ Moving to step 5');
      setCurrentStep(5);
    } else {
      console.log('❌ Cannot advance - missing required field');
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
                onChangeText={setFirstName}
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
                onChangeText={setSurname}
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
                onChangeText={setEmail}
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
                onChangeText={setPassword}
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

          {/* Step Complete Button - Show for steps 1-4 */}
          {currentStep < 5 && (
            <TouchableOpacity
              style={[
                styles.stepButton,
                (!firstName && currentStep === 1) || 
                (!surname && currentStep === 2) || 
                (!email && currentStep === 3) || 
                (!password && currentStep === 4) 
                  ? styles.stepButtonDisabled 
                  : styles.stepButtonEnabled
              ]}
              onPress={handleStepComplete}
              disabled={
                (!firstName && currentStep === 1) || 
                (!surname && currentStep === 2) || 
                (!email && currentStep === 3) || 
                (!password && currentStep === 4)
              }
            >
              <Text style={styles.stepButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          )}

          {/* Final Next Button - Only show when all steps are complete */}
          {currentStep >= 5 && firstName && surname && email && password && confirmPassword && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Create Account</Text>
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
    backgroundColor: '#000000', // Dark background
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
    color: '#007AFF', // Keep blue for brand
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0', // Light gray for dark mode
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
    color: '#A0A0A0', // Light gray for dark mode
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333', // Dark gray for dark mode
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF', // Keep blue for progress
    borderRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333', // Dark border
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E', // Dark input background
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#FFFFFF', // White text for dark mode
  },
  eyeIcon: {
    padding: 4,
  },
  stepButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
  },
  stepButtonEnabled: {
    backgroundColor: '#007AFF', // Keep blue for enabled
  },
  stepButtonDisabled: {
    backgroundColor: '#333333', // Dark gray for disabled
  },
  stepButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#007AFF', // Keep blue for final button
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