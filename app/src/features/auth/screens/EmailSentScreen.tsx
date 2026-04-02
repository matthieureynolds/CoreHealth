import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../shared/types';
import { performResendSignUpCode } from '../../../shared/context/authHelpers';

type EmailSentScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'EmailSent'
>;

interface Props {
  navigation: EmailSentScreenNavigationProp;
  route: {
    params: {
      email: string;
    };
  };
}

const EmailSentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleContinue = () => {
    navigation.navigate('EmailVerification', { email });
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await performResendSignUpCode(email);
      Alert.alert('Email Sent', 'A new verification email has been sent to your inbox.');
      setTimeLeft(30);
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#3AABF0" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={80} color="#3AABF0" />
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <Text style={styles.instructionText}>
            Please check your email inbox and enter the 6-digit code on the next screen to verify your account.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Enter Verification Code</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the email?{' '}
                {timeLeft > 0 ? (
                  <Text style={styles.timerText}>Resend in {timeLeft}s</Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleResendEmail}
                    disabled={isResending}
                  >
                    <Text style={styles.resendLink}>
                      {isResending ? 'Sending...' : 'Resend Email'}
                    </Text>
                  </TouchableOpacity>
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#3AABF0',
  },
  instructionText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#3AABF0',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 32,
    marginBottom: 24,
    minWidth: 200,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  timerText: {
    color: '#999',
  },
  resendLink: {
    color: '#3AABF0',
    fontWeight: '600',
  },
});

export default EmailSentScreen;
