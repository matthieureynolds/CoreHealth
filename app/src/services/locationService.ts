import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationConfig {
  accuracy?: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export class LocationService {
  private static instance: LocationService;
  private isEnabled: boolean = false;
  private currentLocation: LocationData | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private permissionStatus: Location.PermissionStatus | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Initialize the location service and check permissions
   */
  public async initialize(): Promise<void> {
    try {
      await this.checkPermissionStatus();
      await this.loadSettings();
    } catch (error) {
      console.error('Error initializing location service:', error);
    }
  }

  /**
   * Check current location permission status
   */
  public async checkPermissionStatus(): Promise<Location.PermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.permissionStatus = status;
      return status;
    } catch (error) {
      console.error('Error checking location permission status:', error);
      return Location.PermissionStatus.DENIED;
    }
  }

  /**
   * Request location permission
   */
  public async requestPermission(): Promise<Location.PermissionStatus> {
    try {
      console.log('📍 LocationService: Requesting location permission...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 LocationService: Permission request result:', status);
      
      this.permissionStatus = status;
      
      if (status === Location.PermissionStatus.GRANTED) {
        console.log('✅ LocationService: Permission granted, enabling location');
        this.isEnabled = true;
        await AsyncStorage.setItem('locationAccess', 'true');
      } else {
        console.log('❌ LocationService: Permission denied, disabling location');
        this.isEnabled = false;
        await AsyncStorage.setItem('locationAccess', 'false');
      }
      
      return status;
    } catch (error) {
      console.error('❌ LocationService: Error requesting location permission:', error);
      return Location.PermissionStatus.DENIED;
    }
  }

  /**
   * Check if location access is enabled
   */
  public isLocationEnabled(): boolean {
    return this.isEnabled && this.permissionStatus === Location.PermissionStatus.GRANTED;
  }

  /**
   * Get current location permission status
   */
  public getPermissionStatus(): Location.PermissionStatus | null {
    return this.permissionStatus;
  }

  /**
   * Get current location (single request)
   */
  public async getCurrentLocation(config?: LocationConfig): Promise<LocationData | null> {
    if (!this.isLocationEnabled()) {
      throw new Error('Location access is not enabled');
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: config?.accuracy || Location.Accuracy.Balanced,
        timeInterval: config?.timeInterval || 5000,
        distanceInterval: config?.distanceInterval || 10,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      this.currentLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start watching location for continuous updates
   */
  public async startLocationUpdates(config?: LocationConfig): Promise<boolean> {
    if (!this.isLocationEnabled()) {
      throw new Error('Location access is not enabled');
    }

    if (this.locationSubscription) {
      // Already watching location
      return true;
    }

    try {
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: config?.accuracy || Location.Accuracy.Balanced,
          timeInterval: config?.timeInterval || 10000,
          distanceInterval: config?.distanceInterval || 10,
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };
          this.currentLocation = locationData;
        }
      );

      return true;
    } catch (error) {
      console.error('Error starting location updates:', error);
      return false;
    }
  }

  /**
   * Stop watching location updates
   */
  public stopLocationUpdates(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  /**
   * Get the last known location
   */
  public getLastKnownLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Calculate distance between two coordinates in meters
   */
  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if a location is within a certain radius of another location
   */
  public isWithinRadius(
    centerLat: number,
    centerLon: number,
    targetLat: number,
    targetLon: number,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLon, targetLat, targetLon);
    return distance <= radiusMeters;
  }

  /**
   * Get nearby places using reverse geocoding
   */
  public async getNearbyPlaces(latitude: number, longitude: number): Promise<any[]> {
    if (!this.isLocationEnabled()) {
      throw new Error('Location access is not enabled');
    }

    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      return results;
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return [];
    }
  }

  /**
   * Enable location access
   */
  public async enableLocation(): Promise<boolean> {
    try {
      const status = await this.requestPermission();
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.error('Error enabling location:', error);
      return false;
    }
  }

  /**
   * Disable location access
   */
  public async disableLocation(): Promise<void> {
    this.isEnabled = false;
    this.stopLocationUpdates();
    await AsyncStorage.setItem('locationAccess', 'false');
  }

  /**
   * Load saved location settings
   */
  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('locationAccess');
      if (stored === 'true' && this.permissionStatus === Location.PermissionStatus.GRANTED) {
        this.isEnabled = true;
      } else {
        this.isEnabled = false;
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  }

  /**
   * Check if location services are enabled on the device
   */
  public async isLocationServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking if location services are enabled:', error);
      return false;
    }
  }

  /**
   * Get location accuracy options for display
   */
  public getAccuracyOptions(): Array<{ value: Location.Accuracy; label: string; description: string }> {
    return [
      {
        value: Location.Accuracy.Lowest,
        label: 'Lowest',
        description: '±5km accuracy, best battery life',
      },
      {
        value: Location.Accuracy.Low,
        label: 'Low',
        description: '±1km accuracy, good battery life',
      },
      {
        value: Location.Accuracy.Balanced,
        label: 'Balanced',
        description: '±100m accuracy, balanced performance',
      },
      {
        value: Location.Accuracy.High,
        label: 'High',
        description: '±10m accuracy, higher battery usage',
      },
      {
        value: Location.Accuracy.Highest,
        label: 'Highest',
        description: '±3m accuracy, highest battery usage',
      },
      {
        value: Location.Accuracy.BestForNavigation,
        label: 'Navigation',
        description: 'Best for navigation, highest battery usage',
      },
    ];
  }

  /**
   * Reset location service (useful for testing or troubleshooting)
   */
  public async reset(): Promise<void> {
    try {
      this.stopLocationUpdates();
      this.currentLocation = null;
      this.isEnabled = false;
      this.permissionStatus = null;
      await AsyncStorage.removeItem('locationAccess');
    } catch (error) {
      console.error('Error resetting location service:', error);
    }
  }
}

export default LocationService.getInstance(); 