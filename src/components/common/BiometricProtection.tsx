import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import biometricService from '../../services/biometricService';

interface BiometricProtectionProps {
  children: React.ReactNode;
  onAuthenticationSuccess?: () => void;
  onAuthenticationFailure?: () => void;
  promptMessage?: string;
  fallbackLabel?: string;
  showFallback?: boolean;
  requireBiometric?: boolean; // If false, allows access without biometric when disabled
}

const BiometricProtection: React.FC<BiometricProtectionProps> = ({
  children,
  onAuthenticationSuccess,
  onAuthenticationFailure,
  promptMessage = 'Authenticate to access your health data',
  fallbackLabel = 'Use passcode',
  showFallback = true,
  requireBiometric = true,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showFallbackOption, setShowFallbackOption] = useState(false);

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      await biometricService.initialize();
      const available = biometricService.isBiometricAvailable();
      const enabled = biometricService.isBiometricEnabled();
      
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
      
      // If biometric is not required or not enabled, allow access
      if (!requireBiometric || !enabled) {
        setIsAuthenticated(true);
        onAuthenticationSuccess?.();
      } else {
        // Require biometric authentication
        await authenticate();
      }
    } catch (error) {
      console.error('Error initializing biometric protection:', error);
      // On error, allow access if biometric is not required
      if (!requireBiometric) {
        setIsAuthenticated(true);
        onAuthenticationSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    try {
      setIsLoading(true);
      const success = await biometricService.authenticate({
        promptMessage,
        fallbackLabel,
        cancelLabel: 'Cancel',
      });

      if (success) {
        setIsAuthenticated(true);
        onAuthenticationSuccess?.();
      } else {
        setIsAuthenticated(false);
        onAuthenticationFailure?.();
        if (showFallback) {
          setShowFallbackOption(true);
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setIsAuthenticated(false);
      onAuthenticationFailure?.();
      if (showFallback) {
        setShowFallbackOption(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setShowFallbackOption(false);
    authenticate();
  };

  const handleFallback = () => {
    // Allow access without biometric (you might want to implement alternative authentication)
    setIsAuthenticated(true);
    onAuthenticationSuccess?.();
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing security...</Text>
        </View>
      </View>
    );
  }

  // If biometric is not required or not enabled, show content directly
  if (!requireBiometric || !biometricEnabled) {
    return <>{children}</>;
  }

  // If not authenticated, show authentication screen
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={80} color="#007AFF" />
          </View>
          
          <Text style={styles.title}>Security Required</Text>
          <Text style={styles.subtitle}>
            This screen contains sensitive health information that requires biometric authentication.
          </Text>
          
          <TouchableOpacity style={styles.authenticateButton} onPress={handleRetry}>
            <Ionicons name="finger-print" size={24} color="#FFFFFF" />
            <Text style={styles.authenticateButtonText}>Authenticate</Text>
          </TouchableOpacity>
          
          {showFallbackOption && (
            <TouchableOpacity style={styles.fallbackButton} onPress={handleFallback}>
              <Text style={styles.fallbackButtonText}>Continue without biometric</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Your health data is protected with {biometricAvailable ? 'biometric authentication' : 'device security'}.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // If authenticated, show the protected content
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  authenticateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  authenticateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  fallbackButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  fallbackButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BiometricProtection; 