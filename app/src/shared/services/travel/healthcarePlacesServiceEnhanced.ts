import { API_CONFIG } from '../../config/api';

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'hospital' | 'pharmacy' | 'clinic' | 'dentist';
  address: string;
  distance: number; // in meters
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  openingHours?: string[];
  rating?: number;
  isEmergency?: boolean;
}

export interface ClosestMedicalFacilities {
  nearestHospital: HealthcareFacility | null;
  nearestPharmacy: HealthcareFacility | null;
  totalFound: number;
  source: 'google' | 'openstreetmap' | 'static' | 'mixed';
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Search using OpenStreetMap Nominatim API (free, no API key required)
 */
const searchOSMHealthcare = async (
  latitude: number,
  longitude: number,
  type: 'hospital' | 'pharmacy'
): Promise<HealthcareFacility[]> => {
  try {
    const amenity = type === 'hospital' ? 'hospital' : 'pharmacy';
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${amenity}&` +
      `format=json&` +
      `limit=10&` +
      `lat=${latitude}&` +
      `lon=${longitude}&` +
      `radius=10000&` +
      `addressdetails=1&` +
      `extratags=1`;
    
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TOTO-App/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }
    
    const data: any[] = await response.json();
    
    const facilities: HealthcareFacility[] = data
      .filter(place => place.display_name && place.lat && place.lon)
      .map(place => {
        // Extract better name from display_name
        const nameParts = place.display_name.split(',');
        let name = nameParts[0];
        
        // Try to get a more descriptive name from extratags or other fields
        if (place.extratags?.name) {
          name = place.extratags.name;
        } else if (place.name) {
          name = place.name;
        } else if (nameParts.length > 1) {
          // Try to get a more descriptive name from the address
          const potentialName = nameParts.find((part: string) => 
            part.toLowerCase().includes('hospital') || 
            part.toLowerCase().includes('pharmacy') ||
            part.toLowerCase().includes('medical') ||
            part.toLowerCase().includes('clinic')
          );
          if (potentialName) {
            name = potentialName.trim();
          }
        }
        
        // Fallback to generic name if nothing better found
        if (!name || name.length < 3) {
          name = `${type === 'hospital' ? 'Hospital' : 'Pharmacy'} Facility`;
        }
        
        return {
          id: place.place_id || `osm_${place.lat}_${place.lon}`,
          name,
          type,
          address: place.display_name || 'Address not available',
          distance: calculateDistance(latitude, longitude, parseFloat(place.lat), parseFloat(place.lon)),
          coordinates: {
            latitude: parseFloat(place.lat),
            longitude: parseFloat(place.lon)
          },
          phone: place.extratags?.phone || place.extratags?.contact?.phone,
          rating: 4.0, // Default rating since OSM doesn't provide ratings
          isEmergency: type === 'hospital'
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 5 closest
    
    return facilities;
    
  } catch (error) {
    console.error(`Error searching OSM for ${type}:`, error);
    return [];
  }
};

/**
 * Static healthcare data for major cities (emergency fallback)
 */
const getStaticHealthcareData = (
  cityName: string,
  latitude: number,
  longitude: number
): HealthcareFacility[] => {
  const city = cityName.toLowerCase();
  const facilities: HealthcareFacility[] = [];
  
  // Major city healthcare data
  const staticData: Record<string, { hospitals: any[], pharmacies: any[] }> = {
    'london': {
      hospitals: [
        { name: 'Guy\'s Hospital', lat: 51.5038, lon: -0.0875, phone: '+44 20 7188 7188' },
        { name: 'St Thomas\' Hospital', lat: 51.4990, lon: -0.1193, phone: '+44 20 7188 7188' },
        { name: 'University College Hospital', lat: 51.5249, lon: -0.1342, phone: '+44 20 3456 7890' }
      ],
      pharmacies: [
        { name: 'Boots Pharmacy', lat: 51.5074, lon: -0.1278, phone: '+44 20 7946 0958' },
        { name: 'Lloyds Pharmacy', lat: 51.5154, lon: -0.0922, phone: '+44 20 7242 1010' },
        { name: 'Superdrug Pharmacy', lat: 51.5085, lon: -0.1257, phone: '+44 20 7747 8000' }
      ]
    },
    'paris': {
      hospitals: [
        { name: 'Hôpital de la Pitié-Salpêtrière', lat: 48.8389, lon: 2.3589, phone: '+33 1 42 16 00 00' },
        { name: 'Hôpital Saint-Antoine', lat: 48.8489, lon: 2.3889, phone: '+33 1 49 28 20 00' },
        { name: 'Hôpital Necker', lat: 48.8389, lon: 2.3389, phone: '+33 1 44 49 40 00' }
      ],
      pharmacies: [
        { name: 'Pharmacie de la Bastille', lat: 48.8534, lon: 2.3686, phone: '+33 1 43 71 85 85' },
        { name: 'Pharmacie du Marais', lat: 48.8566, lon: 2.3522, phone: '+33 1 42 77 20 00' },
        { name: 'Pharmacie des Halles', lat: 48.8620, lon: 2.3469, phone: '+33 1 42 36 85 00' }
      ]
    },
    'new york': {
      hospitals: [
        { name: 'Bellevue Hospital', lat: 40.7411, lon: -73.9897, phone: '+1 212-562-4141' },
        { name: 'Mount Sinai Hospital', lat: 40.7870, lon: -73.9518, phone: '+1 212-241-6500' },
        { name: 'NYU Langone Health', lat: 40.7431, lon: -73.9762, phone: '+1 212-263-7300' }
      ],
      pharmacies: [
        { name: 'CVS Pharmacy', lat: 40.7589, lon: -73.9851, phone: '+1 212-247-4218' },
        { name: 'Walgreens Pharmacy', lat: 40.7505, lon: -73.9934, phone: '+1 212-695-9080' },
        { name: 'Duane Reade Pharmacy', lat: 40.7614, lon: -73.9776, phone: '+1 212-247-4218' }
      ]
    },
    'haslemere': {
      hospitals: [
        { name: 'Royal Surrey County Hospital', lat: 51.2351, lon: -0.5847, phone: '+44 1483 571122' },
        { name: 'St Peter\'s Hospital', lat: 51.3597, lon: -0.4767, phone: '+44 1932 872000' },
        { name: 'Frimley Park Hospital', lat: 51.2976, lon: -0.7359, phone: '+44 1276 604604' }
      ],
      pharmacies: [
        { name: 'Boots Pharmacy Haslemere', lat: 51.0888, lon: -0.7123, phone: '+44 1428 642511' },
        { name: 'Lloyds Pharmacy Haslemere', lat: 51.0890, lon: -0.7115, phone: '+44 1428 643322' },
        { name: 'Haslemere Pharmacy', lat: 51.0885, lon: -0.7120, phone: '+44 1428 642100' }
      ]
    },
    'milan': {
      hospitals: [
        { name: 'Ospedale Maggiore Policlinico', lat: 45.4789, lon: 9.1817, phone: '+39 02 5503 1' },
        { name: 'Istituto Clinico Humanitas', lat: 45.5071, lon: 9.2677, phone: '+39 02 8224 1' },
        { name: 'San Raffaele Hospital', lat: 45.4945, lon: 9.2408, phone: '+39 02 2643 1' }
      ],
      pharmacies: [
        { name: 'Farmacia Centrale Milano', lat: 45.4654, lon: 9.1859, phone: '+39 02 8646 1234' },
        { name: 'Farmacia Duomo', lat: 45.4642, lon: 9.1900, phone: '+39 02 8646 5678' },
        { name: 'Farmacia Brera', lat: 45.4719, lon: 9.1878, phone: '+39 02 8646 9012' }
      ]
    }
  };
  
  // Find matching city data
  for (const [cityKey, data] of Object.entries(staticData)) {
    if (city.includes(cityKey) || cityKey.includes(city)) {
      // Add hospitals
      data.hospitals.forEach(hospital => {
        facilities.push({
          id: `static_hospital_${hospital.name.replace(/\s+/g, '_')}`,
          name: hospital.name,
          type: 'hospital',
          address: `${cityName}, UK`,
          distance: calculateDistance(latitude, longitude, hospital.lat, hospital.lon),
          coordinates: { latitude: hospital.lat, longitude: hospital.lon },
          phone: hospital.phone,
          rating: 4.2,
          isEmergency: true
        });
      });
      
      // Add pharmacies
      data.pharmacies.forEach(pharmacy => {
        facilities.push({
          id: `static_pharmacy_${pharmacy.name.replace(/\s+/g, '_')}`,
          name: pharmacy.name,
          type: 'pharmacy',
          address: `${cityName}, UK`,
          distance: calculateDistance(latitude, longitude, pharmacy.lat, pharmacy.lon),
          coordinates: { latitude: pharmacy.lat, longitude: pharmacy.lon },
          phone: pharmacy.phone,
          rating: 4.0,
          isEmergency: false
        });
      });
      
      break;
    }
  }
  
  return facilities.sort((a, b) => a.distance - b.distance);
};

/**
 * Get the two closest medical facilities (hospital and pharmacy)
 */
export const getClosestMedicalFacilities = async (
  latitude: number,
  longitude: number,
  cityName: string = 'Unknown'
): Promise<ClosestMedicalFacilities> => {
  
  try {
    let hospitals: HealthcareFacility[] = [];
    let pharmacies: HealthcareFacility[] = [];
    let source: 'google' | 'openstreetmap' | 'static' | 'mixed' = 'static';
    
    // Check if we have static data for this city first (most reliable)
    const staticFacilities = getStaticHealthcareData(cityName, latitude, longitude);
    if (staticFacilities.length > 0) {
      hospitals = staticFacilities.filter(f => f.type === 'hospital');
      pharmacies = staticFacilities.filter(f => f.type === 'pharmacy');
      source = 'static';
    } else {
      // Try Google Places API if no static data available
      if (API_CONFIG.GOOGLE_MAPS_API_KEY && 
          API_CONFIG.GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here' &&
          API_CONFIG.GOOGLE_MAPS_API_KEY !== 'your-key-here' &&
          API_CONFIG.GOOGLE_MAPS_API_KEY.length > 20) {
        try {
          const googleHospitals = await searchGooglePlaces(latitude, longitude, 'hospital');
          const googlePharmacies = await searchGooglePlaces(latitude, longitude, 'pharmacy');
          
          if (googleHospitals.length > 0 || googlePharmacies.length > 0) {
            hospitals = googleHospitals;
            pharmacies = googlePharmacies;
            source = 'google';
          }
        } catch (error) {
          console.warn('Google Places API failed, trying alternatives:', error);
        }
      }
      
      // Fallback to OpenStreetMap if Google failed or no API key
      if (hospitals.length === 0 || pharmacies.length === 0) {
        
        const osmHospitals = await searchOSMHealthcare(latitude, longitude, 'hospital');
        const osmPharmacies = await searchOSMHealthcare(latitude, longitude, 'pharmacy');
        
        if (hospitals.length === 0) hospitals = osmHospitals;
        if (pharmacies.length === 0) pharmacies = osmPharmacies;
        
        source = hospitals.length > 0 && pharmacies.length > 0 ? 'openstreetmap' : 'mixed';
      }
    }
    
    const nearestHospital = hospitals.length > 0 ? hospitals[0] : null;
    const nearestPharmacy = pharmacies.length > 0 ? pharmacies[0] : null;
    
    
    return {
      nearestHospital,
      nearestPharmacy,
      totalFound: hospitals.length + pharmacies.length,
      source
    };
    
  } catch (error) {
    console.error('Error getting closest medical facilities:', error);
    
    // Emergency fallback - return static data
    const staticFacilities = getStaticHealthcareData(cityName, latitude, longitude);
    const hospitals = staticFacilities.filter(f => f.type === 'hospital');
    const pharmacies = staticFacilities.filter(f => f.type === 'pharmacy');
    
    return {
      nearestHospital: hospitals[0] || null,
      nearestPharmacy: pharmacies[0] || null,
      totalFound: staticFacilities.length,
      source: 'static'
    };
  }
};

/**
 * Search Google Places API (original function for reference)
 */
const searchGooglePlaces = async (
  latitude: number,
  longitude: number,
  type: 'hospital' | 'pharmacy'
): Promise<HealthcareFacility[]> => {
  try {
    const placeType = type === 'hospital' ? 'hospital' : 'pharmacy';
    const url = `${API_CONFIG.GOOGLE_MAPS_BASE_URL}${API_CONFIG.PLACES_ENDPOINT}?` +
      `location=${latitude},${longitude}&` +
      `radius=5000&` +
      `type=${placeType}&` +
      `key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }
    
    const data: any = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    return data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      type,
      address: place.vicinity || 'Address not available',
      distance: calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      rating: place.rating,
      isEmergency: type === 'hospital'
    })).sort((a: HealthcareFacility, b: HealthcareFacility) => a.distance - b.distance);
    
  } catch (error) {
    console.error(`Google Places search error for ${type}:`, error);
    return [];
  }
};
