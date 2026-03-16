import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';

interface Props {
  email: string;
  onNext: () => void;
  onBack: () => void;
}

const EmailVerificationStepScreen: React.FC<Props> = ({ email, onNext, onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showTick, setShowTick] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const tickAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-focus first input
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (verificationCode: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Verifying email code:', verificationCode);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email'
      });

      if (error) {
        console.error('❌ Email verification failed:', error);
        Alert.alert('Verification Failed', 'Invalid code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        console.log('✅ Email verification successful:', data);
        // Show tick animation
        setShowTick(true);
        tickAnim.setValue(0);
        Animated.timing(tickAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            onNext();
          }, 1000);
        });
      }
    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      Alert.alert('Error', 'Verification failed. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      console.log('📧 Resending verification email...');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('❌ Failed to resend code:', error);
        Alert.alert('Error', 'Failed to resend code. Please try again.');
      } else {
        console.log('✅ Verification email resent successfully');
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      }
    } catch (error) {
      console.error('❌ Resend code error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                  showTick && styles.codeInputVerified,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {showTick && (
            <Animated.View
              style={[
                styles.tickContainer,
                {
                  opacity: tickAnim,
                  transform: [
                    {
                      scale: tickAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={60} color="#34C759" />
              <Text style={styles.tickText}>Verified!</Text>
            </Animated.View>
          )}

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={isLoading}
          >
            <Text style={styles.resendButtonText}>
              Didn't receive the code? Resend
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Verifying...</Text>
          </View>
        )}
      </View>
    </View>
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
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  emailText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  form: {
    flex: 1,
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
  },
  codeInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  codeInputVerified: {
    borderColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  tickContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tickText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34C759',
    marginTop: 8,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default EmailVerificationStepScreen;
