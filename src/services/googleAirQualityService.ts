import { API_CONFIG } from '../config/api';

// Google Air Quality API response interfaces
export interface GoogleAirQualityData {
  universalAqi: number;
  dominantPollutant: string;
  indexes: Array<{
    code: string;
    displayName: string;
    aqi: number;
    aqiDisplay: string;
    color: {
      red: number;
      green: number;
      blue: number;
    };
    category: string;
  }>;
  pollutants: Array<{
    code: string;
    displayName: string;
    fullName: string;
    concentration: {
      value: number;
      units: string;
    };
    additionalInfo: {
      sources: string;
      effects: string;
    };
  }>;
  healthRecommendations: {
    generalPopulation: string;
    elderly: string;
    lungDiseasePopulation: string;
    heartDiseasePopulation: string;
    athletes: string;
    pregnantWomen: string;
    children: string;
  };
}

export interface GoogleAirQualityResponse {
  indexes: Array<{
    code: string;
    displayName: string;
    aqi: number;
    aqiDisplay: string;
    color: {
      red: number;
      green: number;
      blue: number;
    };
    category: string;
  }>;
  pollutants: Array<{
    code: string;
    displayName: string;
    fullName: string;
    concentration: {
      value: number;
      units: string;
    };
    additionalInfo: {
      sources: string;
      effects: string;
    };
  }>;
  healthRecommendations: {
    generalPopulation: string;
    elderly: string;
    lungDiseasePopulation: string;
    heartDiseasePopulation: string;
    athletes: string;
    pregnantWomen: string;
    children: string;
  };
}

/**
 * Get current air quality data from Google Air Quality API
 */
export const getGoogleAirQualityData = async (
  latitude: number,
  longitude: number
): Promise<GoogleAirQualityData | null> => {
  try {
    if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not found, cannot get air quality data');
      return null;
    }

    const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`;
    
    const requestBody = {
      universalAqi: true,
      location: {
        latitude: latitude,
        longitude: longitude,
      },
      extraComputations: [
        "HEALTH_RECOMMENDATIONS",
        "DOMINANT_POLLUTANT",
        "POLLUTANT_CONCENTRATION",
        "LOCAL_AQI",
        "POLLUTANT_ADDITIONAL_INFO"
      ],
      languageCode: "en"
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google Air Quality API error: ${response.status}`);
    }

    const data: GoogleAirQualityResponse = await response.json();
    
    // Find the universal AQI index
    const universalIndex = data.indexes?.find(index => index.code === 'uaqi');
    
    if (!universalIndex) {
      console.warn('No universal AQI data found');
      return null;
    }

    // Get the dominant pollutant
    const dominantPollutant = data.pollutants?.[0]?.code || 'unknown';
    
    const airQualityData: GoogleAirQualityData = {
      universalAqi: universalIndex.aqi,
      dominantPollutant: dominantPollutant,
      indexes: data.indexes || [],
      pollutants: data.pollutants || [],
      healthRecommendations: data.healthRecommendations || {
        generalPopulation: 'Air quality data unavailable',
        elderly: 'Air quality data unavailable',
        lungDiseasePopulation: 'Air quality data unavailable',
        heartDiseasePopulation: 'Air quality data unavailable',
        athletes: 'Air quality data unavailable',
        pregnantWomen: 'Air quality data unavailable',
        children: 'Air quality data unavailable',
      },
    };

    return airQualityData;
  } catch (error) {
    console.error('Error fetching Google air quality data:', error);
    return null;
  }
};

/**
 * Get air quality status from Google AQI
 */
export const getGoogleAirQualityStatus = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

/**
 * Get air quality recommendation from Google data
 */
export const getGoogleAirQualityRecommendation = (
  aqi: number,
  healthRecommendations?: GoogleAirQualityData['healthRecommendations']
): string => {
  // Use Google's specific health recommendations if available
  if (healthRecommendations?.generalPopulation) {
    return healthRecommendations.generalPopulation;
  }
  
  // Fallback to generic recommendations
  if (aqi <= 50) return 'Air quality is good. Enjoy outdoor activities!';
  if (aqi <= 100) return 'Air quality is moderate. Sensitive individuals should consider reducing outdoor activities.';
  if (aqi <= 150) return 'Unhealthy for sensitive groups. Limit prolonged outdoor exertion.';
  if (aqi <= 200) return 'Unhealthy air quality. Everyone should avoid prolonged outdoor exertion.';
  if (aqi <= 300) return 'Very unhealthy air quality. Avoid outdoor activities.';
  return 'Hazardous air quality. Stay indoors and avoid all outdoor activities.';
};

/**
 * Map Google AQI to risk level
 */
export const mapGoogleAqiToRiskLevel = (aqi: number): 'low' | 'moderate' | 'high' | 'severe' => {
  if (aqi <= 50) return 'low';
  if (aqi <= 100) return 'low';
  if (aqi <= 150) return 'moderate';
  if (aqi <= 200) return 'high';
  return 'severe';
};

/**
 * Get detailed pollutant information
 */
export const getPollutantDetails = (pollutants: GoogleAirQualityData['pollutants']): string => {
  if (!pollutants || pollutants.length === 0) {
    return 'No detailed pollutant data available';
  }

  const mainPollutant = pollutants[0];
  const concentration = mainPollutant.concentration;
  
  return `${mainPollutant.displayName}: ${concentration.value} ${concentration.units}`;
}; 