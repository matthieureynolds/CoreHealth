import * as Location from 'expo-location';
import { geocodeAddress, reverseGeocode } from '../services/travel/geocodingService';
import { LocationData } from '../types';

export const updateLocation = async (
  location: string,
  updateTravelHealthData: (locationData: LocationData) => Promise<void>,
): Promise<void> => {
  try {
    const locationData = await geocodeAddress(location);

    if (!locationData) {
      const mockLocationData: LocationData = {
        name: location,
        country: 'Unknown',
        coordinates: { latitude: 0, longitude: 0 },
        timezone: 'UTC',
        elevation: Math.floor(Math.random() * 2000),
      };
      await updateTravelHealthData(mockLocationData);
      return;
    }

    locationData.elevation = Math.floor(Math.random() * 2000);
    await updateTravelHealthData(locationData);
  } catch (error) {
    console.error('Failed to update location:', error);
    throw error;
  }
};

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync({});

    const locationData = await reverseGeocode(
      location.coords.latitude,
      location.coords.longitude,
    );

    if (!locationData) {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const geo = geocode[0];
      let locationName =
        geo?.city || geo?.district || geo?.subregion || geo?.region || 'Unknown Location';

      if (!locationName || locationName === geo?.country) {
        locationName = geo?.district || geo?.subregion || geo?.region || 'Unknown Location';
      }

      return {
        name: locationName,
        country: geo?.country || 'Unknown',
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        timezone: geo?.timezone || 'UTC',
        elevation: location.coords.altitude || 0,
      };
    }

    if (location.coords.altitude) {
      locationData.elevation = location.coords.altitude;
    }

    return locationData;
  } catch (error) {
    console.error('Failed to get current location:', error);
    return null;
  }
};
