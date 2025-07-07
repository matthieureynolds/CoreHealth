import { API_CONFIG } from '../config/api';
import { LocationData } from '../types';

// Geocoding API response interfaces
export interface GeocodingResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    place_id: string;
  }>;
  status: string;
}

export interface ReverseGeocodingResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    place_id: string;
  }>;
  status: string;
}

/**
 * Convert address or place name to coordinates
 */
export const geocodeAddress = async (address: string): Promise<LocationData | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found, cannot geocode address');
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.GEOCODING_ENDPOINT}?address=${encodedAddress}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data: GeocodingResponse = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn('No geocoding results found for:', address);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    // Extract location details from address components
    const addressComponents = result.address_components;
    const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || 
                 addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name || 
                 'Unknown City';
    
    const country = addressComponents.find(comp => comp.types.includes('country'))?.long_name || 'Unknown Country';
    
    // Get timezone for the location
    const timezone = await getTimezoneForLocation(location.lat, location.lng);
    
    const locationData: LocationData = {
      name: city,
      country: country,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng,
      },
      timezone: timezone || 'UTC',
      elevation: 0, // Will be updated if we have elevation data
    };

    return locationData;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Convert coordinates to address
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<LocationData | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found, cannot reverse geocode');
      return null;
    }

    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.GEOCODING_ENDPOINT}?latlng=${latitude},${longitude}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data: ReverseGeocodingResponse = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn('No reverse geocoding results found for coordinates:', latitude, longitude);
      return null;
    }

    const result = data.results[0];
    const addressComponents = result.address_components;
    
    const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || 
                 addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name || 
                 'Unknown City';
    
    const country = addressComponents.find(comp => comp.types.includes('country'))?.long_name || 'Unknown Country';
    
    // Get timezone for the location
    const timezone = await getTimezoneForLocation(latitude, longitude);
    
    const locationData: LocationData = {
      name: city,
      country: country,
      coordinates: {
        latitude,
        longitude,
      },
      timezone: timezone || 'UTC',
      elevation: 0, // Will be updated if we have elevation data
    };

    return locationData;
  } catch (error) {
    console.error('Error reverse geocoding coordinates:', error);
    return null;
  }
};

/**
 * Get timezone for a location
 */
export const getTimezoneForLocation = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found, cannot get timezone');
      return null;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.TIMEZONE_ENDPOINT}?location=${latitude},${longitude}&timestamp=${timestamp}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Timezone API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.warn('No timezone data found for coordinates:', latitude, longitude);
      return null;
    }

    return data.timeZoneId;
  } catch (error) {
    console.error('Error getting timezone:', error);
    return null;
  }
};

/**
 * Search for places near a location
 */
export const searchNearbyPlaces = async (
  latitude: number, 
  longitude: number, 
  type: string = 'hospital',
  radius: number = 5000
): Promise<any[]> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found, cannot search places');
      return [];
    }

    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.PLACES_ENDPOINT}?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.warn('No places found near coordinates:', latitude, longitude);
      return [];
    }

    return data.results || [];
  } catch (error) {
    console.error('Error searching nearby places:', error);
    return [];
  }
}; 