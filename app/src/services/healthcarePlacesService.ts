import { API_CONFIG } from '../config/api';

// Healthcare facility types for Google Places API
export const HEALTHCARE_TYPES = {
  HOSPITAL: 'hospital',
  PHARMACY: 'pharmacy',
  DOCTOR: 'doctor',
  DENTIST: 'dentist',
  PHYSIOTHERAPIST: 'physiotherapist',
  VETERINARY_CARE: 'veterinary_care',
} as const;

// Healthcare facility interfaces
export interface HealthcareFacility {
  id: string;
  name: string;
  type: keyof typeof HEALTHCARE_TYPES;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  openingHours?: {
    openNow: boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayText?: string[];
  };
  phoneNumber?: string;
  website?: string;
  photos?: string[];
  distance?: number; // in meters
  emergencyServices?: boolean;
  acceptsInsurance?: string[];
  specialties?: string[];
}

export interface EmergencyContacts {
  countryCode: string;
  country: string;
  emergency: string; // General emergency number
  police: string;
  fire: string;
  ambulance: string;
  poisonControl?: string;
  mentalHealth?: string;
  nonEmergencyMedical?: string;
  touristHotline?: string;
}

export interface GooglePlacesResponse {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    opening_hours?: {
      open_now: boolean;
      periods?: Array<{
        open: { day: number; time: string };
        close: { day: number; time: string };
      }>;
      weekday_text?: string[];
    };
    formatted_phone_number?: string;
    website?: string;
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    types: string[];
  }>;
  status: string;
  next_page_token?: string;
}

/**
 * Search for nearby healthcare facilities
 */
export const searchNearbyHealthcareFacilities = async (
  latitude: number,
  longitude: number,
  type: keyof typeof HEALTHCARE_TYPES = 'HOSPITAL',
  radius: number = 5000
): Promise<HealthcareFacility[]> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('🚨 Google Maps API key not found, cannot search healthcare facilities');
      return [];
    }

    const searchType = HEALTHCARE_TYPES[type];
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${searchType}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    console.log(`🔍 Searching for ${type} near ${latitude},${longitude} within ${radius}m`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`🚨 Places API HTTP error: ${response.status}`);
      throw new Error(`Places API error: ${response.status}`);
    }

    const data: GooglePlacesResponse = await response.json();
    
    console.log(`📡 Google Places API response for ${type}:`, {
      status: data.status,
      results: data.results?.length || 0
    });
    
    if (data.status !== 'OK') {
      console.warn(`🚨 Google Places API error for ${type}:`, data.status);
      return [];
    }

    // Convert Google Places results to our HealthcareFacility format
    const facilities: HealthcareFacility[] = data.results.map(place => {
      // Calculate distance
      const distance = calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      // Determine if it's an emergency facility
      const emergencyServices = place.types.includes('hospital') || 
                              place.name.toLowerCase().includes('emergency') ||
                              place.name.toLowerCase().includes('urgent care');

      return {
        id: place.place_id,
        name: place.name,
        type: type,
        address: place.formatted_address,
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
          periods: place.opening_hours.periods,
          weekdayText: place.opening_hours.weekday_text,
        } : undefined,
        phoneNumber: place.formatted_phone_number,
        website: place.website,
        photos: place.photos?.map(photo => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
        ),
        distance: Math.round(distance),
        emergencyServices,
      };
    });

    // Sort by distance
    return facilities.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error('Error searching healthcare facilities:', error);
    return [];
  }
};

/**
 * Get comprehensive healthcare facilities for a location
 */
export const getAllHealthcareFacilities = async (
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<{
  hospitals: HealthcareFacility[];
  pharmacies: HealthcareFacility[];
  clinics: HealthcareFacility[];
  dentists: HealthcareFacility[];
  total: number;
}> => {
  try {
    const [hospitals, pharmacies, clinics, dentists] = await Promise.all([
      searchNearbyHealthcareFacilities(latitude, longitude, 'HOSPITAL', radius),
      searchNearbyHealthcareFacilities(latitude, longitude, 'PHARMACY', radius),
      searchNearbyHealthcareFacilities(latitude, longitude, 'DOCTOR', radius),
      searchNearbyHealthcareFacilities(latitude, longitude, 'DENTIST', radius),
    ]);

    return {
      hospitals,
      pharmacies,
      clinics,
      dentists,
      total: hospitals.length + pharmacies.length + clinics.length + dentists.length,
    };
  } catch (error) {
    console.error('Error getting all healthcare facilities:', error);
    return {
      hospitals: [],
      pharmacies: [],
      clinics: [],
      dentists: [],
      total: 0,
    };
  }
};

/**
 * Get emergency contacts for a country
 */
export const getEmergencyContacts = (countryCode: string): EmergencyContacts => {
  const emergencyDatabase: Record<string, EmergencyContacts> = {
    US: {
      countryCode: 'US',
      country: 'United States',
      emergency: '911',
      police: '911',
      fire: '911',
      ambulance: '911',
      poisonControl: '1-800-222-1222',
      mentalHealth: '988',
      nonEmergencyMedical: '311',
      touristHotline: '1-800-255-3050',
    },
    FR: {
      countryCode: 'FR',
      country: 'France',
      emergency: '112',
      police: '17',
      fire: '18',
      ambulance: '15',
      poisonControl: '01 40 05 48 48',
      touristHotline: '3975',
    },
    UK: {
      countryCode: 'UK',
      country: 'United Kingdom',
      emergency: '999',
      police: '999',
      fire: '999',
      ambulance: '999',
      nonEmergencyMedical: '111',
      touristHotline: '0300 123 9999',
    },
    JP: {
      countryCode: 'JP',
      country: 'Japan',
      emergency: '110',
      police: '110',
      fire: '119',
      ambulance: '119',
      touristHotline: '050-3816-2787',
    },
    AU: {
      countryCode: 'AU',
      country: 'Australia',
      emergency: '000',
      police: '000',
      fire: '000',
      ambulance: '000',
      poisonControl: '13 11 26',
      mentalHealth: '13 11 14',
      touristHotline: '1800 634 542',
    },
    CA: {
      countryCode: 'CA',
      country: 'Canada',
      emergency: '911',
      police: '911',
      fire: '911',
      ambulance: '911',
      poisonControl: '1-844-764-7669',
      mentalHealth: '1-833-456-4566',
    },
    DE: {
      countryCode: 'DE',
      country: 'Germany',
      emergency: '112',
      police: '110',
      fire: '112',
      ambulance: '112',
      poisonControl: '030 19240',
      touristHotline: '030 25 00 25',
    },
  };

  // Default international emergency contacts
  const defaultContacts: EmergencyContacts = {
    countryCode: 'INTL',
    country: 'International',
    emergency: '112',
    police: '112',
    fire: '112',
    ambulance: '112',
    touristHotline: 'Contact local embassy',
  };

  return emergencyDatabase[countryCode.toUpperCase()] || defaultContacts;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Get facility type icon
 */
export const getFacilityIcon = (type: keyof typeof HEALTHCARE_TYPES): string => {
  const iconMap = {
    HOSPITAL: 'medical',
    PHARMACY: 'fitness',
    DOCTOR: 'person',
    DENTIST: 'happy',
    PHYSIOTHERAPIST: 'body',
    VETERINARY_CARE: 'paw',
  };

  return iconMap[type] || 'medical';
};

/**
 * Format facility distance
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${distance}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}; 