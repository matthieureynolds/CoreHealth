import { API_CONFIG } from '../config/api';
import { ActivitySafetyData } from '../types';

// Fitness facility types for Google Places API
export const FITNESS_TYPES = {
  GYM: 'gym',
  SWIMMING_POOL: 'swimming_pool',
  STADIUM: 'stadium',
  BOWLING_ALLEY: 'bowling_alley',
  PARK: 'park',
  AMUSEMENT_PARK: 'amusement_park',
  TOURIST_ATTRACTION: 'tourist_attraction', // Sports facilities
  SPA: 'spa',
} as const;

// Additional fitness-related search terms
const FITNESS_KEYWORDS = [
  'fitness center',
  'yoga studio',
  'pilates',
  'rock climbing',
  'martial arts',
  'dance studio',
  'tennis court',
  'basketball court',
  'soccer field',
  'running track',
  'crossfit',
  'boxing gym',
];

// Fitness facility interfaces
export interface FitnessFacility {
  id: string;
  name: string;
  type: keyof typeof FITNESS_TYPES | 'fitness_center' | 'sports_facility' | 'recreation_center';
  facilityCategory: 'indoor' | 'outdoor' | 'mixed';
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
  amenities?: string[];
  activities?: string[];
  weatherSuitability?: 'excellent' | 'good' | 'fair' | 'poor';
  safetyRecommendations?: string[];
  membershipRequired?: boolean;
  dayPassAvailable?: boolean;
}

export interface FitnessSearchResult {
  indoorFacilities: FitnessFacility[];
  outdoorFacilities: FitnessFacility[];
  weatherRecommendations: string[];
  safetyWarnings: string[];
  bestOptions: FitnessFacility[];
  total: number;
}

/**
 * Search for nearby fitness facilities
 */
export const searchNearbyFitnessFacilities = async (
  latitude: number,
  longitude: number,
  type: keyof typeof FITNESS_TYPES = 'GYM',
  radius: number = 5000
): Promise<FitnessFacility[]> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found, cannot search fitness facilities');
      return [];
    }

    const searchType = FITNESS_TYPES[type];
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${searchType}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('Fitness facilities search error:', data.status);
      return [];
    }

    // Convert Google Places results to our FitnessFacility format
    const facilities: FitnessFacility[] = data.results?.map((place: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      const facilityInfo = analyzeFacilityType(place.name, place.types || [], type);

      return {
        id: place.place_id,
        name: place.name,
        type: type,
        facilityCategory: facilityInfo.category,
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
        photos: place.photos?.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
        ),
        distance: Math.round(distance),
        amenities: facilityInfo.amenities,
        activities: facilityInfo.activities,
        membershipRequired: facilityInfo.membershipRequired,
        dayPassAvailable: facilityInfo.dayPassAvailable,
      };
    }) || [];

    return facilities.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error('Error searching fitness facilities:', error);
    return [];
  }
};

/**
 * Search for fitness facilities by keyword
 */
export const searchFitnessFacilitiesByKeyword = async (
  latitude: number,
  longitude: number,
  keyword: string,
  radius: number = 5000
): Promise<FitnessFacility[]> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found');
      return [];
    }

    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return [];
    }

    return data.results?.map((place: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      const facilityInfo = analyzeFacilityType(place.name, place.types || [], 'GYM');

      return {
        id: place.place_id,
        name: place.name,
        type: 'fitness_center' as const,
        facilityCategory: facilityInfo.category,
        address: place.formatted_address,
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        distance: Math.round(distance),
        amenities: facilityInfo.amenities,
        activities: facilityInfo.activities,
        membershipRequired: facilityInfo.membershipRequired,
        dayPassAvailable: facilityInfo.dayPassAvailable,
      };
    }) || [];
  } catch (error) {
    console.error('Error searching fitness facilities by keyword:', error);
    return [];
  }
};

/**
 * Get comprehensive fitness facilities with weather-based recommendations
 */
export const getAllFitnessFacilities = async (
  latitude: number,
  longitude: number,
  activitySafety: ActivitySafetyData | null,
  radius: number = 5000
): Promise<FitnessSearchResult> => {
  try {
    // Search for different types of facilities
    const searchPromises = [
      searchNearbyFitnessFacilities(latitude, longitude, 'GYM', radius),
      searchNearbyFitnessFacilities(latitude, longitude, 'SWIMMING_POOL', radius),
      searchNearbyFitnessFacilities(latitude, longitude, 'PARK', radius),
      searchNearbyFitnessFacilities(latitude, longitude, 'STADIUM', radius),
    ];

    // Also search by keywords for more specialized facilities
    const keywordPromises = FITNESS_KEYWORDS.slice(0, 3).map(keyword =>
      searchFitnessFacilitiesByKeyword(latitude, longitude, keyword, radius)
    );

    const [gymResults, poolResults, parkResults, stadiumResults, ...keywordResults] = 
      await Promise.all([...searchPromises, ...keywordPromises]);

    // Combine and deduplicate results
    const allFacilities = [
      ...gymResults,
      ...poolResults,
      ...parkResults,
      ...stadiumResults,
      ...keywordResults.flat(),
    ];

    const uniqueFacilities = removeDuplicateFacilities(allFacilities);

    // Categorize facilities and add weather suitability
    const facilitiesWithWeather = uniqueFacilities.map(facility => 
      addWeatherSuitability(facility, activitySafety)
    );

    // Separate indoor and outdoor facilities
    const indoorFacilities = facilitiesWithWeather.filter(f => 
      f.facilityCategory === 'indoor' || f.facilityCategory === 'mixed'
    );
    const outdoorFacilities = facilitiesWithWeather.filter(f => 
      f.facilityCategory === 'outdoor'
    );

    // Generate weather-based recommendations
    const weatherRecommendations = generateWeatherRecommendations(activitySafety, indoorFacilities, outdoorFacilities);
    const safetyWarnings = generateSafetyWarnings(activitySafety);
    const bestOptions = getBestFacilityOptions(facilitiesWithWeather, activitySafety);

    return {
      indoorFacilities: indoorFacilities.slice(0, 10),
      outdoorFacilities: outdoorFacilities.slice(0, 10),
      weatherRecommendations,
      safetyWarnings,
      bestOptions: bestOptions.slice(0, 5),
      total: uniqueFacilities.length,
    };
  } catch (error) {
    console.error('Error getting all fitness facilities:', error);
    return {
      indoorFacilities: [],
      outdoorFacilities: [],
      weatherRecommendations: ['Unable to get weather-based recommendations'],
      safetyWarnings: [],
      bestOptions: [],
      total: 0,
    };
  }
};

/**
 * Analyze facility type and determine amenities
 */
const analyzeFacilityType = (
  name: string,
  types: string[],
  searchType: keyof typeof FITNESS_TYPES
): {
  category: 'indoor' | 'outdoor' | 'mixed';
  amenities: string[];
  activities: string[];
  membershipRequired: boolean;
  dayPassAvailable: boolean;
} => {
  const nameLower = name.toLowerCase();
  let category: 'indoor' | 'outdoor' | 'mixed' = 'indoor';
  const amenities: string[] = [];
  const activities: string[] = [];
  let membershipRequired = true;
  let dayPassAvailable = true;

  // Determine category based on facility type
  if (searchType === 'PARK' || types.includes('park')) {
    category = 'outdoor';
    membershipRequired = false;
    amenities.push('Free access', 'Walking paths');
    activities.push('Walking', 'Jogging', 'Outdoor exercise');
  } else if (searchType === 'SWIMMING_POOL') {
    category = 'mixed';
    amenities.push('Swimming pool', 'Changing rooms');
    activities.push('Swimming', 'Water aerobics');
  } else if (searchType === 'STADIUM' || types.includes('stadium')) {
    category = 'mixed';
    amenities.push('Sports facilities', 'Spectator areas');
    activities.push('Various sports');
  } else {
    // Default to indoor gym/fitness center
    amenities.push('Exercise equipment', 'Changing rooms');
    activities.push('Strength training', 'Cardio');
  }

  // Analyze name for specific amenities and activities
  if (nameLower.includes('yoga')) {
    activities.push('Yoga');
    amenities.push('Yoga studio');
  }
  if (nameLower.includes('pilates')) {
    activities.push('Pilates');
  }
  if (nameLower.includes('crossfit')) {
    activities.push('CrossFit');
    amenities.push('CrossFit box');
  }
  if (nameLower.includes('boxing') || nameLower.includes('martial arts')) {
    activities.push('Boxing', 'Martial arts');
    amenities.push('Boxing ring');
  }
  if (nameLower.includes('climbing')) {
    activities.push('Rock climbing');
    amenities.push('Climbing wall');
  }
  if (nameLower.includes('tennis')) {
    activities.push('Tennis');
    amenities.push('Tennis courts');
    category = 'mixed';
  }
  if (nameLower.includes('basketball')) {
    activities.push('Basketball');
    amenities.push('Basketball courts');
  }
  if (nameLower.includes('track')) {
    activities.push('Running', 'Track sports');
    amenities.push('Running track');
    category = 'outdoor';
  }

  // Determine if day passes are likely available
  if (nameLower.includes('24') || nameLower.includes('anytime')) {
    dayPassAvailable = true;
  }
  if (nameLower.includes('planet fitness') || nameLower.includes('gold\'s gym')) {
    dayPassAvailable = true;
  }

  return {
    category,
    amenities: [...new Set(amenities)], // Remove duplicates
    activities: [...new Set(activities)],
    membershipRequired,
    dayPassAvailable,
  };
};

/**
 * Add weather suitability assessment to facility
 */
const addWeatherSuitability = (
  facility: FitnessFacility,
  activitySafety: ActivitySafetyData | null
): FitnessFacility => {
  if (!activitySafety) {
    return { ...facility, weatherSuitability: 'good' };
  }

  let suitability: 'excellent' | 'good' | 'fair' | 'poor';
  const recommendations: string[] = [];

  if (facility.facilityCategory === 'indoor') {
    // Indoor facilities are generally weather-independent
    suitability = 'excellent';
    recommendations.push('Climate-controlled environment');
    if (activitySafety.outdoorSafety === 'avoid') {
      recommendations.push('Perfect alternative to outdoor exercise');
    }
  } else if (facility.facilityCategory === 'outdoor') {
    // Outdoor facilities depend on weather conditions
    switch (activitySafety.outdoorSafety) {
      case 'safe':
        suitability = 'excellent';
        recommendations.push('Great weather for outdoor activities');
        break;
      case 'caution':
        suitability = 'fair';
        recommendations.push('Exercise with caution', 'Take frequent breaks');
        break;
      case 'avoid':
        suitability = 'poor';
        recommendations.push('Outdoor exercise not recommended', 'Consider indoor alternatives');
        break;
    }
  } else {
    // Mixed facilities offer flexibility
    if (activitySafety.outdoorSafety === 'avoid') {
      suitability = 'good';
      recommendations.push('Use indoor areas only');
    } else {
      suitability = 'excellent';
      recommendations.push('Indoor and outdoor options available');
    }
  }

  return {
    ...facility,
    weatherSuitability: suitability,
    safetyRecommendations: recommendations,
  };
};

/**
 * Remove duplicate facilities based on name and location
 */
const removeDuplicateFacilities = (facilities: FitnessFacility[]): FitnessFacility[] => {
  const seen = new Set<string>();
  return facilities.filter(facility => {
    const key = `${facility.name}-${facility.coordinates.latitude}-${facility.coordinates.longitude}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Generate weather-based recommendations
 */
const generateWeatherRecommendations = (
  activitySafety: ActivitySafetyData | null,
  indoorFacilities: FitnessFacility[],
  outdoorFacilities: FitnessFacility[]
): string[] => {
  const recommendations: string[] = [];

  if (!activitySafety) {
    recommendations.push('Weather data unavailable - choose based on preference');
    return recommendations;
  }

  switch (activitySafety.outdoorSafety) {
    case 'avoid':
      recommendations.push('INDOOR EXERCISE ONLY recommended');
      if (indoorFacilities.length > 0) {
        recommendations.push(`${indoorFacilities.length} indoor facility(ies) available`);
      } else {
        recommendations.push('No indoor facilities found - consider home workout');
      }
      break;
    case 'caution':
      recommendations.push('Prefer indoor facilities or exercise with caution outdoors');
      recommendations.push('Best outdoor exercise times: ' + activitySafety.bestTimes.join(', '));
      break;
    case 'safe':
      recommendations.push('Both indoor and outdoor exercise are safe');
      if (outdoorFacilities.length > 0) {
        recommendations.push('Great weather for outdoor activities');
      }
      break;
  }

  return recommendations;
};

/**
 * Generate safety warnings
 */
const generateSafetyWarnings = (activitySafety: ActivitySafetyData | null): string[] => {
  if (!activitySafety) return [];
  return activitySafety.warnings;
};

/**
 * Get best facility options based on weather and ratings
 */
const getBestFacilityOptions = (
  facilities: FitnessFacility[],
  activitySafety: ActivitySafetyData | null
): FitnessFacility[] => {
  // Score facilities based on weather suitability, rating, and distance
  const scoredFacilities = facilities.map(facility => {
    let score = 0;
    
    // Weather suitability score
    switch (facility.weatherSuitability) {
      case 'excellent': score += 10; break;
      case 'good': score += 7; break;
      case 'fair': score += 4; break;
      case 'poor': score += 1; break;
    }
    
    // Rating score
    if (facility.rating) {
      score += facility.rating * 2;
    }
    
    // Distance penalty (closer is better)
    if (facility.distance) {
      score -= facility.distance / 1000; // Subtract 1 point per km
    }
    
    // Open now bonus
    if (facility.openingHours?.openNow) {
      score += 3;
    }

    return { facility, score };
  });

  return scoredFacilities
    .sort((a, b) => b.score - a.score)
    .map(item => item.facility);
};

/**
 * Calculate distance between two points in meters
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
};

/**
 * Get facility icon based on type
 */
export const getFitnessIcon = (type: FitnessFacility['type']): string => {
  switch (type) {
    case 'GYM':
    case 'fitness_center':
      return '🏋️';
    case 'SWIMMING_POOL':
      return '🏊';
    case 'PARK':
      return '🏞️';
    case 'STADIUM':
    case 'sports_facility':
      return '🏟️';
    case 'BOWLING_ALLEY':
      return '🎳';
    case 'SPA':
      return '🧘';
    case 'recreation_center':
      return '🏛️';
    default:
      return '💪';
  }
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${distance}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};

/**
 * Get suitability color for UI
 */
export const getSuitabilityColor = (suitability: 'excellent' | 'good' | 'fair' | 'poor'): string => {
  switch (suitability) {
    case 'excellent':
      return '#30D158'; // Green
    case 'good':
      return '#32D74B'; // Light green
    case 'fair':
      return '#FF9500'; // Orange
    case 'poor':
      return '#FF3B30'; // Red
    default:
      return '#666';
  }
}; 