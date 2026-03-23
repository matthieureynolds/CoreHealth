import { useState, useEffect, useCallback } from 'react';
import biometricService from '../services/biometricService';

export interface UseBiometricAuthReturn {
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: (config?: any) => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  checkAuthentication: () => Promise<boolean>;
  reset: () => void;
}

export const useBiometricAuth = (): UseBiometricAuthReturn => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = useCallback(async () => {
    try {
      setIsLoading(true);
      await biometricService.initialize();
      
      const available = biometricService.isBiometricAvailable();
      const enabled = biometricService.isBiometricEnabled();
      
      setIsBiometricAvailable(available);
      setIsBiometricEnabled(enabled);
      
      // If biometric is not enabled, consider user as authenticated
      if (!enabled) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error initializing biometric auth:', error);
      setIsBiometricAvailable(false);
      setIsBiometricEnabled(false);
      setIsAuthenticated(true); // Allow access on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (config?: any): Promise<boolean> => {
    if (!isBiometricEnabled || !isBiometricAvailable) {
      setIsAuthenticated(true);
      return true;
    }

    try {
      setIsLoading(true);
      const success = await biometricService.authenticate(config);
      setIsAuthenticated(success);
      return success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isBiometricEnabled, isBiometricAvailable]);

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await biometricService.enableBiometric();
      if (success) {
        setIsBiometricEnabled(true);
        // Require authentication after enabling
        setIsAuthenticated(false);
      }
      return success;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await biometricService.disableBiometric();
      if (success) {
        setIsBiometricEnabled(false);
        setIsAuthenticated(true); // Allow access after disabling
      }
      return success;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    if (!isBiometricEnabled || !isBiometricAvailable) {
      return true;
    }
    return isAuthenticated;
  }, [isBiometricEnabled, isBiometricAvailable, isAuthenticated]);

  const reset = useCallback(() => {
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  return {
    isBiometricAvailable,
    isBiometricEnabled,
    isAuthenticated,
    isLoading,
    authenticate,
    enableBiometric,
    disableBiometric,
    checkAuthentication,
    reset,
  };
};

export default useBiometricAuth; 