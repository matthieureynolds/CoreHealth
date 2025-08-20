import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricConfig {
  promptMessage: string;
  fallbackLabel?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
}

export class BiometricService {
  private static instance: BiometricService;
  private isEnabled: boolean = false;
  private isAvailable: boolean = false;

  private constructor() {}

  public static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Initialize the biometric service and check availability
   */
  public async initialize(): Promise<void> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      this.isAvailable = hasHardware && isEnrolled;
      
      if (this.isAvailable) {
        const stored = await AsyncStorage.getItem('biometricEnabled');
        this.isEnabled = stored === 'true';
      }
    } catch (error) {
      console.error('Error initializing biometric service:', error);
      this.isAvailable = false;
      this.isEnabled = false;
    }
  }

  /**
   * Check if biometric authentication is available on the device
   */
  public isBiometricAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Check if biometric authentication is currently enabled
   */
  public isBiometricEnabled(): boolean {
    return this.isEnabled && this.isAvailable;
  }

  /**
   * Enable biometric authentication
   */
  public async enableBiometric(): Promise<boolean> {
    if (!this.isAvailable) {
      throw new Error('Biometric authentication is not available on this device');
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric lock',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        this.isEnabled = true;
        await AsyncStorage.setItem('biometricEnabled', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling biometric authentication:', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  public async disableBiometric(): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to disable biometric lock',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        this.isEnabled = false;
        await AsyncStorage.setItem('biometricEnabled', 'false');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error disabling biometric authentication:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with biometric (Face ID/Touch ID)
   * This is the main method to protect sensitive operations
   */
  public async authenticate(config?: BiometricConfig): Promise<boolean> {
    if (!this.isEnabled || !this.isAvailable) {
      // If biometric is not enabled, allow access (you might want to implement fallback authentication)
      return true;
    }

    try {
      const defaultConfig: BiometricConfig = {
        promptMessage: 'Authenticate to access your health data',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      };

      const finalConfig = { ...defaultConfig, ...config };

      const result = await LocalAuthentication.authenticateAsync(finalConfig);
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  /**
   * Get supported authentication types
   */
  public async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported authentication types:', error);
      return [];
    }
  }

  /**
   * Check if the device supports specific authentication type
   */
  public async supportsAuthenticationType(type: LocalAuthentication.AuthenticationType): Promise<boolean> {
    try {
      const supportedTypes = await this.getSupportedTypes();
      return supportedTypes.includes(type);
    } catch (error) {
      console.error('Error checking authentication type support:', error);
      return false;
    }
  }

  /**
   * Get authentication type name for display
   */
  public getAuthenticationTypeName(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Touch ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  }

  /**
   * Get the primary authentication method name for the device
   */
  public async getPrimaryAuthenticationMethod(): Promise<string> {
    try {
      const supportedTypes = await this.getSupportedTypes();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Touch ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris Scan';
      }
      
      return 'Biometric';
    } catch (error) {
      console.error('Error getting primary authentication method:', error);
      return 'Biometric';
    }
  }

  /**
   * Reset biometric settings (useful for testing or troubleshooting)
   */
  public async reset(): Promise<void> {
    try {
      this.isEnabled = false;
      await AsyncStorage.removeItem('biometricEnabled');
    } catch (error) {
      console.error('Error resetting biometric settings:', error);
    }
  }
}

export default BiometricService.getInstance(); 