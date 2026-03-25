import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../shared/context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../shared/types';
import {
  NameField,
  EmailField,
  PasswordField,
  ProgressBar,
} from './components/RegisterFormFields';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const TOTAL_STEPS = 5;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { signUp } = useAuth();

  const advance = (step: number) => setCurrentStep(s => (s === step ? step + 1 : s));

  const handleSignUp = async () => {
    if (!firstName || !surname || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, `${firstName} ${surname}`);
      navigation.navigate('EmailSent', { email });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join CoreHealth for personalized health insights</Text>
        </View>

        <View style={styles.form}>
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {currentStep >= 1 && (
            <NameField
              value={firstName}
              onChange={setFirstName}
              onEndEditing={() => { if (firstName.trim()) advance(1); }}
              placeholder="First Name"
              completed={currentStep > 1}
            />
          )}

          {currentStep >= 2 && (
            <NameField
              value={surname}
              onChange={setSurname}
              onEndEditing={() => { if (surname.trim()) advance(2); }}
              placeholder="Surname"
              completed={currentStep > 2}
            />
          )}

          {currentStep >= 3 && (
            <EmailField
              value={email}
              onChange={setEmail}
              onEndEditing={() => { if (email.trim()) advance(3); }}
              completed={currentStep > 3}
            />
          )}

          {currentStep >= 4 && (
            <PasswordField
              value={password}
              onChange={setPassword}
              onEndEditing={() => { if (password.trim()) advance(4); }}
              placeholder="Password"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(p => !p)}
              completed={currentStep > 4}
            />
          )}

          {currentStep >= 5 && (
            <PasswordField
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm Password"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(p => !p)}
              completed={!!(confirmPassword && password === confirmPassword)}
            />
          )}

          {currentStep >= 5 && firstName && surname && email && password && confirmPassword && (
            <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: '#007AFF',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  signInText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
