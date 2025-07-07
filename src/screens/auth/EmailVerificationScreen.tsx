import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { supabase } from '../../config/supabase';

type EmailVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'EmailVerification'
>;

interface Props {
  navigation: EmailVerificationScreenNavigationProp;
}

const EmailVerificationScreen: React.FC<Props> = ({ navigation }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if email verification was successful
    const checkVerificationStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, []);

  const handleContinue = () => {
    navigation.navigate('Login');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="time-outline" size={80} color="#007AFF" />
          <Text style={styles.title}>Checking Verification...</Text>
          <Text style={styles.subtitle}>
            Please wait while we verify your email.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isVerified ? (
          <>
            <Ionicons name="checkmark-circle" size={80} color="#34C759" />
            <Text style={styles.title}>Account Confirmed!</Text>
            <Text style={styles.subtitle}>
              Your email has been successfully verified. You can now sign in to
              your CoreHealth account.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue to Sign In</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons name="alert-circle-outline" size={80} color="#FF3B30" />
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>
              We couldn't verify your email. The link may have expired or
              already been used.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleContinue}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});

export default EmailVerificationScreen;
