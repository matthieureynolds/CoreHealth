// API Configuration
export const API_CONFIG = {
  // OpenWeather API Key
  // Get your free API key at: https://openweathermap.org/api
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  
  // OpenWeather API Base URL
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // OpenWeather API endpoints
  WEATHER_ENDPOINT: '/weather',
  AIR_QUALITY_ENDPOINT: '/air_pollution',
  UV_INDEX_ENDPOINT: '/uvi',

  // Google Maps API Key
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyB3IChMH_lt7BVxERt5OR5oi8IMHNToLFE',
  
  // Google Maps API Base URL
  GOOGLE_MAPS_BASE_URL: 'https://maps.googleapis.com/maps/api',
  
  // Google Maps API Endpoints
  GEOCODING_ENDPOINT: '/geocode/json',
  TIMEZONE_ENDPOINT: '/timezone/json',
  PLACES_ENDPOINT: '/place/nearbysearch/json',
};

// API validation
export const validateApiKeys = () => {
  const missing = [];
  
  if (!API_CONFIG.OPENWEATHER_API_KEY) {
    missing.push('EXPO_PUBLIC_OPENWEATHER_API_KEY');
  }
  
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY || API_CONFIG.GOOGLE_MAPS_API_KEY === 'your-key-here') {
    missing.push('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
  }
  
  if (missing.length > 0) {
    console.warn('Missing API keys:', missing.join(', '));
    console.warn('To get real travel health data, please:');
    console.warn('1. OpenWeather: https://openweathermap.org/api');
    console.warn('2. Google Maps: https://console.cloud.google.com/');
    console.warn('3. Add API keys to your .env file');
    console.warn('4. Restart your development server');
  }
  
  return missing.length === 0;
}; 