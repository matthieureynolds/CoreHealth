import { useState, useEffect, useCallback } from 'react';
import locationService from '../services/locationService';

export interface UseLocationServicesReturn {
  isLocationEnabled: boolean;
  isLocationAvailable: boolean;
  permissionStatus: string | null;
  currentLocation: any | null;
  isLoading: boolean;
  enableLocation: () => Promise<boolean>;
  disableLocation: () => Promise<void>;
  getCurrentLocation: (config?: any) => Promise<any | null>;
  startLocationUpdates: (config?: any) => Promise<boolean>;
  stopLocationUpdates: () => void;
  checkPermission: () => Promise<string>;
  requestPermission: () => Promise<string>;
}

export const useLocationServices = (): UseLocationServicesReturn => {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLocationAvailable, setIsLocationAvailable] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      await locationService.initialize();
      
      const enabled = locationService.isLocationEnabled();
      const permission = locationService.getPermissionStatus();
      const available = await locationService.isLocationServicesEnabled();
      
      setIsLocationEnabled(enabled);
      setIsLocationAvailable(available);
      setPermissionStatus(permission);
      
      // Get current location if enabled
      if (enabled) {
        const location = await locationService.getCurrentLocation();
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Error initializing location services:', error);
      setIsLocationEnabled(false);
      setIsLocationAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enableLocation = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await locationService.enableLocation();
      
      if (success) {
        setIsLocationEnabled(true);
        setPermissionStatus(locationService.getPermissionStatus());
        
        // Get current location after enabling
        const location = await locationService.getCurrentLocation();
        setCurrentLocation(location);
      }
      
      return success;
    } catch (error) {
      console.error('Error enabling location:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disableLocation = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await locationService.disableLocation();
      setIsLocationEnabled(false);
      setPermissionStatus(locationService.getPermissionStatus());
      setCurrentLocation(null);
    } catch (error) {
      console.error('Error disabling location:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async (config?: any): Promise<any | null> => {
    if (!isLocationEnabled) {
      throw new Error('Location services are not enabled');
    }

    try {
      const location = await locationService.getCurrentLocation(config);
      setCurrentLocation(location);
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }, [isLocationEnabled]);

  const startLocationUpdates = useCallback(async (config?: any): Promise<boolean> => {
    if (!isLocationEnabled) {
      throw new Error('Location services are not enabled');
    }

    try {
      return await locationService.startLocationUpdates(config);
    } catch (error) {
      console.error('Error starting location updates:', error);
      return false;
    }
  }, [isLocationEnabled]);

  const stopLocationUpdates = useCallback(() => {
    locationService.stopLocationUpdates();
  }, []);

  const checkPermission = useCallback(async (): Promise<string> => {
    try {
      const status = await locationService.checkPermissionStatus();
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return 'denied';
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<string> => {
    try {
      setIsLoading(true);
      const status = await locationService.requestPermission();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        setIsLocationEnabled(true);
        // Get current location after permission granted
        const location = await locationService.getCurrentLocation();
        setCurrentLocation(location);
      } else {
        setIsLocationEnabled(false);
      }
      
      return status;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return 'denied';
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLocationEnabled,
    isLocationAvailable,
    permissionStatus,
    currentLocation,
    isLoading,
    enableLocation,
    disableLocation,
    getCurrentLocation,
    startLocationUpdates,
    stopLocationUpdates,
    checkPermission,
    requestPermission,
  };
};

export default useLocationServices; 