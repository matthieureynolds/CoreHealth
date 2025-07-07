import { API_CONFIG } from '../config/api';

// Water station types and interfaces
export interface WaterStation {
  placeId: string;
  name: string;
  type: 'water_fountain' | 'park' | 'restaurant' | 'cafe' | 'shopping_center' | 'gym' | 'hotel' | 'visitor_center';
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number; // meters
  rating?: number;
  isOpen?: boolean;
  hasWaterAccess: boolean;
  accessType: 'free' | 'purchase_required' | 'unknown';
  accessibility: 'accessible' | 'limited' | 'unknown';
  notes?: string;
}

export interface WaterStationSearchResult {
  stations: WaterStation[];
  searchRadius: number;
  totalFound: number;
  recommendations: string[];
  emergencyOptions: string[];
}

// Place types that typically have water access
const WATER_ACCESS_PLACE_TYPES = [
  'park',
  'amusement_park',
  'zoo',
  'stadium',
  'gym',
  'shopping_mall',
  'tourist_attraction',
  'transit_station',
  'airport',
  'university',
  'hospital',
  'library',
  'museum',
  'restaurant',
  'cafe',
  'convenience_store',
  'gas_station',
  'hotel',
];

/**
 * Find water stations near a location
 */
export const findWaterStations = async (
  latitude: number,
  longitude: number,
  radiusMeters: number = 2000,
  urgency: 'low' | 'moderate' | 'high' | 'emergency' = 'moderate'
): Promise<WaterStationSearchResult> => {
  try {
    const stations: WaterStation[] = [];
    const searchPromises: Promise<WaterStation[]>[] = [];

    // Adjust search strategy based on urgency
    const searchTypes = getSearchTypesByUrgency(urgency);
    const adjustedRadius = adjustRadiusByUrgency(radiusMeters, urgency);

    // Search for each type of place
    for (const placeType of searchTypes) {
      searchPromises.push(
        searchPlacesByType(latitude, longitude, adjustedRadius, placeType)
      );
    }

    // Execute all searches in parallel
    const results = await Promise.all(searchPromises);
    
    // Flatten and process results
    const allStations = results.flat();
    
    // Remove duplicates and sort by distance
    const uniqueStations = removeDuplicateStations(allStations);
    const sortedStations = uniqueStations.sort((a, b) => a.distance - b.distance);

    // Limit results based on urgency
    const maxResults = urgency === 'emergency' ? 20 : urgency === 'high' ? 15 : 10;
    const limitedStations = sortedStations.slice(0, maxResults);

    // Generate recommendations and emergency options
    const recommendations = generateWaterStationRecommendations(limitedStations, urgency);
    const emergencyOptions = generateEmergencyWaterOptions(urgency);

    return {
      stations: limitedStations,
      searchRadius: adjustedRadius,
      totalFound: uniqueStations.length,
      recommendations,
      emergencyOptions,
    };
  } catch (error) {
    console.error('Error finding water stations:', error);
    return {
      stations: [],
      searchRadius: radiusMeters,
      totalFound: 0,
      recommendations: ['Unable to search for water stations'],
      emergencyOptions: generateEmergencyWaterOptions(urgency),
    };
  }
};

/**
 * Search for places by type using Google Places API
 */
const searchPlacesByType = async (
  latitude: number,
  longitude: number,
  radius: number,
  placeType: string
): Promise<WaterStation[]> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found');
      return [];
    }

    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.PLACES_ENDPOINT}` +
      `?location=${latitude},${longitude}` +
      `&radius=${radius}` +
      `&type=${placeType}` +
      `&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API status: ${data.status}`);
    }

    return data.results?.map((place: any) => convertToWaterStation(place, placeType, latitude, longitude)) || [];
  } catch (error) {
    console.error(`Error searching for ${placeType}:`, error);
    return [];
  }
};

/**
 * Convert Google Places result to WaterStation
 */
const convertToWaterStation = (
  place: any,
  searchType: string,
  userLat: number,
  userLng: number
): WaterStation => {
  const placeLat = place.geometry?.location?.lat || 0;
  const placeLng = place.geometry?.location?.lng || 0;
  
  const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
  const stationType = determineStationType(searchType, place.types || []);
  const waterAccess = determineWaterAccess(stationType, place);

  return {
    placeId: place.place_id || '',
    name: place.name || 'Unknown Location',
    type: stationType,
    location: {
      latitude: placeLat,
      longitude: placeLng,
    },
    distance: Math.round(distance),
    rating: place.rating,
    isOpen: determineIfOpen(place.opening_hours),
    hasWaterAccess: waterAccess.hasAccess,
    accessType: waterAccess.accessType,
    accessibility: waterAccess.accessibility,
    notes: generateStationNotes(stationType, place),
  };
};

/**
 * Calculate distance between two points in meters
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

/**
 * Determine station type from search type and place types
 */
const determineStationType = (searchType: string, placeTypes: string[]): WaterStation['type'] => {
  if (placeTypes.includes('park') || searchType === 'park') return 'park';
  if (placeTypes.includes('restaurant') || searchType === 'restaurant') return 'restaurant';
  if (placeTypes.includes('cafe') || searchType === 'cafe') return 'cafe';
  if (placeTypes.includes('shopping_mall') || searchType === 'shopping_mall') return 'shopping_center';
  if (placeTypes.includes('gym') || searchType === 'gym') return 'gym';
  if (placeTypes.includes('lodging') || searchType === 'hotel') return 'hotel';
  if (placeTypes.includes('tourist_attraction')) return 'visitor_center';
  
  return 'water_fountain';
};

/**
 * Determine water access information
 */
const determineWaterAccess = (
  stationType: WaterStation['type'],
  place: any
): { hasAccess: boolean; accessType: WaterStation['accessType']; accessibility: WaterStation['accessibility'] } => {
  let hasAccess = true;
  let accessType: WaterStation['accessType'] = 'unknown';
  let accessibility: WaterStation['accessibility'] = 'unknown';

  switch (stationType) {
    case 'water_fountain':
    case 'park':
      hasAccess = true;
      accessType = 'free';
      accessibility = 'accessible';
      break;
    case 'restaurant':
    case 'cafe':
      hasAccess = true;
      accessType = 'purchase_required';
      accessibility = 'accessible';
      break;
    case 'shopping_center':
    case 'visitor_center':
      hasAccess = true;
      accessType = 'free';
      accessibility = 'accessible';
      break;
    case 'gym':
    case 'hotel':
      hasAccess = true;
      accessType = 'unknown';
      accessibility = 'limited';
      break;
    default:
      hasAccess = false;
      accessType = 'unknown';
      accessibility = 'unknown';
  }

  return { hasAccess, accessType, accessibility };
};

/**
 * Determine if place is currently open
 */
const determineIfOpen = (openingHours: any): boolean | undefined => {
  if (!openingHours) return undefined;
  return openingHours.open_now;
};

/**
 * Generate notes for the station
 */
const generateStationNotes = (stationType: WaterStation['type'], place: any): string | undefined => {
  const notes: string[] = [];

  if (place.rating && place.rating >= 4.0) {
    notes.push('Highly rated');
  }

  switch (stationType) {
    case 'restaurant':
    case 'cafe':
      notes.push('May require purchase');
      break;
    case 'gym':
    case 'hotel':
      notes.push('Access may be restricted');
      break;
    case 'park':
      notes.push('Public water fountain likely available');
      break;
    case 'shopping_center':
      notes.push('Food court or visitor services may have water');
      break;
  }

  return notes.length > 0 ? notes.join(', ') : undefined;
};

/**
 * Get search types based on urgency
 */
const getSearchTypesByUrgency = (urgency: 'low' | 'moderate' | 'high' | 'emergency'): string[] => {
  const baseTypes = ['park', 'restaurant', 'cafe'];
  
  if (urgency === 'emergency') {
    return [
      'hospital',
      'gas_station',
      'convenience_store',
      'restaurant',
      'cafe',
      'shopping_mall',
      'park',
      'hotel',
    ];
  }
  
  if (urgency === 'high') {
    return [
      'park',
      'restaurant',
      'cafe',
      'convenience_store',
      'shopping_mall',
      'gas_station',
      'gym',
    ];
  }
  
  if (urgency === 'moderate') {
    return [
      'park',
      'restaurant',
      'cafe',
      'shopping_mall',
      'tourist_attraction',
      'gym',
      'hotel',
    ];
  }
  
  // Low urgency
  return [
    'park',
    'tourist_attraction',
    'shopping_mall',
    'museum',
    'library',
  ];
};

/**
 * Adjust search radius based on urgency
 */
const adjustRadiusByUrgency = (baseRadius: number, urgency: 'low' | 'moderate' | 'high' | 'emergency'): number => {
  switch (urgency) {
    case 'emergency':
      return Math.min(baseRadius * 2, 5000); // Expand search up to 5km
    case 'high':
      return Math.min(baseRadius * 1.5, 3000); // Expand search up to 3km
    case 'moderate':
      return baseRadius;
    case 'low':
      return Math.max(baseRadius * 0.8, 1000); // Reduce search but keep minimum 1km
    default:
      return baseRadius;
  }
};

/**
 * Remove duplicate stations based on proximity
 */
const removeDuplicateStations = (stations: WaterStation[]): WaterStation[] => {
  const uniqueStations: WaterStation[] = [];
  const minDistance = 50; // 50 meters minimum distance between stations

  for (const station of stations) {
    const isDuplicate = uniqueStations.some(existing => 
      calculateDistance(
        station.location.latitude,
        station.location.longitude,
        existing.location.latitude,
        existing.location.longitude
      ) < minDistance
    );

    if (!isDuplicate) {
      uniqueStations.push(station);
    }
  }

  return uniqueStations;
};

/**
 * Generate water station recommendations
 */
const generateWaterStationRecommendations = (
  stations: WaterStation[],
  urgency: 'low' | 'moderate' | 'high' | 'emergency'
): string[] => {
  const recommendations: string[] = [];

  if (stations.length === 0) {
    recommendations.push('No water stations found nearby');
    recommendations.push('Consider purchasing bottled water');
    return recommendations;
  }

  const nearestStation = stations[0];
  recommendations.push(`Nearest water source: ${nearestStation.name} (${nearestStation.distance}m)`);

  // Free water sources
  const freeStations = stations.filter(s => s.accessType === 'free');
  if (freeStations.length > 0) {
    recommendations.push(`${freeStations.length} free water source(s) available`);
  }

  // Open locations
  const openStations = stations.filter(s => s.isOpen === true);
  if (openStations.length > 0) {
    recommendations.push(`${openStations.length} currently open location(s)`);
  }

  // Urgency-specific recommendations
  if (urgency === 'emergency') {
    recommendations.push('HEAD TO NEAREST LOCATION IMMEDIATELY');
    recommendations.push('Ask staff for assistance if needed');
  } else if (urgency === 'high') {
    recommendations.push('Visit nearest location within 15 minutes');
    recommendations.push('Carry emergency water for future');
  }

  return recommendations;
};

/**
 * Generate emergency water options
 */
const generateEmergencyWaterOptions = (urgency: 'low' | 'moderate' | 'high' | 'emergency'): string[] => {
  const options = [
    'Call emergency services if experiencing severe dehydration',
    'Visit nearest hospital or medical facility',
    'Ask passersby for help finding water',
    'Look for any open business and request water',
    'Check for public buildings (libraries, community centers)',
  ];

  if (urgency === 'emergency') {
    return [
      'EMERGENCY: Call 911/local emergency services',
      'Seek immediate medical attention',
      ...options,
    ];
  }

  if (urgency === 'high') {
    return [
      'Find any open store or restaurant immediately',
      'Ask security or police for assistance',
      ...options.slice(2),
    ];
  }

  return options.slice(2);
};

/**
 * Get formatted distance string
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

/**
 * Get station icon based on type
 */
export const getStationIcon = (type: WaterStation['type']): string => {
  switch (type) {
    case 'water_fountain':
      return '🚰';
    case 'park':
      return '🏞️';
    case 'restaurant':
      return '🍽️';
    case 'cafe':
      return '☕';
    case 'shopping_center':
      return '🛒';
    case 'gym':
      return '🏋️';
    case 'hotel':
      return '🏨';
    case 'visitor_center':
      return 'ℹ️';
    default:
      return '💧';
  }
}; 