export interface AirQualityData {
  aqi: number;
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
  dt: number;
}

export interface AirQualityResponse {
  coord: [number, number];
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }>;
}

import { API_CONFIG } from '../config/api';

export const getAirQualityData = async (
  latitude: number,
  longitude: number
): Promise<AirQualityData | null> => {
  try {
    if (!API_CONFIG.OPENWEATHER_API_KEY) {
      console.warn('OpenWeather API key not found, using mock data');
      return null;
    }

    const response = await fetch(
      `${API_CONFIG.OPENWEATHER_BASE_URL}${API_CONFIG.AIR_QUALITY_ENDPOINT}?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.OPENWEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AirQualityResponse = await response.json();
    
    if (!data.list || data.list.length === 0) {
      throw new Error('No air quality data available');
    }

    const current = data.list[0];
    
    return {
      aqi: current.main.aqi,
      co: current.components.co,
      no: current.components.no,
      no2: current.components.no2,
      o3: current.components.o3,
      so2: current.components.so2,
      pm2_5: current.components.pm2_5,
      pm10: current.components.pm10,
      nh3: current.components.nh3,
      dt: current.dt,
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return null;
  }
};

export const getAirQualityStatus = (aqi: number): string => {
  switch (aqi) {
    case 1: return 'Good';
    case 2: return 'Fair';
    case 3: return 'Moderate';
    case 4: return 'Poor';
    case 5: return 'Very Poor';
    default: return 'Unknown';
  }
};

export const getAirQualityRecommendation = (aqi: number): string => {
  switch (aqi) {
    case 1: return 'Air quality is satisfactory, and air pollution poses little or no risk';
    case 2: return 'Air quality is acceptable for most people, though sensitive individuals may experience minor issues';
    case 3: return 'Members of sensitive groups may experience health effects. Limit prolonged outdoor exertion';
    case 4: return 'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion';
    case 5: return 'Health alert: everyone may experience serious health effects. Avoid all outdoor exertion';
    default: return 'Air quality data unavailable';
  }
};

export const mapAqiToRiskLevel = (aqi: number): 'low' | 'moderate' | 'high' | 'severe' => {
  switch (aqi) {
    case 1: return 'low';
    case 2: return 'low';
    case 3: return 'moderate';
    case 4: return 'high';
    case 5: return 'severe';
    default: return 'low';
  }
}; 